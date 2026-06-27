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

### バックエンド
- Go 1.26
- Gin v1.12(Webフレームワーク)
- GORM v1.31(ORM, PostgreSQLドライバ使用)
- PostgreSQL
- golang-jwt/jwt v5(JWTによるアクセストークン)
- golang.org/x/crypto/bcrypt(パスワードハッシュ化)
- testify(テスト, sqliteドライバでDBをインメモリ化)
- クリーンアーキテクチャ(controllers / usecases / repositories / models)

## ドキュメント
- API仕様: https://koudai001.github.io/urekoi/ (ReDoc, [docs/openapi.yaml](docs/openapi.yaml)から生成)
- DBテーブル定義: [docs/table-definitions.md](docs/table-definitions.md)

## ローカル環境
- 現状DBのみコンテナ化(`docker-compose up -d`)
- DBクライアント: pgAdmin
- フロントエンド: `cd apps/web && pnpm dev` → [http://localhost:3000](http://localhost:3000)
