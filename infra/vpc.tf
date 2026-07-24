# VPC
resource "aws_vpc" "main" {
  # プライベートIPアドレスの範囲を指定する
  cidr_block = "10.0.0.0/16"
  # DNS解決を有効化
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "urekoi"
  }
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "urekoi"
  }
}
