package main

import (
	"database/sql"
	"embed"
	"errors"
	"log"

	"api/infra"
	"api/seed"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed sql
var migrationFiles embed.FS // sqlディレクトリ(Atlasが生成したマイグレーションファイル一式)をビルド時にバイナリの中へ埋め込む

func main() {
	infra.Initialize()
	db := infra.SetupDB()
	s3Client := infra.SetupS3()

	// raw database connectionを取得する
	sqlDB, err := db.DB()
	if err != nil {
		panic("Failed to get underlying *sql.DB: " + err.Error())
	}

	// マイグレーションを実行する
	if err := runMigrations(sqlDB); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	log.Println("Seeding default masters...")
	if err := seed.SeedDefault(db); err != nil {
		panic("Failed to seed database: " + err.Error())
	}

	log.Println("Seeding dummy profiles...")
	if err := seed.SeedDummyProfiles(db); err != nil {
		panic("Failed to seed dummy profiles: " + err.Error())
	}

	log.Println("Seeding dummy profile images...")
	if err := seed.SeedDummyProfileImages(s3Client); err != nil {
		panic("Failed to seed dummy profile images: " + err.Error())
	}

	log.Println("Seeding dummy likes...")
	if err := seed.SeedDummyLikes(db); err != nil {
		panic("Failed to seed dummy likes: " + err.Error())
	}

	log.Println("Seed completed.")
}

// migrations/sql配下のマイグレーションファイル(Atlasで生成)をPostgreSQLに適用する
func runMigrations(sqlDB *sql.DB) error {
	// マイグレーションファイルをiofsで読み込む
	source, err := iofs.New(migrationFiles, "sql")
	if err != nil {
		return err
	}

	// PostgreSQLのドライバ（接続先）を作成する
	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		return err
	}

	// マイグレーションを実行するインスタンスを作成する
	m, err := migrate.NewWithInstance("iofs", source, "postgres", driver)
	if err != nil {
		return err
	}

	// マイグレーションを実行する
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	return nil
}
