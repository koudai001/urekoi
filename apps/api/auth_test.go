package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

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
}

func TestSignUp_InvalidRequest(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    "not-an-email",
		Password: "short",
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

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

func TestLogin_Success(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "login@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    signupReq.Email,
		Password: signupReq.Password,
	})

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.LoginResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.AccessToken)
	assert.NotEmpty(t, res.RefreshToken)
}

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

func TestLogin_UnknownEmail(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    "notfound@example.com",
		Password: "password123",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

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

	// ローテーション済みの古いrefresh_tokenは再利用できない
	second := postJSON(t, router, "/refresh", dto.RefreshRequest{RefreshToken: loginRes.RefreshToken})
	assert.Equal(t, http.StatusUnauthorized, second.Code)
}

func TestRefresh_InvalidToken(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/refresh", dto.RefreshRequest{
		RefreshToken: "invalid-token",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

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

	// 失効済みのrefresh_tokenでの再ログアウトは401
	second := postJSON(t, router, "/logout", dto.LogoutRequest{RefreshToken: loginRes.RefreshToken})
	assert.Equal(t, http.StatusUnauthorized, second.Code)
}

func TestLogout_InvalidToken(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/logout", dto.LogoutRequest{
		RefreshToken: "invalid-token",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

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
