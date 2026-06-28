# ログイン状態の管理(BFF構成)

## 背景
- [signup](signup.md)チケットでBFFの基本パターン(Server Action経由でGo APIを呼ぶ)を確立した後に着手する
- ここではログイン以降の「セッションを維持する」部分を扱う

## アーキテクチャ方針
- access_token・refresh_tokenはどちらもブラウザのJSに一切渡さない(Next.jsのhttpOnly cookieのみ)
- cookie設定: `httpOnly`, `SameSite=Strict`, `Secure`
- CSRF対策はNext.js Server Actionsの組み込みOrigin checkに任せる(Goサーバー側にCSRF対策の実装は不要)

## サブタスク
- [ ] login用Server Actionを作る(Go `/login`を呼び、access_token/refresh_tokenを自分のhttpOnly cookieにセット)
- [ ] v0でログイン画面(/login)を作る
- [ ] ログイン状態を扱うAuthContext/useAuthフック(またはサーバー側でcookieを見るユーティリティ)を作る
- [ ] access_token切れを検知して`/refresh`を裏で呼び、cookieを更新するロジックを作る
- [ ] logout用Server Actionを作る(Go `/logout`を呼び、自分のcookieも削除)
- [ ] 未ログイン時に保護ページへアクセスしたらログイン画面にリダイレクトする(Next.js Middleware)
- [ ] 今後likes/profile/matches/messagesを追加する際は、都度対応するServer Actionを追加する

## 完了条件
- 実際にブラウザでlogin→ページ遷移→logoutが一通り動作する
- ブラウザの開発者ツールでaccess_token/refresh_tokenの値がどこにも(JS変数・localStorage等)露出していないことを確認する
