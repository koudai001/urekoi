resource "aws_lb" "main" {
  name               = "urekoi"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_c.id]

  # WebSocketのping/pong間隔(30秒)より長くする
  idle_timeout = 60

  tags = {
    Name = "urekoi"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "urekoi-api"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Fargateはip指定が必須

  health_check {
    path = "/health"
  }

  tags = {
    Name = "urekoi-api"
  }
}

# HTTPは全部HTTPSにリダイレクトする
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  # ACM証明書でHTTPS通信を終端する
  certificate_arn = aws_acm_certificate.api.arn

  default_action {
    # 受け取ったリクエストを、指定先に転送
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}
