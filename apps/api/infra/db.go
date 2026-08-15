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

	var (
		db  *gorm.DB
		err error
	)

	if env == "test" {
		db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{TranslateError: true})
		log.Println("Setup sqlite db (test)")
	} else {
		dsn := fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
			os.Getenv("POSTGRES_HOST"),
			os.Getenv("POSTGRES_USER"),
			os.Getenv("POSTGRES_PASSWORD"),
			os.Getenv("POSTGRES_DB"),
			os.Getenv("POSTGRES_PORT"),
		)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{TranslateError: true})
		log.Printf("Setup postgresql db (GO_ENV=%s)", env)
	}

	if err != nil {
		panic("Failed to connect database")
	}

	// 同時接続数に上限を設け、負荷時にPostgresへ新規接続が殺到するのを防ぐ(sqlite/testは対象外)
	if env != "test" {
		sqlDB, err := db.DB()
		if err != nil {
			panic("Failed to get generic database object")
		}
		sqlDB.SetMaxOpenConns(25)
		sqlDB.SetMaxIdleConns(25)
	}

	return db
}
