# 熟恋（うれこい）urekoi

熟女専門マッチングアプリ。Go + Next.js のモノレポ構成。

![検索画面](apps/web/public/readme.png)

## ドキュメント

- REST API仕様: https://koudai001.github.io/urekoi/ (ReDoc, [docs/openapi.yaml](docs/openapi.yaml)から生成)
- WebSocket仕様: https://urekoi-async-api.netlify.app/ (AsyncAPI, [docs/asyncapi.yaml](docs/asyncapi.yaml)から生成。ハンドシェイク自体はopenapi.yamlの`POST /ws/ticket`・`GET /ws`を参照)
- DBテーブル定義: [docs/table-definitions.md](docs/table-definitions.md)(ER図)
- AWS本番環境の構成図: [docs/aws-infra.md](docs/aws-infra.md)

## フロントエンド

- TypeScript 5.7
- Next.js 16(App Router)
- React 19
- pnpm(パッケージマネージャ)
- Tailwind CSS v4
- shadcn/ui(UIコンポーネント)
- lucide-react(アイコン)
- React Hook Form + Zod(フォーム状態管理・バリデーション)
- SWR(クライアント側のポーリング・キャッシュ付きデータ取得)
- react-use-websocket(WebSocket接続・再接続ロジック)
- orval(OpenAPI仕様からAPIクライアントを自動生成)
- ESLint(eslint-config-next)
- Prettier
- Vitest(`vitest.config.ts`で2つのprojectに分割)
  - `storybook`: @storybook/addon-vitestでStorybookのplay関数をテストとして実行。Playwright(chromium)のブラウザモードで実行するため、初回は`pnpm exec playwright install chromium`が必要。`pnpm test:storybook`
  - `unit`: Server Actionなどブラウザ不要なロジックをNode環境でテスト。`pnpm test:unit`
- Storybook v10(コンポーネント単位の開発・play関数によるインタラクションテスト)
  - @storybook/addon-mcp(StorybookをMCPサーバー化し、AIコーディングエージェントが起動中のコンポーネント状態を直接参照できる)
- Chromatic(StorybookのビジュアルテストSaaS。PR時にレビュー用リンクを生成)

## バックエンド

- Go 1.26
- Gin v1.12(Webフレームワーク)
- GORM v1.31(ORM, PostgreSQLドライバ使用)
- PostgreSQL
- golang-jwt/jwt v5(JWTによるアクセストークン)
- golang.org/x/crypto/bcrypt(パスワードハッシュ化)
- testify(テスト, sqliteドライバでDBをインメモリ化)
- ozzo-validation v4(リクエストのバリデーション)
- golangci-lint v2(複数のlinterをまとめて実行)
- クリーンアーキテクチャ(controllers / usecases / repositories / models)
- Atlas(GORMモデルからマイグレーションSQLを自動生成)
- golang-migrate v4(マイグレーションの適用)
- Redis + go-redis v9(WS認証チケットの保管、複数インスタンス間のPub/Subによるリアルタイム配信)
- gorilla/websocket(WebSocketサーバー)
- alicebob/miniredis(テスト用のin-memory Redis)
- @redocly/cli(OpenAPI仕様のlint・ドキュメント生成)
- @asyncapi/cli(AsyncAPI仕様のvalidate・ドキュメント生成)

## インフラ

### 本番/AWS

- Terraform([infra/](infra/)、`terraform apply`/`terraform destroy`で構築・削除)
- ECS Fargate(APIサーバー、タスク1つ)
- RDS PostgreSQL(Single-AZ)
- ElastiCache Redis
- ALB + ACM(HTTPS)
- ECR(Dockerイメージ)
- S3 + CloudFront(プロフィール写真)
- Secrets Manager(DBパスワード・SECRET管理)

### 検証環境

- フロントエンド: https://v0-ui-chi-six.vercel.app (Vercel)
- APIサーバー: Render (URLは非公開)
- DB: Render PostgreSQL
- Redis: Render Key Value

### ローカル環境

- DB・Redisをコンテナ化(`docker-compose up -d`)
- DBクライアント: pgAdmin
- APIサーバー: `cd apps/api && go run .`(`docker-compose.yml`の`api`サービスは、本番用Dockerfileの動作確認用。普段の開発では使わない)
- フロントエンド: `cd apps/web && pnpm dev` → [http://localhost:3000](http://localhost:3000)

## CI/CD

- Husky + lint-staged(コミット時にFE: prettier/eslint、BE: gofmtを自動実行。pre-pushでCI相当のチェックも実行。[.husky/pre-push](.husky/pre-push))
- GitHub Actions(PR作成時にFE/BEのlint・テスト・ビルド、api-client同期チェック、actionlintを実行。[.github/workflows/ci.yml](.github/workflows/ci.yml))
- Render(GoのAPIサーバー。mainへのpush + CI通過で自動デプロイ)
- Vercel(Next.jsフロントエンド。mainへのpush + CI通過で自動デプロイ)
- GitHub Pages(REST APIドキュメント。mainへのdocs/openapi.yaml変更時にGitHub Actionsがビルドして自動デプロイ。[.github/workflows/deploy-openapi-docs.yml](.github/workflows/deploy-openapi-docs.yml))
- Netlify(WebSocket(AsyncAPI)ドキュメント。mainへのマージで自動デプロイ)
- GitHub Actions(本番/AWS: Terraform apply→イメージビルド→ECR push→ECSサービス更新を自動化する予定。未実装)

## ブランチ戦略

- `main`: 本番(AWS)
- `dev`: 検証環境(Render + Vercel)
  にする予定...今はmainが検証環境
