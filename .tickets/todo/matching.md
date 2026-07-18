# メモ

- マッチング機能の開発
- いいねきた人に対して返す→マッチング
- マッチング成立時の画面
- シードの画像入れる

# スコープ1（バックエンド）

- マッチ成立を検知してBE側で判定・作成(SendLike) DONE
- GET /matches マッチした相手の一覧 DONE
- シードデータに複数写真を追加 DONE

# スコープ2（フロント）

- UI直す　DONE

- FEでマッチ成立時のトースト

- FEでマッチした相手の一覧を出す
  メッセージ一覧の横スクロール部分

# 設計

マッチ生成のトリガー: SendLikeの中で、いいねを作成した後にlikeRepo.HasLiked(toUserID, fromUserID)(相手が自分に既にいいねしてるか)をチェック。trueならMatchを作成する。これが「いいねきた人に返す→マッチング」の実装場所になる

SendLikeの戻り値変更: 今はerrorだけを返しているが、マッチ成立画面をFEで出すには「マッチし
たかどうか」を呼び出し元に伝える必要がある。SendLikeが(matched bool, err error)を返すように変更し、POST /likesのレスポンスにmatched: booleanを足す

Match生成時のUser1ID/User2ID順序: 対称な関係なので、
重複防止のため小さい方のuser_idをUser1IDに固定するなどのルールが要る
