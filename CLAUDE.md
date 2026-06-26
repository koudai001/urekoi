# urekoi
熟女専門マッチングアプリ。Go + Next.js のモノレポ構成。

## フロントエンド
- TypeScript
- Next.js
- React

## バックエンド
- GO
- Gin（エコシステムの厚さととClaudeの学習量から）
- PostgreSQL
- クリーンアーキテクチャ

### レイヤーの依存方針
- `models`（Entity）: 他レイヤーに依存しない。DTOやjsonタグを持たせない（gormタグのみ）
- `usecases`: `models`・`repositories`のインターフェース・`dto`に依存

## ローカル開発
- 現状DBのみコンテナ化(api/webは後で検討)
- DBクライアント: pgAdmin, APIクライアント: Insomnia