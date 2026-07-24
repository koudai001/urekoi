# OAC（認証）の設定
resource "aws_cloudfront_origin_access_control" "profile_images" {
  name                              = "urekoi-profile-images"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "profile_images" {
  enabled = true

  # S3バケットをオリジンとして指定
  origin {
    domain_name              = aws_s3_bucket.profile_images.bucket_regional_domain_name
    origin_id                = "s3-profile-images"
    origin_access_control_id = aws_cloudfront_origin_access_control.profile_images.id
  }

  # キャッシュと通信のルール
  default_cache_behavior {
    target_origin_id       = "s3-profile-images"
    viewer_protocol_policy = "redirect-to-https"
    # この2つの通信だけを「通過」
    allowed_methods = ["GET", "HEAD"]
    # 通過した通信のうち、この2つの結果をCloudFrontに「キャッシュ」
    cached_methods = ["GET", "HEAD"]

    # クエリパラメータやクッキーをすべて無視してキャッシュ
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    # 国や地域によるアクセスブロックを行わない
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL証明書の設定（デフォルトのCloudFront証明書を使用）
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "urekoi-profile-images"
  }
}
