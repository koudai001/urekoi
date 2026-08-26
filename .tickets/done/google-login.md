1. 認証とプロフィール作成を分離するAPI設計にする  
   メール登録は認証情報だけ作成してログイン状態にする  
   初回プロフィール作成用に POST /myprofile を追加する  
   既存の PUT /myprofile は編集用として維持する

＜画面遷移を変更＞
メールアドレス・パスワード入力
→ POST /signup
→ JWTをCookieに保存
→ プロフィール入力画面

プロフィール入力
→ POST /myprofile
→ /recs

2. Google OAuth のAPI契約を決めて OpenAPI に追加する  
   Next.js のコールバックから code を渡す認証エンドポイント  
   APIがGoogleと交換し、ユーザー作成・JWT発行を行う

3. Next.js に Google 認証開始・コールバックの Route Handler を作る  
   認可画面へのリダイレクト  
   state / PKCE の保持と検証  
   APIから受け取ったJWTを既存の HttpOnly Cookie に保存  
   プロフィール作成画面へ遷移

4. APIにGoogle認証処理を実装する  
   code をGoogleトークンへ交換  
   GoogleユーザーIDとメールを取得  
   auth_identities で既存ユーザーを検索、なければ作成  
   JWTを返す

5. フロントの登録導線を二段階に変える  
   メール・Googleの認証完了後はプロフィール作成へ  
   プロフィール作成後に /recs へ遷移  
   profiles がないログイン済みユーザーは、プロフィール作成へ誘導する

6. テストを追加する  
   メール認証後にプロフィールを作成できること  
   Google初回登録・再ログイン  
   未プロフィールユーザーの導線
