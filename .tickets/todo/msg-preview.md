メッセージ一覧(サイドバーの「メッセージ」タブ)に最新メッセージのプレビューを出す

## 設計

- `GET /matches`のレスポンスに`last_message`/`last_message_at`/`last_message_sender_user_id`を追加(repositoryは`LEFT JOIN LATERAL`で各matchの最新1件を取得)

- WS新着メッセージ受信時、`matchesKey({ hasMessages: true })`のキャッシュも`.map()`で該当match_idだけローカル書き換え(`revalidate: false`、通信なし)。見つからなければその時だけ再検証する

- `MsgList`の行を「名前+最新メッセージプレビュー」の2段組みに変更(自分の発言なら↩)

## やること

- [x] `dto.MatchProfile`に`last_message`系を追加し、repository/usecase/openapi.yamlを更新、orval再生成
- [x] `use-match-profiles.ts`に`matchesKey`ヘルパーを追加
- [x] `use-ws-connection.ts`で`matchesKey({ hasMessages: true })`をローカル更新
- [x] `MsgList`の表示を2段組みに変更
- [x] バックエンドテスト追加
