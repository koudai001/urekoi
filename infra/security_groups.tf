# ALB: インターネットからのHTTP/HTTPSを受け付ける。websocketはプロトコルアップグレード
resource "aws_security_group" "alb" {
  name        = "urekoi-alb"
  description = "ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // 全てのアウトバウンド通信を許可する
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "urekoi-alb"
  }
}

# ECS task(api): ALBからの通信だけ受け付ける
resource "aws_security_group" "ecs" {
  name        = "urekoi-ecs"
  description = "ECS task (api)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "urekoi-ecs"
  }
}

# RDS: ECS taskからの通信だけ受け付ける
resource "aws_security_group" "rds" {
  name        = "urekoi-rds"
  description = "RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "from ECS task"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "urekoi-rds"
  }
}

# ElastiCache: ECS taskからの通信だけ受け付ける
resource "aws_security_group" "redis" {
  name        = "urekoi-redis"
  description = "ElastiCache Redis"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "from ECS task"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "urekoi-redis"
  }
}
