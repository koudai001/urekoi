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
	"github.com/redis/go-redis/v9"
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

// テスト環境のセットアップ(DB・Redis・S3はGO_ENV=testでそれぞれインメモリ化される)
func setup(t *testing.T) (*gin.Engine, *gorm.DB, *redis.Client) {
	db := infra.SetupDB()
	migrateAndSeed(t, db)
	redisClient := infra.SetupRedis()
	s3Client := infra.SetupS3()

	return router.SetupRouter(db, redisClient, s3Client), db, redisClient
}

// マイグレーションとマスタデータのシード投入を行う
func migrateAndSeed(t *testing.T, db *gorm.DB) {
	t.Helper()

	require.NoError(t, db.AutoMigrate(
		&models.User{},
		&models.PasswordCredential{},
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
}
