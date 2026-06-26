package infra

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupDB() *gorm.DB {
	env := os.Getenv("GO_ENV")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PORT"),
	)

	var (
		db  *gorm.DB
		err error
	)

	if env == "dev" {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{TranslateError: true})
		log.Println("Setup postgresql db")
	} else {
		db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{TranslateError: true})
		log.Println("Setup sqlite db")
	}

	if err != nil {
		panic("Failed to connect database")
	}

	return db
}
