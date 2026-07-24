# apiコンテナのログ置き場
resource "aws_cloudwatch_log_group" "api" {
  name = "/ecs/urekoi-api"
  # ログ保持期間を14日間に設定
  retention_in_days = 14

  tags = {
    Name = "urekoi-api"
  }
}
