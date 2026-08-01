package seed

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const seedProfileImageCacheControl = "public, max-age=31536000, immutable"

// api/seed/assets/profiles 配下の画像を埋め込んで、ローカルの MinIO に流し込む。

//go:embed assets/profiles/*
var seedProfileImagesFS embed.FS

// ローカル開発用のプロフィール画像を、埋め込み済みアセットから MinIO に投入する。
func SeedDummyProfileImages(s3Client *s3.Client) error {
	// ダミープロフィールごとに、紐づく画像を順番に MinIO へ上げる。
	for _, profile := range dummyProfiles {
		// ImageKeys に入っている画像 key を、そのまま seed 用の実ファイルとして読む。
		for _, imageKey := range profile.ImageKeys {
			if err := uploadSeedImage(s3Client, imageKey); err != nil {
				return err
			}
		}
	}

	return nil
}

func uploadSeedImage(s3Client *s3.Client, imageKey string) error {
	// 埋め込み済みアセットから、MinIO に上げる元画像を読み込む。
	assetPath := "assets/" + imageKey
	content, err := seedProfileImagesFS.ReadFile(assetPath)
	if err != nil {
		return fmt.Errorf("failed to read seed image %s: %w", assetPath, err)
	}

	// 拡張子から Content-Type を決める。
	contentType := "image/png"
	if strings.HasSuffix(strings.ToLower(imageKey), ".jpg") || strings.HasSuffix(strings.ToLower(imageKey), ".jpeg") {
		contentType = "image/jpeg"
	}

	// 画像の保存先 bucket は環境変数で受け取る。
	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		return fmt.Errorf("S3_BUCKET is empty")
	}

	// 画像本体を bucket に PUT する。Cache-Control は通常のアップロードと合わせる。
	if _, err := s3Client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket:       aws.String(bucket),
		Key:          aws.String(imageKey),
		Body:         bytes.NewReader(content),
		ContentType:  aws.String(contentType),
		CacheControl: aws.String(seedProfileImageCacheControl),
	}); err != nil {
		return fmt.Errorf("failed to upload seed image %s: %w", imageKey, err)
	}

	return nil
}
