# ユーザー一覧表示

## やること
- [ ] BEに`GET /users`エンドポイントを追加し、登録済みユーザーの一覧を返す(プロフィール画像はダミーURL可)
- [ ] `docs/openapi.yaml`に`GET /users`を定義してorvalでFE側の型・クライアントを生成
- [ ] FEのホームページ(`app/page.tsx`)をAPIから取得したデータで描画するよう切り替える(ダミーの`searchProfiles`を廃止)
