variable "domain_name" {
  description = "APIサーバーのドメイン名"
  type        = string
  default     = "u-api.ksystem01.com"
}

# ACM証明書（SSL/TLS証明書）を作成する
resource "aws_acm_certificate" "api" {
  domain_name = var.domain_name
  # DNS検証方式を使用（DNSレコード追加で所有権を確認）
  validation_method = "DNS"

  # 古い証明書が削除される前に新しいものを作成
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "urekoi-api"
  }
}
