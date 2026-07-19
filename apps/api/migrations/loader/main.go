package main

import (
	"fmt"
	"io"
	"os"

	"ariga.io/atlas-provider-gorm/gormschema"

	"api/models"
)

// Atlasがこのプログラムを`go run`で呼び出し、標準出力のSQLからスキーマ差分を検出する
func main() {
	stmts, err := gormschema.New("postgres").Load(
		&models.User{},
		&models.Profile{},
		&models.ProfileImage{},
		&models.Prefecture{},
		&models.Tag{},
		&models.ProfileTag{},
		&models.Like{},
		&models.Skip{},
		&models.Match{},
		&models.Message{},
		&models.RefreshToken{},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load gorm schema: %v\n", err)
		os.Exit(1)
	}

	// 標準出力にSQLを出力する
	io.WriteString(os.Stdout, stmts)
}
