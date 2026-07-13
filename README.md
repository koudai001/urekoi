# 熟恋（うれこい）urekoi

熟女専門マッチングアプリ。Go + Next.js のモノレポ構成。

![検索画面](apps/web/public/readme.png)

## 技術スタック

### フロントエンド
- TypeScript 5.7
- Next.js 16(App Router)
- React 19
- pnpm(パッケージマネージャ)
- Tailwind CSS v4
- shadcn/ui(UIコンポーネント)
- lucide-react(アイコン)
- React Hook Form + Zod(フォーム状態管理・バリデーション)
- orval(OpenAPI仕様からAPIクライアントを自動生成)
- @redocly/cli(OpenAPI仕様のlint・ローカルプレビュー)
- ESLint(eslint-config-next)
- Prettier
- Vitest(`vitest.config.ts`で2つのprojectに分割)
  - `storybook`: @storybook/addon-vitestでStorybookのplay関数をテストとして実行。Playwright(chromium)のブラウザモードで実行するため、初回は`pnpm exec playwright install chromium`が必要。`pnpm test:storybook`
  - `unit`: Server Actionなどブラウザ不要なロジックをNode環境でテスト。`pnpm test:unit`
- Storybook v10(コンポーネント単位の開発・play関数によるインタラクションテスト)
  - @storybook/addon-mcp(StorybookをMCPサーバー化し、AIコーディングエージェントが起動中のコンポーネント状態を直接参照できる)
- Chromatic(StorybookのビジュアルテストSaaS。PR時にレビュー用リンクを生成)

### バックエンド
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

### CI/CD
- Husky + lint-staged(コミット時にFE: prettier/eslint、BE: gofmtを自動実行。pre-pushでCI相当のチェックも実行。[.husky/pre-push](.husky/pre-push))
- GitHub Actions(PR時にFE/BEのlint・テスト・ビルド、api-client同期チェック、actionlintを実行。[.github/workflows/ci.yml](.github/workflows/ci.yml))
- Render(GoのAPIサーバー。mainへのpush + CI通過で自動デプロイ)
- Vercel(Next.jsフロントエンド。mainへのpush + CI通過で自動デプロイ)

## インフラ

### 検証環境
- フロントエンド: https://v0-ui-chi-six.vercel.app (Vercel)
- APIサーバー: Render (URLは非公開)
- DB: Render PostgreSQL

本番環境はAWS想定。

## ドキュメント
- API仕様: https://koudai001.github.io/urekoi/ (ReDoc, [docs/openapi.yaml](docs/openapi.yaml)から生成)
- DBテーブル定義: [apps/api/models/](apps/api/models/)(AtlasがGORMモデルからマイグレーションを生成するため、モデルが正)

## ローカル環境
- 現状DBのみコンテナ化(`docker-compose up -d`)
- DBクライアント: pgAdmin
- フロントエンド: `cd apps/web && pnpm dev` → [http://localhost:3000](http://localhost:3000)
