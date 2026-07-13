package main

import (
	"database/sql"
	"embed"
	"errors"

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

	// raw database connectionを取得する
	sqlDB, err := db.DB()
	if err != nil {
		panic("Failed to get underlying *sql.DB: " + err.Error())
	}

	// マイグレーションを実行する
	if err := runMigrations(sqlDB); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	if err := seed.SeedDefault(db); err != nil {
		panic("Failed to seed database")
	}

	if err := seed.SeedDummyProfiles(db); err != nil {
		panic("Failed to seed dummy profiles")
	}
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
