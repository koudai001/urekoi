# ADR

機能ごとの設計判断とその理由をまとめる。

## メッセージ関連のキャッシュ

- WebSocket受信/送信メッセージのSWRキャッシュ直接反映（再フェッチなし）で即時反映。合わせて対象の相手を一覧の先頭へ移動
- bound mutate(自キー専用)とグローバルmutate(任意キー指定可)を使い分け
  - `/api/matches/{matchId}/messages`(トーク画面): bound mutateで自キーのみ再検証
  - `/api/matches/unmessaged` / `/api/matches/messaged`(サイドバー一覧): グローバルmutateで別キーをローカル更新
