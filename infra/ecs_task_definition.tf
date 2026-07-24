resource "aws_ecs_task_definition" "api" {
  family                   = "urekoi-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc" # Fargateは必須
  cpu                      = "256"
  memory                   = "512"

  # task execution roleをアタッチ
  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  # task roleをアタッチ
  task_role_arn = aws_iam_role.ecs_task.arn

  # ローカル(Apple Silicon)でビルドしたイメージがARM64のため合わせる
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  # コンテナ定義
  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${aws_ecr_repository.api.repository_url}:latest"
      # このコンテナが停止したらタスク全体を停止する
      essential = true

      # 8080->8080
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "GO_ENV", value = "production" },
        { name = "PORT", value = "8080" },
        { name = "POSTGRES_HOST", value = aws_db_instance.main.address },
        { name = "POSTGRES_PORT", value = "5432" },
        { name = "POSTGRES_USER", value = "urekoi" },
        { name = "POSTGRES_DB", value = "urekoi" },
        { name = "REDIS_HOST", value = aws_elasticache_cluster.main.cache_nodes[0].address },
        { name = "REDIS_PORT", value = "6379" },
        { name = "WS_PONG_WAIT_MS", value = "30000" },
        { name = "API_DOMAIN", value = var.domain_name },
      ]

      secrets = [
        { name = "POSTGRES_PASSWORD", valueFrom = "${aws_secretsmanager_secret.app.arn}:POSTGRES_PASSWORD::" },
        { name = "SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:SECRET::" },
      ]

      # CloudWatch Logsに出力するように設定
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "api"
        }
      }
    }
  ])

  tags = {
    Name = "urekoi-api"
  }
}
