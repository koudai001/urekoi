package infra

import (
	"log"

	"github.com/joho/godotenv"
)

// Render等では環境変数がプラットフォームから直接渡るため、.env.localはローカル開発でのみ使われる
func Initialize() {
	const file = ".env.local"
	// .envファイルが無い環境(CI・Render等)ではエラーを無視する
	if err := godotenv.Load(file); err != nil {
		log.Printf("No %s file found, skipping", file)
	}
}
