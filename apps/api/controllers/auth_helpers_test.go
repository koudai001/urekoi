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

// プロフィール作成テストで使う標準年齢
const defaultTestAge = 36

// 有効な認証情報を組み立てるヘルパー(emailだけ差し替え可能)
func validSignupRequest(email string) dto.SignupRequest {
	return dto.SignupRequest{
		Email:    email,
		Password: "password123",
	}
}

// emailだけ差し替えてサインアップし、レスポンス全体(id・access_tokenなど)を取得するヘルパー
func signUpOnlyEmail(t *testing.T, router http.Handler, email string) dto.SignupResponse {
	w := postJSON(t, router, "/signup", validSignupRequest(email))
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	return res
}

// サインアップ後にデフォルト値でプロフィールまで作成するヘルパー
func signUpWithProfile(t *testing.T, router http.Handler, email string) dto.SignupResponse {
	signupRes := signUpOnlyEmail(t, router, email)
	createMyProfile(t, router, signupRes, validProfileCreateRequest())
	return signupRes
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

func createMyProfile(t *testing.T, router http.Handler, signupRes dto.SignupResponse, req dto.ProfileCreateRequest) dto.ProfileDetail {
	t.Helper()
	w := postJSONWithAuth(t, router, "/myprofile", req, signupRes.AccessToken)
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	return res
}

func validProfileCreateRequest() dto.ProfileCreateRequest {
	return dto.ProfileCreateRequest{
		Nickname:       "テストユーザー",
		PrefectureCode: seed.PrefectureTokyo,
		Gender:         "female",
		Birthdate:      time.Now().AddDate(-defaultTestAge, 0, 0).Format("2006-01-02"),
	}
}
