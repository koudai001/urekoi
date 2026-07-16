package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"api/dto"
	"api/seed"

	"github.com/stretchr/testify/require"
)

// validSignupRequestが作るテストユーザーの年齢(女性30歳以上を満たす値)
const defaultTestAge = 36

// 有効なSignupRequestを組み立てるヘルパー(emailだけ差し替え可能)
func validSignupRequest(email string) dto.SignupRequest {
	return dto.SignupRequest{
		Email:          email,
		Password:       "password123",
		Gender:         "female",
		Birthdate:      time.Now().AddDate(-defaultTestAge, 0, 0).Format("2006-01-02"),
		Nickname:       "テストユーザー",
		PrefectureCode: seed.PrefectureTokyo,
	}
}

// emailだけ差し替えてサインアップし、レスポンス全体(id・access_tokenなど)を取得するヘルパー
func signUpOnlyEmail(t *testing.T, router http.Handler, email string) dto.SignupResponse {
	return signUpWithFields(t, router, validSignupRequest(email))
}

// nickname・生年月日などを個別にカスタムしたリクエストでサインアップするヘルパー
func signUpWithFields(t *testing.T, router http.Handler, req dto.SignupRequest) dto.SignupResponse {
	w := postJSON(t, router, "/signup", req)
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	return res
}

// ログインしてアクセストークン・リフレッシュトークンのペアを取得するヘルパー
func loginAndGetTokens(t *testing.T, router http.Handler, email string, password string) dto.LoginResponse {
	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    email,
		Password: password,
	})
	require.Equal(t, http.StatusOK, w.Code)

	var res dto.LoginResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	return res
}
