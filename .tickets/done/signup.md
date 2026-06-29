# サインアップ画面の実装(BFF構成)

## 背景
- バックエンドの`/signup`は実装・テスト済み(email + password)
- フロントエンド(apps/web)はまだAPIクライアント・認証画面が一切無い
- まずsignupだけ作ってみて、勝手が分かってから残りの認証フロー(login/refresh/logout等)を別チケットに進める

## アーキテクチャ方針: Next.jsをBFF(プロキシ)にする
ブラウザはGo APIを直接叩かず、Next.jsだけを叩く。Next.jsサーバーがGo APIをサーバー間通信で呼ぶ。

```
ブラウザ
  ↓ Server Action呼び出し(Next.js内部。Origin checkで保護される)
Next.jsサーバー
  ↓ Go /signupをサーバー間通信で呼ぶ
Go API(変更不要)
```

## サブタスク
- [x] v0でサインアップ画面(/signup)を作る(email + password)
- [x] signup用Server Actionを作る(Go `/signup`を呼ぶ)
- [x] orvalライブラリで自動でクライアント生成(openapi.yamlのtagsを英語化し、generated/配下に生成。手書きmutatorはlib/api/custom-fetch.ts)
- [] バリデーションエラー(400)・email重複(409)時の画面表示を作る

## 完了条件
- ブラウザでsignupが完了し、Goの`users`テーブルにレコードが作成されることを確認する
