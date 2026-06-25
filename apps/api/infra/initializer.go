package infra

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func Initialize() {
	// 本番環境は .env ファイルを読み込まない
	if os.Getenv("GO_ENV") == "dev" {
		err := godotenv.Load()

		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}
}
