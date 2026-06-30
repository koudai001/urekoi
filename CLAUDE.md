## 概要・技術・ローカル環境
README.mdを参照

## コメント方針
- 自明な処理には書かない
- テストケースなど「内容を把握するのに本文を読むのが面倒なもの」には、何を検証しているかが一目で分かる一言コメントを書く

### レイヤーの依存方針
- `models`（Entity）: 他レイヤーに依存しない。DTOやjsonタグを持たせない（gormタグのみ）
- `usecases`: `models`・`repositories`のインターフェースに依存。`dto`には依存しない
  - 引数が少ない（2〜3個程度）場合はprimitive型をそのまま使う
  - 引数が多い場合は`usecases`パッケージ内に専用のinput struct（json/bindingタグなし）を定義する
  - dto⇔primitive/input structの変換は`controllers`が担う

### バリデーション方針
- リクエストの形式検証(必須・email形式・文字数など)は`validators`パッケージ(ozzo-validation)で行う。`dto`に`binding`タグは付けない(Ginの`ShouldBindJSON`はパースのみ)
- `validators`はdto→`controllers`内で呼ぶ。`usecases`は`dto`に依存しないため呼ばない
- エラーメッセージの言語方針:
  - `validators`が返すバリデーションエラー(400): 日本語(ユーザーが直接目にするため)
  - `usecases`の業務エラー(409 email重複, 401 認証失敗など): 英語のままでよい。フロントはステータスコードで判断し、表示用の日本語文言を自前で用意する
- フロントの入力フォームには`required`/`minLength`等のHTML5バリデーション属性を付け、サーバーに送る前に弾けるものは弾く

## フロントエンドのコンポーネント設計
- `components/ui/`: 汎用UIプリミティブ(shadcn由来)。表示/非表示の切り替えなど見た目だけのUI状態は持ってよいが、業務的な状態(データ取得結果・フォームの値など)やビジネスロジックは持たない
- `components/`直下: 機能コンポーネント。`ui/`のプリミティブを組み合わせて作る。データ取得・状態管理を持ってよい
- ドメイン単位のサブフォルダ分けはしない(今の規模では不要)
- ストーリーファイルは対象コンポーネントと同じディレクトリに置く(例: `components/ui/button.tsx` → `components/ui/button.stories.tsx`)
- 色・余白などのデザイン値はなるべく`app/globals.css`の`@theme`トークン(CSS変数)に寄せる。`bg-[#xxxxxx]`のような直書きの値は避け、トークン化してから使う

## チケット運用
- チケットは`.tickets/todo/`配下にmdファイルとして作成し、着手したら`.tickets/done/`に移動する
- ファイル名(拡張子`.md`を除いたもの)と、そのチケットに対応する作業ブランチ名を一致させる
  - 例: チケット`.tickets/todo/fe-integration.md` → ブランチ`fe-integration`
- やることは`## やること`配下にシンプルなチェックボックス(`- [ ]`)で書く。完了したら`- [x]`にする。背景説明や詳細な完了条件のセクションは作らず、簡潔に保つ