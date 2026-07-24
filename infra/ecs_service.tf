resource "aws_ecs_service" "api" {
  name            = "urekoi-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  launch_type     = "FARGATE"
  desired_count   = 1 # コスト優先で1つだけ

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_c.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false # privateサブネットなので不要
  }

  // ALBのターゲットグループに登録する
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }

  # ALBのリスナーが出来上がってからサービスを作る
  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "urekoi-api"
  }
}
