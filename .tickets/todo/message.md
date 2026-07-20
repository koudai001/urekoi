- メッセージ機能の開発

## やること

- [x] REST(送信・履歴取得)のBE実装(repository/usecase/dto/validator/controller/router)
- [x] MatchProfileにmatch_idを追加(FE側でチャットを開くのに必要)
- [x] FE: MatchingCarousel/ChatListから実マッチのChatViewを開けるようにする
- [x] FE: メッセージ送信・履歴表示(送信後はmutateで再取得)
- [ ] WS(チケット認証・Redis Pub/Sub配信)

# 設計

- 送信: REST(POST /matches/:matchId/messages)でDB保存→成功後にWS経由で相手にプッシュ。履歴取得もREST(GET /matches/:matchId/messages、ページネーション)

- WS認証: チケット方式。access_tokenはhttpOnly cookieで別オリジンのBEに直接渡せないため、Next.jsのRoute Handler経由でBEに短命・使い捨てticketを発行してもらい`wss://.../ws?ticket=...`で接続

- コネクション管理: 実際のWS接続自体は各インスタンスがuser_idごとにin-memoryで持つ(`map[userID][]*Conn`、複数タブ許容)が、配信はRedis Pub/Sub経由にする。送信時はRedisにpublishし、各インスタンスがsubscribeして自分が持つ接続にだけ配信する(複数台構成でも最初から対応できる)

- ping/pongで死活監視・切断検知(gorilla/websocket標準機能)

- ペイロード: `{match_id, message}`。user単位で1本のWSで全マッチ分を受け、開いてるチャットならその場に追加、そうでなければトーク一覧の未読バッジ更新に使う

- ライブラリ: gorilla/websocket

- 再接続はクライアント側の責務。切断時はticketを取り直して再接続(ticketは使い捨て)

- アンマッチ: messagesはON DELETE CASCADEで既に消える(models/message.go)。相手への通知は後回し

- スコープ外: 既読表示・オンライン表示・タイピング中表示

## 進め方

REST→WS
