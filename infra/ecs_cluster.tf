resource "aws_ecs_cluster" "main" {
  name = "urekoi"

  tags = {
    Name = "urekoi"
  }
}
