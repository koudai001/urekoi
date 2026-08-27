# 設計書

機能ごとの構成と主な設計方針をまとめる。

## メッセージ・マッチ関連のキャッシュ

### キャッシュ一覧

- matches.{matchId}.messages
  - エンドポイント：`/api/matches/{matchId}/messages`
  - 内容: 該当トークのメッセージ履歴
- matches.messaged
  - エンドポイント：`/api/matches/messaged`
  - 内容: メッセージ済みの相手と最新メッセージ
- matches.unmessaged
  - エンドポイント：`/api/matches/unmessaged`
  - 内容: マッチ後、まだメッセージしていない相手
  - 定期取得: 15秒
  - 利用箇所: 新しいマッチ
- likes.pending
  - エンドポイント：`/api/likes/pending`
  - 内容: 受信Like
  - 定期取得: 15秒
  - 利用箇所: 受信Like画面・新しいマッチ

### WebSocket接続

- 認証後の共通`WebSocketProvider`で、ユーザー単位の接続を1本維持する
- 現在WebSocketで受信するイベントは新着メッセージのみ
- Like受信とマッチ成立はWebSocketイベントに含まれていない

### メッセージ受信時

1. WebSocketで新着メッセージを受信
   → `matches.{matchId}.messages`にメッセージを追加（再取得なし）
   → `matches.messaged`の対象を更新して一覧の先頭へ移動（再取得なし）

2. 初回メッセージの場合
   → `matches.unmessaged`から対象を削除
   → その対象＋新着メッセージを`matches.messaged`の先頭へ追加

3. （例外）`matches.messaged`が未取得、または対象がキャッシュにいない
   → `matches.messaged`だけ再取得

### メッセージ送信時

1. POSTでメッセージ送信
2. POSTのレスポンスで、送信したメッセージを受け取る
3. メッセージ履歴キャッシュへ送信メッセージを追加
4. matches.unmessagedキャッシュから対象を削除
5. 対象と送信メッセージをmatches.messagedキャッシュの先頭へ追加

### Likeによるマッチ成立時

```text
候補へLikeを送信
→ APIレスポンスでマッチ成立を確認
→ /api/matches/unmessaged を再取得
→ TanStack Queryの候補キャッシュから対象を削除
```

マッチ一覧とスワイプ候補はどちらもTanStack Queryで管理し、マッチ成立時はそれぞれのQuery Keyを更新する。

### 現在の役割分担

- WebSocket: 新着メッセージを即時反映する
- TanStack Queryキャッシュ直接更新: トーク履歴とメッセージ済み・未メッセージ一覧の表示を更新する
- Queryの再検証: キャッシュに存在しない相手と、マッチ成立後の未メッセージ一覧をAPIと同期する
- 15秒ポーリング: 未メッセージ・受信Likeの取りこぼしを補完する

## スワイプ候補の状態管理

- 候補はTanStack Queryで共有し、先頭を表示する
- Recs Providerが詳細とデッキをつなぎ、送信とキャッシュ更新を担う
- デッキはアニメーション、詳細はスワイプ依頼だけを担う
- 成功時のみキャッシュから候補を除外。失敗時はカードを戻す

```text
TanStack Query
  候補一覧（サーバー状態）
          ↕
Recs Provider
  画面間の調整・判断の送信・キャッシュ更新
       ↙                         ↘
スワイプデッキ                    詳細画面
アニメーション                    判断の依頼
```

### 通常のスワイプ

デッキ操作
→ アニメーション
→ Provider
→ サーバー送信
→ 成功: 候補キャッシュを更新 → 次のカード
→ 失敗: キャッシュを維持 → カードを戻す

### 詳細画面からのスワイプ

詳細でLike / Skip
→ Providerへスワイプ指示を渡す
→ 一覧へ戻る
→ 一覧カードがアニメーション
→ 通常操作と同じ送信・キャッシュ更新処理

## 検索画面

- 一覧取得時にプロフィール単位でもキャッシュする
- 詳細画面はキャッシュを使い、未取得時のみAPIから取得する
- 検索対象外のプロフィールは表示しない

## コンポーネント配置

- `components`のディレクトリはApp Routerの画面単位（`myprofile`、`recs`、`likes`、`messages`）に揃える
- 複数画面で使うコンポーネントは、利用頻度が最も高い画面ドメインに置き、他画面からimportして使う
- 画面に属さない汎用UIだけを`components/ui`に置く

## プロフィール画像アップロード

- S3互換ストレージを`GO_ENV`で環境ごとに切り替え(本番: AWS S3、検証環境: Cloudflare R2、ローカル: MinIO)。Goコード(aws-sdk-go-v2)は共通のまま
- presigned URL方式でAPIはURL発行のみ担当。画像本体のアップロードはブラウザ→S3/R2/MinIOへ直接行い、APIサーバーを経由しない
- DBには生のS3 key(`ImageKey`)のみ保存し、閲覧用URLは参照時に組み立てる設計に統一(CloudFrontドメインが将来変わってもDB全件バックフィル不要)
- `grafana/s3-mock`でsqlite/miniredisと同じ思想を貫き、テストは実際のS3接続に依存せずインメモリで完結
- 画像削除時、他人の画像IDを渡されても存在を知られないよう一律404を返す(所有者チェック)
- keyはアップロードごとにランダム発行で使い回さない=同じURLの中身は絶対に変わらない、という設計を活かし`Cache-Control: public, max-age=31536000, immutable`を署名付きで付与。2回目以降の表示はブラウザキャッシュのみで完結し、体感速度が大きく向上した

## クリーンアーキテクチャ

- openapi.yamlとdtoを1対1対応させるルールを導入。dtoもリソース単位に統一

## 認証（signup）

- サインアップ(認証)と初回プロフィール作成を別APIに分離
- 認証用・プロフィール用でページとフォーム(FormProvider)をそれぞれ分ける
- 認証が完了&Cookie保存→プロフィール作成画面へリダイレクト

## Googleログイン

- GIS(Google Identity Services)でクライアントがid_tokenを直接取得し、APIは検証するだけ(認可コード交換・client_secretは不要)
- 署名検証はGoogle公式ライブラリに任せる
- auth_identityが無ければ同一emailの既存ユーザーに紐付け、それも無ければ新規作成

## プロフィール作成状況の伝播(has_profile)

- signup/login/google-login/refreshのレスポンスに`has_profile`を含め、Cookieに保存
- ミドルウェアはCookieだけを見て、未作成ユーザーをプロフィール作成画面へ誘導する

## websocketのハンドシェイク

ブラウザ
↓ チケット発行をリクエスト
Go
↓ IssueTicket()
Redisに ticket → userID を保存
↓
Go
↓ ticketをレスポンス
ブラウザ
↓ ticket付きでWebSocket接続
Go
↓ VerifyTicket()
Redisからticketを取得・消費
↓
Go
↓ userIDを特定
WebSocket接続確立

## websocketのチャット機能

[websocket](./websocket.drawio.svg)
