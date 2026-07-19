package controllers_test

import (
	"log"
	"os"
	"testing"

	"api/infra"
	"api/models"
	"api/router"
	"api/seed"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// 他のすべてのテストの前に呼ばれる
func TestMain(m *testing.M) {
	if err := godotenv.Load("../.env.test"); err != nil {
		log.Fatalln("Error loading .env.test file")
	}

	code := m.Run()
	os.Exit(code)
}

// テスト環境のセットアップ
func setup(t *testing.T) *gin.Engine {
	router, _ := setupWithDB(t)
	return router
}

// DBへ直接データを仕込む
func setupWithDB(t *testing.T) (*gin.Engine, *gorm.DB) {
	db := infra.SetupDB()

	// マイグレーション
	require.NoError(t, db.AutoMigrate(
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
	))

	// シード投入(マスタデータのみ。ダミープロフィールはテストの件数前提が壊れるので入れない)
	require.NoError(t, seed.SeedDefault(db))

	return router.SetupRouter(db), db
}
