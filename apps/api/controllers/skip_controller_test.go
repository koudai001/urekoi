package controllers_test

import (
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// スキップを送ると201を返すことを検証
func TestSendSkip_Success(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "skip-from@example.com")
	to := signUpOnlyEmail(t, router, "skip-to@example.com")

	w := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: to.ID}, from.AccessToken)

	assert.Equal(t, http.StatusCreated, w.Code)
}

// 自分自身をスキップすると400を返すことを検証
func TestSendSkip_Self(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "skip-self@example.com")

	w := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: me.ID}, me.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// 同じ相手を重複してスキップすると409を返すことを検証
func TestSendSkip_Duplicate(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "skip-dup-from@example.com")
	to := signUpOnlyEmail(t, router, "skip-dup-to@example.com")

	first := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: to.ID}, from.AccessToken)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: to.ID}, from.AccessToken)
	assert.Equal(t, http.StatusConflict, second.Code)
}

// 存在しない相手をスキップすると404を返すことを検証
func TestSendSkip_UserNotFound(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "skip-notfound@example.com")

	w := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: 9999}, from.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// to_user_idが未指定の場合400を返すことを検証
func TestSendSkip_ValidationError(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "skip-invalid@example.com")

	w := postJSONWithAuth(t, router, "/skips", dto.SkipRequest{}, from.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestSendSkip_Unauthorized(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/skips", dto.SkipRequest{ToUserID: 1})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
