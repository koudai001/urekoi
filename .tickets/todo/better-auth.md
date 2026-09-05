# Hono + Better Auth 認証サービス

## 構成

```text
urekoi/
├── apps/web   Next.js                 Vercel
├── apps/auth  Hono + Better Auth      Vercel
└── apps/api   Go API                  ECS
```

- `apps/auth`は独立した認証サービスとして実装する
- `apps/web`と`apps/auth`は別のVercelプロジェクトとしてデプロイする
- Go APIはプロフィール・検索・いいね・マッチ・メッセージを引き続き管理する
- サービス間で実装を直接importせず、HTTPとJWTで連携する

## 通信

```text
Browser
  ├── /api/auth/* ──> Webのrewrite ──> Auth
  └── アプリ操作 ────────────────────> Go API

Go API ── JWKS取得 ──> Auth
```

- ブラウザからの認証リクエストはWebと同一オリジンの`/api/auth/*`を使用する
- WebのrewriteでAuthサービスへ転送し、クロスオリジンCookieを避ける
- AuthはBetter AuthのセッションCookieを発行する
- Go APIへのリクエストにはAuthが発行した短寿命JWTを付与する
- Go APIはAuthのJWKSを使ってJWTの署名・issuer・audience・期限を検証する

## データ管理

- Better Auth専用のPostgreSQLを使用する
- Auth DBはユーザー、アカウント、セッション、検証情報、JWKSを管理する
- Go DBは既存のユーザーとすべての業務データを管理し続ける
- AuthユーザーとGoユーザーはBetter Authのuser IDを表す`auth_subject`で関連付ける
- Go APIに冪等なユーザー連携処理を用意し、初回認証時に既存メールへ紐付けるか新規ユーザーを作成する
- JWTの`sub`にはBetter Authのuser ID、`app_user_id`にはGo側のuser IDを含める

## 認証フロー

1. Webから`/api/auth/*`へメール認証またはGoogle認証を要求する
2. AuthがBetter Authで本人確認し、セッションCookieを発行する
3. 初回認証時はAuthからGo APIへユーザー連携を要求する
4. AuthがGo側user IDを含むJWTを発行する
5. WebがJWTをBearer TokenとしてGo APIへ送る
6. Go APIがJWKSでJWTを検証し、`app_user_id`を認可に使用する

## 移行

1. `apps/auth`とAuth専用DBを追加し、既存認証と並行稼働させる
2. 開発環境で新規ユーザーのメール認証とGoogle認証を確認する
3. Go APIへBetter Auth JWTの検証とユーザー連携処理を追加する
4. Webのログイン画面とセッション判定をBetter Authへ切り替える
5. 既存ユーザーのパスワードとGoogle認証情報をAuth DBへ移行する
6. 本番ユーザーを段階的にBetter Authへ切り替える

## 方針

- Go APIと既存認証エンドポイントは移行中も削除しない
- Auth DBとGo DBを直接参照し合わない
- Authサービスが停止しても有効期限内のJWTはGo API単体で検証できるようにする
- DBマイグレーションはAuthサービス内で管理し、本番DBへ自動適用しない
- 最初はメール認証、Google認証、セッション、JWT発行に限定する
