package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 正常な入力でサインアップが成功し201・ユーザー情報・自動ログイン用のトークンを返すことを検証
func TestSignUp_Success(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    "test@example.com",
		Password: "password123",
	})

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotZero(t, res.ID)
	assert.Equal(t, "test@example.com", res.Email)
	assert.NotEmpty(t, res.AccessToken)
	assert.NotEmpty(t, res.RefreshToken)
}

// 不正な入力(email形式エラー・パスワード短すぎ)で400を返すことを検証
func TestSignUp_InvalidRequest(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    "not-an-email",
		Password: "short",
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// 同じemailで再度サインアップすると409を返すことを検証
func TestSignUp_DuplicateEmail(t *testing.T) {
	router := setup(t)

	body := dto.SignupRequest{
		Email:    "dup@example.com",
		Password: "password123",
	}

	first := postJSON(t, router, "/signup", body)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSON(t, router, "/signup", body)
	assert.Equal(t, http.StatusConflict, second.Code)
}

// 正しい認証情報でログインしアクセストークン・リフレッシュトークンを取得できることを検証
func TestLogin_Success(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "login@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	w := postJSON(t, router, "/login", dto.LoginRequest(signupReq))

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.LoginResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.AccessToken)
	assert.NotEmpty(t, res.RefreshToken)
}

// 誤ったパスワードでログインすると401を返すことを検証
func TestLogin_WrongPassword(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "login2@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    signupReq.Email,
		Password: "wrongpassword",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// 未登録のemailでログインすると401を返すことを検証
func TestLogin_UnknownEmail(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    "notfound@example.com",
		Password: "password123",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// refresh_tokenで新しいトークンに更新でき、トークンがローテーションされることを検証
func TestRefresh_Success(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "refresh@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	loginRes := loginAndGetTokens(t, router, signupReq.Email, signupReq.Password)

	w := postJSON(t, router, "/refresh", dto.RefreshRequest{
		RefreshToken: loginRes.RefreshToken,
	})

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.RefreshResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.AccessToken)
	assert.NotEmpty(t, res.RefreshToken)
	assert.NotEqual(t, loginRes.RefreshToken, res.RefreshToken)
}

// ローテーション済みの古いrefresh_tokenを再利用すると401を返すことを検証
func TestRefresh_RotatedTokenCannotBeReused(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "refresh2@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	loginRes := loginAndGetTokens(t, router, signupReq.Email, signupReq.Password)

	first := postJSON(t, router, "/refresh", dto.RefreshRequest{RefreshToken: loginRes.RefreshToken})
	require.Equal(t, http.StatusOK, first.Code)

	second := postJSON(t, router, "/refresh", dto.RefreshRequest{RefreshToken: loginRes.RefreshToken})
	assert.Equal(t, http.StatusUnauthorized, second.Code)
}

// 無効なrefresh_tokenでのリフレッシュは401を返すことを検証
func TestRefresh_InvalidToken(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/refresh", dto.RefreshRequest{
		RefreshToken: "invalid-token",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// refresh_tokenでログアウトすると204を返すことを検証
func TestLogout_Success(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "logout@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	loginRes := loginAndGetTokens(t, router, signupReq.Email, signupReq.Password)

	w := postJSON(t, router, "/logout", dto.LogoutRequest{
		RefreshToken: loginRes.RefreshToken,
	})

	assert.Equal(t, http.StatusNoContent, w.Code)
}

// 失効済みのrefresh_tokenで再度ログアウトすると401を返すことを検証
func TestLogout_RevokedTokenCannotBeReused(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "logout2@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	loginRes := loginAndGetTokens(t, router, signupReq.Email, signupReq.Password)

	first := postJSON(t, router, "/logout", dto.LogoutRequest{RefreshToken: loginRes.RefreshToken})
	require.Equal(t, http.StatusNoContent, first.Code)

	second := postJSON(t, router, "/logout", dto.LogoutRequest{RefreshToken: loginRes.RefreshToken})
	assert.Equal(t, http.StatusUnauthorized, second.Code)
}

// 無効なrefresh_tokenでのログアウトは401を返すことを検証
func TestLogout_InvalidToken(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/logout", dto.LogoutRequest{
		RefreshToken: "invalid-token",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
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
