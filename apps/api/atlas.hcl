// GORMのモデルからスキーマを生成する(loaderは独立したGoモジュールのため、cdしてから実行する)
data "external_schema" "gorm" {
  program = [
    "sh",
    "-c",
    "cd migrations/loader && go run .",
  ]
}

// GORMのモデルから生成されたスキーマを使って、マイグレーションを実行する
env "gorm" {
  src = data.external_schema.gorm.url // GORMのモデルから生成されたスキーマを使用
  dev = "docker://postgres/17/dev?search_path=public"

  // マイグレーションのディレクトリを指定(golang-migrateが読める形式で出力する)
  migration {
    dir    = "file://migrations/sql"
    format = golang-migrate
  }
}
