package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"api/infra"
	"api/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/require"
)

// 他のすべてのテストの前に呼ばれる
func TestMain(m *testing.M) {
	if err := godotenv.Load(".env.test"); err != nil {
		log.Fatalln("Error loading .env.test file")
	}

	code := m.Run()
	os.Exit(code)
}

// テスト環境のセットアップ
func setup(t *testing.T) *gin.Engine {
	db := infra.SetupDB()

	require.NoError(t, db.AutoMigrate(
		&models.User{},
		&models.Profile{},
		&models.ProfileImage{},
		&models.Prefecture{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.RefreshToken{},
	))

	return setupRouter(db)
}

func postJSON(t *testing.T, router http.Handler, path string, body any) *httptest.ResponseRecorder {
	payload, err := json.Marshal(body)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}
