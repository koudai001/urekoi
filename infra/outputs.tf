# u-api.ksystem01.comのCNAMEレコードとして、mixhost管理画面に手動で追加
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

# 証明書の検証に必要なDNSレコードの情報(mixhost管理画面でCNAMEレコードを追加するために使用)
output "acm_validation_record" {
  value = {
    name  = tolist(aws_acm_certificate.api.domain_validation_options)[0].resource_record_name
    type  = tolist(aws_acm_certificate.api.domain_validation_options)[0].resource_record_type
    value = tolist(aws_acm_certificate.api.domain_validation_options)[0].resource_record_value
  }
}

# docker build/pushの際のpush先
output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}
