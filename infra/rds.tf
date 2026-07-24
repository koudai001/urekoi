# RDSを配置する候補サブネット（single-az）
resource "aws_db_subnet_group" "main" {
  name = "urekoi"
  # サブネット候補
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = {
    Name = "urekoi"
  }
}

# マスターパスワードをランダム生成する
resource "random_password" "rds" {
  length  = 32
  special = false
}

# 一時的にSSL必須を解除(疎通確認用。後でコード側をsslmode=requireに対応させて戻す)
resource "aws_db_parameter_group" "main" {
  name   = "urekoi"
  family = "postgres17"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  tags = {
    Name = "urekoi"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "urekoi"
  engine         = "postgres"
  engine_version = "17"
  instance_class = "db.t4g.micro"

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "urekoi"
  username = "urekoi"
  password = random_password.rds.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az = false # コスト優先でSingle-AZ

  skip_final_snapshot = true # コスト優先 terraform destroy時にスナップショットを残さない

  tags = {
    Name = "urekoi"
  }
}
