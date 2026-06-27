## 概要・技術・ローカル環境
README.mdを参照

### レイヤーの依存方針
- `models`（Entity）: 他レイヤーに依存しない。DTOやjsonタグを持たせない（gormタグのみ）
- `usecases`: `models`・`repositories`のインターフェースに依存。`dto`には依存しない
  - 引数が少ない（2〜3個程度）場合はprimitive型をそのまま使う
  - 引数が多い場合は`usecases`パッケージ内に専用のinput struct（json/bindingタグなし）を定義する
  - dto⇔primitive/input structの変換は`controllers`が担う

## チケット運用
- チケットは`.tickets/todo/`配下にmdファイルとして作成し、着手したら`.tickets/done/`に移動する
- ファイル名(拡張子`.md`を除いたもの)と、そのチケットに対応する作業ブランチ名を一致させる
  - 例: チケット`.tickets/todo/fe-integration.md` → ブランチ`fe-integration`