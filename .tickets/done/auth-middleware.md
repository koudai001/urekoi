# 認証状態によるリダイレクト(Middleware)

## やること

1. access_tokenがある → 認証済み
2. ない → refresh_tokenの有無を確認
   - あれば /refresh を叩く → 成功すれば認証済み(cookie更新)、失敗すれば未認証
   - なければ未認証
3. 未認証 かつ 保護ページ → /loginへリダイレクト
4. 認証済み かつ /login・/signup → /へリダイレクト

middlwareのテストを書く
