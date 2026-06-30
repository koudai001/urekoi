# urekoi

熟女専門マッチングアプリ。Go + Next.js のモノレポ構成。

## 技術スタック

### フロントエンド
- TypeScript 5.7
- Next.js 16(App Router)
- React 19
- pnpm(パッケージマネージャ)
- Tailwind CSS v4
- shadcn/ui(UIコンポーネント)
- lucide-react(アイコン)
- orval(OpenAPI仕様からAPIクライアントを自動生成)
- @redocly/cli(OpenAPI仕様のlint・ローカルプレビュー)
- ESLint(eslint-config-next)
- Prettier
- Vitest(@storybook/addon-vitestでStorybookのplay関数をテストとして実行。Playwright(chromium)のブラウザモードで実行するため、初回は`pnpm exec playwright install chromium`が必要)
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

### 開発ツール
- Husky + lint-staged(コミット時にFE: prettier/eslint、BE: gofmtを自動実行)
- GitHub Actions(PR時にFE: format/lint/typecheck/test/build、BE: gofmt/vet/golangci-lint/testを自動実行。[.github/workflows/ci.yml](.github/workflows/ci.yml))

## ドキュメント
- API仕様: https://koudai001.github.io/urekoi/ (ReDoc, [docs/openapi.yaml](docs/openapi.yaml)から生成)
- DBテーブル定義: [docs/table-definitions.md](docs/table-definitions.md)

## ローカル環境
- 現状DBのみコンテナ化(`docker-compose up -d`)
- DBクライアント: pgAdmin
- フロントエンド: `cd apps/web && pnpm dev` → [http://localhost:3000](http://localhost:3000)
