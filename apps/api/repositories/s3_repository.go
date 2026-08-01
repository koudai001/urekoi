package repositories

import (
	"context"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// アップロード用に発行する署名付きURLの有効期限
const presignExpiry = 5 * time.Minute

// keyはアップロードのたびにランダムな値で発行され、同じkeyの中身が後から変わることは無いため長期キャッシュしてよい
// Content-Typeと同様に署名対象のヘッダーとなるため、フロント側で実際にPUTする際もこの値と完全一致させる必要がある
const profileImageCacheControl = "public, max-age=31536000, immutable"

type IS3Repository interface {
	// keyへのアップロード用の署名付きPUT URLを発行する
	PresignUpload(key string, contentType string) (string, error)
	// keyのオブジェクトを削除する
	DeleteObject(key string) error
}

type S3Repository struct {
	s3Client *s3.Client
	bucket   string
}

// コンストラクタ
func NewS3Repository(client *s3.Client) IS3Repository {
	return &S3Repository{
		s3Client: client,
		bucket:   os.Getenv("S3_BUCKET"),
	}
}

func (r *S3Repository) PresignUpload(key string, contentType string) (string, error) {
	presignClient := s3.NewPresignClient(r.s3Client)

	// 署名生成用のクライアントを作成し、PUT操作用の署名付きURL（リクエスト情報）を生成する
	req, err := presignClient.PresignPutObject(context.Background(), &s3.PutObjectInput{
		Bucket:       aws.String(r.bucket),
		Key:          aws.String(key),
		ContentType:  aws.String(contentType),
		CacheControl: aws.String(profileImageCacheControl),
	}, s3.WithPresignExpires(presignExpiry))
	if err != nil {
		return "", err
	}

	return req.URL, nil
}

func (r *S3Repository) DeleteObject(key string) error {
	// S3のオブジェクトを削除する
	_, err := r.s3Client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})

	return err
}
