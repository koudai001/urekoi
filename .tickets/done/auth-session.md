# ログイン状態の管理(BFF構成)

## アーキテクチャ方針

- access_token・refresh_tokenはどちらもブラウザのJSに一切渡さない(Next.jsのhttpOnly cookieのみ)
- cookie設定: `httpOnly`, `SameSite=Strict`, `Secure`
- CSRF対策はNext.js Server Actionsの組み込みOrigin checkに任せる(Goサーバー側にCSRF対策の実装は不要)
- signup成功時も自動ログインさせる(BE: `SignupResponse`にaccess_token/refresh_tokenを追加、FE: signup成功時もlogin同様cookie保存)
- 今後likes/profile/matches/messagesを追加する際は、都度対応するServer Actionを追加する

## やること

- [x] /loginページ作成(画面はsignupとほぼ同じ、文言のみ変更)
- [x] login用Server Actionを作る(Go `/login`を呼び、access_token/refresh_tokenを自分のhttpOnly cookieにセット)
- [x] login成功時に「/」へリダイレクト
- [x] signup時も自動ログインさせる(BE: SignupResponseにトークン追加、FE: signup成功時もcookie保存・「/」へリダイレクト)
- [x] vitestでユニットテストする

## 後続タスク(別チケットに分割)
- [auth-context](auth-context.md)
- [token-refresh](token-refresh.md)
- [logout](logout.md)
- [auth-middleware](auth-middleware.md)
- [api-error-handling](api-error-handling.md)
