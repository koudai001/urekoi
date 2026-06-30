# API通信エラーのハンドリング

## やること
- [ ] `customFetch`がネットワークエラー(fetch自体の失敗)をcatchしていないので対応する
- [ ] BEが500を返すケースを`openapi.yaml`に定義し、orval生成の型に含める。login/signupの`switch`の`default`も対応させる
- [ ] 必要なら`error.tsx`で汎用エラー画面も用意する
