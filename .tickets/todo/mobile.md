# Mobile App

Expoを使い、既存のWebアプリと並行してネイティブアプリを開発する。

## 構成

```text
apps/
├── api/     # Go API
├── web/     # Next.js
└── mobile/  # Expo
```

- 画面遷移にはExpo Routerを使用する
- Go APIはWebとMobileで共通利用する
- 認証トークンはExpo SecureStoreで管理し、AuthorizationヘッダーでAPIへ送る
- API型、バリデーション、定数、純粋関数など、プラットフォームに依存しないコードは可能な範囲で共有する
- Next.js固有のUIコンポーネントは流用せず、React Native向けに実装する

## 移行順

1. ExpoプロジェクトとBottom Tabsを作成する
2. ログインとトークン管理を実装する
3. RecsカードとLike・Skipを実装する
4. Like一覧を実装する
5. メッセージ一覧とチャットを実装する
6. プロフィール表示・編集・画像アップロードを実装する
7. Push通知を実装する

## 最初のゴール

- `apps/mobile` でExpoアプリを起動できる
- Recs、Like、メッセージ、マイページのタブが表示される
- Recsの空画面が表示される
