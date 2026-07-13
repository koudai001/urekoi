package controllers_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 正常な入力でサインアップが成功し201・ユーザー情報・自動ログイン用のトークンを返すことを検証
func TestSignUp_Success(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", validSignupRequest("test@example.com"))

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotZero(t, res.ID)
	assert.Equal(t, "test@example.com", res.Email)
	assert.NotEmpty(t, res.AccessToken)
	assert.NotEmpty(t, res.RefreshToken)
}

// 不正な入力(形式エラー・必須未入力・年齢制限違反)で400を返すことを検証 table-driven-test
func TestSignUp_ValidationErrors(t *testing.T) {
	router := setup(t)

	cases := []struct {
		name   string
		mutate func(req *dto.SignupRequest) // リクエストを不正に変形する関数
	}{
		{"emailの形式が不正", func(r *dto.SignupRequest) { r.Email = "not-an-email" }},
		{"passwordが短すぎる", func(r *dto.SignupRequest) { r.Password = "short" }},
		{"genderが空", func(r *dto.SignupRequest) { r.Gender = "" }},
		{"genderが不正な値", func(r *dto.SignupRequest) { r.Gender = "other" }},
		{"nicknameが空", func(r *dto.SignupRequest) { r.Nickname = "" }},
		{"prefecture_codeが未指定", func(r *dto.SignupRequest) { r.PrefectureCode = 0 }},
		{"birthdateが空", func(r *dto.SignupRequest) { r.Birthdate = "" }},
		{"birthdateの形式が不正", func(r *dto.SignupRequest) { r.Birthdate = "2024/01/01" }},
		{"実在しない日付(2月30日)", func(r *dto.SignupRequest) { r.Birthdate = "2024-02-30" }},
		{"18歳未満", func(r *dto.SignupRequest) {
			r.Birthdate = time.Now().AddDate(-17, 0, 0).Format("2006-01-02")
		}},
		{"100歳超え", func(r *dto.SignupRequest) {
			r.Birthdate = time.Now().AddDate(-101, 0, 0).Format("2006-01-02")
		}},
		{"女性30歳未満", func(r *dto.SignupRequest) {
			r.Gender = "female"
			r.Birthdate = time.Now().AddDate(-25, 0, 0).Format("2006-01-02")
		}},
		{"男性35歳超え", func(r *dto.SignupRequest) {
			r.Gender = "male"
			r.Birthdate = time.Now().AddDate(-40, 0, 0).Format("2006-01-02")
		}},
	}

	for i, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			req := validSignupRequest(fmt.Sprintf("signup-invalid-%d@example.com", i))
			c.mutate(&req)

			w := postJSON(t, router, "/signup", req)

			assert.Equal(t, http.StatusBadRequest, w.Code)
		})
	}
}

// 性別×年齢の境界値(女性ちょうど30歳・男性ちょうど35歳)は許可されることを検証　table-driven-test
func TestSignUp_AgeGenderBoundary_Success(t *testing.T) {
	router := setup(t)

	cases := []struct {
		name   string
		gender string
		age    int
	}{
		{"女性ちょうど30歳", "female", 30},
		{"男性ちょうど35歳", "male", 35},
	}

	for i, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			req := validSignupRequest(fmt.Sprintf("signup-boundary-%d@example.com", i))
			req.Gender = c.gender
			req.Birthdate = time.Now().AddDate(-c.age, 0, 0).Format("2006-01-02")

			w := postJSON(t, router, "/signup", req)

			assert.Equal(t, http.StatusCreated, w.Code)
		})
	}
}

// 同じemailで再度サインアップすると409を返すことを検証
func TestSignUp_DuplicateEmail(t *testing.T) {
	router := setup(t)

	body := validSignupRequest("dup@example.com")

	first := postJSON(t, router, "/signup", body)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSON(t, router, "/signup", body)
	assert.Equal(t, http.StatusConflict, second.Code)
}

// 正しい認証情報でログインしアクセストークン・リフレッシュトークンを取得できることを検証
func TestLogin_Success(t *testing.T) {
	router := setup(t)

	signupReq := validSignupRequest("login@example.com")
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

// 誤ったパスワードでログインすると401を返すことを検証
func TestLogin_WrongPassword(t *testing.T) {
	router := setup(t)

	signupReq := validSignupRequest("login2@example.com")
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

	signupReq := validSignupRequest("refresh@example.com")
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

	signupReq := validSignupRequest("refresh2@example.com")
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

	signupReq := validSignupRequest("logout@example.com")
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

	signupReq := validSignupRequest("logout2@example.com")
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
