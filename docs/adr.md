# ADR

機能ごとの設計判断とその理由をまとめる。

## メッセージ関連のキャッシュ

- WebSocket受信/送信メッセージのSWRキャッシュ直接反映（再フェッチなし）で即時反映。合わせて対象の相手を一覧の先頭へ移動
- bound mutate(自キー専用)とグローバルmutate(任意キー指定可)を使い分け
  - `/api/matches/{matchId}/messages`(トーク画面): bound mutateで自キーのみ再検証
  - `/api/matches/unmessaged` / `/api/matches/messaged`(サイドバー一覧): グローバルmutateで別キーをローカル更新

## いいね成立時の一覧更新

- いいね成立時は `/api/matches/unmessaged` だけを即再検証し、左サイドバーの「マッチした相手」一覧から該当ユーザーを即時に消す
- `/api/matches/messaged` はこの時点では再検証しない。メッセージ送信後の更新や通常ポーリングに委ねる
- マッチ成立の判定だけで `match_id` を返さず、一覧側は再取得で最新状態を揃える。即時性よりも実装の単純さと整合性を優先する

## プロフィール画像アップロード

- S3互換ストレージを`GO_ENV`で環境ごとに切り替え(本番: AWS S3、検証環境: Cloudflare R2、ローカル: MinIO)。Goコード(aws-sdk-go-v2)は共通のまま
- presigned URL方式でAPIはURL発行のみ担当。画像本体のアップロードはブラウザ→S3/R2/MinIOへ直接行い、APIサーバーを経由しない
- DBには生のS3 key(`ImageKey`)のみ保存し、閲覧用URLは参照時に組み立てる設計に統一(CloudFrontドメインが将来変わってもDB全件バックフィル不要)
- `grafana/s3-mock`でsqlite/miniredisと同じ思想を貫き、テストは実際のS3接続に依存せずインメモリで完結
- 画像削除時、他人の画像IDを渡されても存在を知られないよう一律404を返す(所有者チェック)
- keyはアップロードごとにランダム発行で使い回さない=同じURLの中身は絶対に変わらない、という設計を活かし`Cache-Control: public, max-age=31536000, immutable`を署名付きで付与。2回目以降の表示はブラウザキャッシュのみで完結し、体感速度が大きく向上した
