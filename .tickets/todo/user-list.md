# ユーザー一覧表示

## やること

# DONE

- storybook(SearchCard・FavoriteButton)

- BEに`GET /search/all`エンドポイントを追加
  登録済みユーザーの一覧を返す(プロフィール画像はダミーURL可)

- BEに`GET /search/all/partner/{id}`(相手詳細)エンドポイントを追加
  nickname・bio・タグ・NEWバッジ判定など。画像・オンライン状態はモック

- `search`グループに認証ミドルウェアを追加

- 都道府県・タグのマスタデータをseedする仕組み(`api/seed`)を整備

- testまで

- `docs/openapi.yaml`に`GET /search/all`・`GET /search/all/partner/{id}`を定義

- orvalでFE側の型・クライアントを生成

- FEのホームページ(`app/page.tsx`)をAPIから取得したデータで描画するよう切り替える(ダミーの`searchProfiles`を廃止)

- testも
