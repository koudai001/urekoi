package infra

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func Initialize() {
	env := os.Getenv("GO_ENV")
	file := ".env." + env
	// .envファイルが無い環境(CI等)ではエラーを無視する
	if err := godotenv.Load(file); err != nil {
		log.Printf("No %s file found, skipping", file)
	}
}
