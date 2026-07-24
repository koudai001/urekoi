# urekoi 本番環境インフラ構成(AWS, api単体)

```mermaid
flowchart TB
    User[ユーザー] -->|ページ読み込み| Vercel[Vercel<br/>Next.js frontend]
    User -->|WebSocket wss:// 直接接続| R53[Route53]
    User -->|プロフィール写真の閲覧| CF[CloudFront]
    Vercel -->|REST API呼び出し HTTPS<br/>サーバー間| ALB1

    R53 --> ALB1

    subgraph AWS["AWS ap-northeast-1 (Tokyo)"]
        subgraph VPC["VPC"]
            subgraph AZ1["AZ: 1a"]
                subgraph PubA["Public Subnet"]
                    NAT[NAT Gateway]
                    ALB1[ALB]
                end
                subgraph PrivA["Private Subnet"]
                    ECS1["ECS Fargate task<br/>apiタスク1つ"]
                    RDS[(RDS PostgreSQL<br/>Single-AZ)]
                    Redis[(ElastiCache Redis)]
                end
            end

            subgraph AZ2["AZ: 1c"]
                subgraph PubC["Public Subnet"]
                    ALB2[ALB]
                end
                subgraph PrivC["Private Subnet"]
                end
            end
        end

        S3[(S3<br/>プロフィール写真)]
        CF --> S3
        ECS1 -.->|署名付きURL発行のみ<br/>本体アップロードは直接S3へ| S3

        ECR[ECR<br/>apiイメージ]
        CWL["CloudWatch Logs<br/>(apiのログ)"]
        SM["Secrets Manager<br/>(RDSパスワード・SECRET)"]
        ECS1 -.->|ログ送信| CWL
        ECS1 -.->|起動時に読み込み| SM
    end

    ALB1 --> ECS1
    ECS1 --> RDS
    ECS1 --> Redis
    ECR -.->|pull| NAT
    NAT -.->|pull| ECS1

    GHA[GitHub Actions] -->|build & push| ECR
    GHA -->|update service| ECS1
```

## 補足

- Next.jsはVercel。AWSに載せるのはGoのAPIのみ
- VPCはAZを2つ(1a/1c)に分ける。ALBがAWSの仕様上2AZ以上のサブネットを要求
- NAT Gatewayは1つだけ(2AZ分作らずコストを抑える)。private subnetのECS taskがECR等にアクセスする経路として使う
- RDSはコスト優先でSingle-AZ(Multi-AZにすると料金が倍になるため)
- ECR: apiのDockerイメージ置き場
- S3 + CloudFront: プロフィール写真アップロード用(未実装。APIは署名付きURLの発行のみ行い、アップロード本体はブラウザから直接S3へ、閲覧はCloudFront経由)
- GitHub Actions: イメージビルド→ECR push→ECSサービス更新までを自動化する予定(未実装)
- ドメインのCNAME・ACM検証レコードは、mixhostのcPanel APIを使って自動設定する予定(未実装。今は手動でmixhostの管理画面に追加している)
- Terraformで`terraform destroy`だけで綺麗に全リソースを削除できるようにする
  - RDSは`skip_final_snapshot = true`(destroy時にスナップショットを残さない)
  - ECRは`force_delete = true`(イメージが残っててもリポジトリごと削除できるようにする)
