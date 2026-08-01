package infra

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3mock "github.com/grafana/s3-mock"
)

// GO_ENVに応じてS3互換オブジェクトストレージ(test: インメモリの偽S3, local: MinIO, dev: Cloudflare R2, prod: AWS S3)への接続を初期化する
func SetupS3() *s3.Client {
	ctx := context.Background()
	env := os.Getenv("GO_ENV")

	var (
		cfg    aws.Config
		err    error
		optFns []func(*s3.Options)
	)

	switch env {
	case "test":
		// インメモリの偽S3サーバーを使う
		client, _, err := s3mock.New()
		if err != nil {
			panic("Failed to start fake object storage: " + err.Error())
		}

		bucket := os.Getenv("S3_BUCKET")
		if _, err := client.CreateBucket(ctx, &s3.CreateBucketInput{Bucket: aws.String(bucket)}); err != nil {
			panic("Failed to create test bucket: " + err.Error())
		}

		log.Printf("Setup s3 (GO_ENV=test, bucket=%s)", bucket)

		return client
	case "local", "dev":
		// MinIO/Cloudflare R2: 固定のアクセスキーで認証し、指定したエンドポイントにpath-styleで接続する
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(os.Getenv("S3_REGION")),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
				os.Getenv("S3_ACCESS_KEY"),
				os.Getenv("S3_SECRET_KEY"),
				"",
			)),
			// SDKがデフォルトで付与するx-amz-sdk-checksum-algorithm等は署名対象に含まれるが、
			// ブラウザからの直PUTはそのヘッダーを送らないためSignatureDoesNotMatchになる。付与自体を止める
			config.WithRequestChecksumCalculation(aws.RequestChecksumCalculationWhenRequired),
		)
		optFns = append(optFns, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(os.Getenv("S3_ENDPOINT"))
			o.UsePathStyle = true
		})
	case "prod":
		// AWS S3(本番): ECSタスクロールの認証情報をそのまま使うため、Credentialsは指定しない
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(os.Getenv("S3_REGION")),
			config.WithRequestChecksumCalculation(aws.RequestChecksumCalculationWhenRequired),
		)
	default:
		panic("Unknown GO_ENV: " + env)
	}

	if err != nil {
		panic("Failed to load object storage config: " + err.Error())
	}

	log.Printf("Setup s3 (GO_ENV=%s, bucket=%s)", env, os.Getenv("S3_BUCKET"))

	return s3.NewFromConfig(cfg, optFns...)
}
