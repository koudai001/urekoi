# 都道府県マスタの公開API化

## やること

- [ ] BEに認証不要の`GET /prefectures`を追加(signup画面はログイン前のため`/tags`のような認証必須エンドポイントにできない)
- [ ] `apps/web/lib/prefectures.ts`のハードコードを削除し、API経由の取得に置き換える
