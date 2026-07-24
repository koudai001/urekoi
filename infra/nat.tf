# 固定publicIPを取得
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "urekoi-nat"
  }
}

# NAT Gatewayは1つだけ（1a側に配置)
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id         // 固定IP
  subnet_id     = aws_subnet.public_a.id // public-subnet-aに配置

  tags = {
    Name = "urekoi"
  }

  // IGWが作成された後に作成するようにする
  depends_on = [aws_internet_gateway.main]
}
