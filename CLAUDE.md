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
- `usecases`: `models`・`repositories`のインターフェースに依存。`dto`には依存しない
  - 引数が少ない（2〜3個程度）場合はprimitive型をそのまま使う
  - 引数が多い場合は`usecases`パッケージ内に専用のinput struct（json/bindingタグなし）を定義する
  - dto⇔primitive/input structの変換は`controllers`が担う

## ローカル開発
- 現状DBのみコンテナ化(api/webは後で検討)
- DBクライアント: pgAdmin, APIクライアント: Insomnia