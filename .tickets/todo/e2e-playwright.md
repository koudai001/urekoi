# フロントエンドE2Eテスト基盤(Playwright)

## 背景
- フロントエンド(apps/web)にテストが一切無い
- バックエンドは`auth_test.go`で実ルーターに対する結合テストがある。同じ思想をフロントでも実現したい
- まずは[signup](signup.md)・[auth-session](auth-session.md)で認証フローが動くようになった後に着手する

## 方針
- Playwrightを導入し、実ブラウザでsignup/login/logoutのフローを操作して検証する
- Goの開発用APIサーバー(sqliteではなくpostgresコンテナ)に対して実際にリクエストを通す想定

## サブタスク
- [ ] `apps/web`に`@playwright/test`を導入する
- [ ] signupフロー(フォーム入力→送信→成功表示)のE2Eテストを書く
- [ ] loginフロー・logoutフローのE2Eテストを書く
- [ ] CIで実行できるようにする(該当のワークフローがまだ無ければ合わせて検討)

## 完了条件
- `pnpm test:e2e`(などのコマンド)でsignup→login→logoutのE2Eテストが通る
