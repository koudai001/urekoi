# プロフィール写真の保存先
resource "aws_s3_bucket" "profile_images" {
  bucket = "urekoi-profile-images"

  # terraform destroy時に中身が残っててもバケットごと削除できるようにする
  force_destroy = true

  tags = {
    Name = "urekoi-profile-images"
  }
}

# アクセスブロック機能：閲覧はCloudFront経由のみ
resource "aws_s3_bucket_public_access_block" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  # 新しく「一般公開用」の鍵（ACL）を作らせない
  block_public_acls = true
  # 新しく「一般公開用」のポリシーを作らせない
  block_public_policy = true
  # 既存の「一般公開用」の鍵（ACL）を無効化する
  ignore_public_acls = true
  # 公開ポリシーが設定されていても、一般ユーザーからのアクセスを遮断
  restrict_public_buckets = true
}

# CloudFront(OAC)からだけS3を読めるようにするバケットポリシー
resource "aws_s3_bucket_policy" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # Statement ID
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        # S3バケットの中にあるすべてのファイル
        Resource = "${aws_s3_bucket.profile_images.arn}/*"
        Condition = {
          # アクセスしてきたCloudFrontのARNが、今回作ったCloudFrontのARNと一致する場合のみ許可する
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.profile_images.arn
          }
        }
      }
    ]
  })
}
