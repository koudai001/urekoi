package infra

import (
	"log"

	"github.com/joho/godotenv"
)

func Initialize() {
	// .env が無い本番環境ではエラーを無視する
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, skipping")
	}
}
