# やりたいこと

・画像アップロードをやる
signupの動線
・プロフィール編集もできたらやる

## 設計

- 対応順序: まずプロフィール編集画面での画像アップロードを実装する。
- S3互換ストレージは環境ごとに使い分ける(Goコードは共通で、エンドポイント・認証情報を環境変数で切り替えるだけ)
  - 本番(AWS/ECS): Terraformで用意済みのAWS S3(署名付きURL発行→ブラウザから直接S3へPUT→閲覧はCloudFront経由)
  - 検証環境(Render): AWS S3は課金が発生するため使わず、無料枠のあるCloudflare R2(S3互換API)を使う
  - ローカル: docker-composeにMinIO(S3互換)を追加
- API(いずれも認証必須):
  - `POST /myprofile/images/presign`: アップロード用の署名付きURLとkey(`profiles/{userID}/{uuid}.{ext}`)を発行
  - `POST /myprofile/images`: アップロード済みkeyを受け取りProfileImageレコードを作成(sort_orderは既存件数+1)
  - `DELETE /myprofile/images/:image_id`: 画像削除(プロフィール編集用)
  - `PUT /myprofile/images/order`: 並び替え後の全画像ID配列(`image_ids`)を受け取り、配列内の位置をそのままsort_orderとして一括反映
- `repositories`層にS3操作用のインターフェースを新設。AWS SDK for Go v2を追加
- `ProfileImage`はフルURLではなくS3のkeyを保存する(`URL`→`Key`)。CloudFrontのドメインが将来変わってもDBの全件バックフィルが不要になるよう、閲覧用URLは`usecases`層で`IMAGE_BASE_URL`(env)+keyを組み立てて返す
