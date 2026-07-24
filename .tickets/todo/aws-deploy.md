# 本番環境をAWSに構築する(検証環境はVercel+Renderのまま)

## やること

- [ ] VPC/サブネット構成
- [ ] ECR: web(Next.js)・api(Go)のリポジトリ作成
- [ ] RDS PostgreSQL構築
- [ ] ElastiCache Redis構築
- [ ] ECS Fargateクラスタ・サービス(web/api、2つ)構築
- [ ] ALB + Route53 + ACMでドメイン・HTTPS設定
- [ ] Secrets Manager/SSMで環境変数(SECRET・DB認証情報など)管理
- [ ] GitHub Actionsでイメージビルド→ECR push→ECSデプロイのCI/CDを構築
- [ ] RDSのSSL必須設定を戻し、apps/api側もsslmode=requireで接続できるようにする(今はforce_ssl=0で疎通確認のみ)

aws sts get-caller-identityでAWS CLIの認証情報が有効か確認

IAM作成

Terraformをローカルにインストール(brew install terraform)

Terraformプロジェクトの雛形を作成(provider設定、tfstateの保存方法を決める)

VPC(2AZ・NAT Gateway1つ)から順に、ECR→RDS→ElastiCache→ECS→ALBの順でリソースを1つずつ書いてterraform planで確認しながら進める

一通り書けたらterraform apply(ここで初めて実際に課金対象のリソースが作られます)

動作確認後、不要ならterraform destroy
