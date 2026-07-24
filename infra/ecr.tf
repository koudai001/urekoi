resource "aws_ecr_repository" "api" {
  name = "urekoi-api"

  # イメージが残っててもリポジトリごと削除できるようにする(terraform destroy用)
  force_delete = true

  tags = {
    Name = "urekoi-api"
  }
}
