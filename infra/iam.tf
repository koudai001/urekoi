# ECSがこのロールを引き受けられるようにする(信頼ポリシー)
data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    # ロールを引き受けることを許可
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# ECS Task Executionロール： ECSタスクがECRからイメージをpullしたり、CloudWatch Logsにログを書き込むために必要なIAMロール
resource "aws_iam_role" "ecs_task_execution" {
  name               = "urekoi-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

# マネージドポリシー（ECRからのイメージpull、CloudWatch Logsへのログ書き込み）をECS Task Executionロールにアタッチ
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# タスク定義のsecretsで指定した値を、起動時にSecrets Managerから読むための権限
data "aws_iam_policy_document" "ecs_task_execution_secrets" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.app.arn]
  }
}

# ECS Task ExecutionロールにSecrets Managerから値を読む権限を付与
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name   = "urekoi-ecs-task-execution-secrets"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_task_execution_secrets.json
}

# ECS Taskロール: アプリ自身(APIサーバー)がAWSを操作するための権限
resource "aws_iam_role" "ecs_task" {
  name               = "urekoi-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

# ECS Taskロールにアタッチするポリシーを作成
resource "aws_iam_role_policy" "ecs_task" {
  name   = "urekoi-ecs-task"
  role   = aws_iam_role.ecs_task.id
  policy = data.aws_iam_policy_document.ecs_task.json
}

# プロフィール写真アップロード用の署名付きURL発行に必要な権限
data "aws_iam_policy_document" "ecs_task" {
  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:GetObject"]
    resources = ["${aws_s3_bucket.profile_images.arn}/*"]
  }
}
