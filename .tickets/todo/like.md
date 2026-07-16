# いいね機能

方針:ポーリングで対応
識別子は`/search/all`と同じく`user_id`で統一。

## やること

- [x] `models/like.go`に重複いいね防止のユニーク制約(from_user_id, to_user_id)を追加、`docs/table-definitions.md`も更新

- [x] `docs/openapi.yaml`: `POST /likes`(いいねを送る。to_user_idを指定)・`GET /likes/received`(自分がもらったいいね一覧)を設計

- [x] repository → usecase → controller → router実装
  - 自分自身へのいいね・重複いいねはエラーにする

- [x] test

- [ ] FE: いいねボタンから`POST /likes`を叩く

- [ ] FE: `GET /likes/received`をポーリングして新着いいねを取得
