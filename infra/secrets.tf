# JWT署名等に使うSECRETをランダム生成する
resource "random_password" "app_secret" {
  length  = 32
  special = false
}

# 保管するシークレットを指定
resource "aws_secretsmanager_secret" "app" {
  name                    = "urekoi/app"
  recovery_window_in_days = 0 # destroy時すぐ削除できるようにする

  tags = {
    Name = "urekoi"
  }
}

# 中身の値を設定する
resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    POSTGRES_PASSWORD = random_password.rds.result
    SECRET            = random_password.app_secret.result
  })
}
