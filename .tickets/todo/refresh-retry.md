# 401時にrefreshしてからリトライ

## やること
- [ ] サーバーコンポーネント/Server ActionからのBE直叩き(`getSearchAll`など)が401を返した場合、`/login`に飛ばす前に`refresh_token`で1回リフレッシュを試みる
- [ ] リフレッシュ成功時は新しいaccess_tokenで元のリクエストをリトライする
- [ ] リフレッシュも失敗した場合のみ`/login`にリダイレクトする(この時`session-expired-toast.md`のトーストを出す)
