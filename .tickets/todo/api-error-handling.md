# API通信エラーのハンドリング

## やること

- [ ] `customFetch`がネットワークエラー(fetch自体の失敗)をcatchしていないので対応する
- [ ] BEが500を返すケースを`openapi.yaml`に定義し、orval生成の型に含める。login/signupの`switch`の`default`も対応させる
- [ ] `error.tsx`(500用)・`not-found.tsx`(404用)の汎用エラー画面を用意する
