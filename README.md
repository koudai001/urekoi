# urekoi

熟女専門マッチングアプリ。Go + Next.js のモノレポ構成。

## 技術スタック

### フロントエンド
- TypeScript
- Next.js
- React

### バックエンド
- Go
- Gin
- PostgreSQL
- クリーンアーキテクチャ(controllers / usecases / repositories / models)

## ドキュメント
- API仕様: https://koudai001.github.io/urekoi/ (ReDoc, [docs/openapi.yaml](docs/openapi.yaml)から生成)
- DBテーブル定義: [docs/table-definitions.md](docs/table-definitions.md)

## ローカル開発
- 現状DBのみコンテナ化(`docker-compose up -d`、api/webは後で検討)
- DBクライアント: pgAdmin, APIクライアント: Insomnia
