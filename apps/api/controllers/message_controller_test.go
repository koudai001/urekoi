package controllers_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"api/dto"
	"api/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// aとbを相互いいねでマッチさせ、そのMatchIDを返す
func createMatch(t *testing.T, router http.Handler, db *gorm.DB, a, b dto.SignupResponse) uint64 {
	// テスト失敗時のスタックトレースにこの関数が表示されなくなる
	t.Helper()

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: b.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, b.AccessToken).Code)

	var match models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", a.ID, a.ID).First(&match).Error)

	return match.ID
}

// マッチ相手にメッセージを送信できることを検証
func TestSendMessage_Success(t *testing.T) {
	router, db := setupWithDB(t)

	// aとbを相互いいねでマッチさせる
	a := signUpOnlyEmail(t, router, "message-send-a@example.com")
	b := signUpOnlyEmail(t, router, "message-send-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	// aがbにメッセージを送信する
	w := postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "よろしくお願いします"}, a.AccessToken)

	// 201 Createdが返ることを検証
	require.Equal(t, http.StatusCreated, w.Code)

	// レスポンスの内容を検証
	var res dto.MessageResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, a.ID, res.SenderUserID)
	assert.Equal(t, "よろしくお願いします", res.Body)
}

// マッチの当事者以外が送信すると403を返すことを検証
func TestSendMessage_NotParticipant(t *testing.T) {
	router, db := setupWithDB(t)

	// aとbを相互いいねでマッチさせる
	a := signUpOnlyEmail(t, router, "message-outsider-a@example.com")
	b := signUpOnlyEmail(t, router, "message-outsider-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	// そのマッチに対して、outsiderが送信しようとする
	outsider := signUpOnlyEmail(t, router, "message-outsider-c@example.com")
	w := postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "hi"}, outsider.AccessToken)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// 存在しないmatchIDへの送信は404を返すことを検証
func TestSendMessage_MatchNotFound(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "message-notfound@example.com")

	w := postJSONWithAuth(t, router, "/matches/9999/messages", dto.MessageRequest{Body: "hi"}, me.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// 本文が空の場合は400を返すことを検証
func TestSendMessage_ValidationError(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "message-invalid-a@example.com")
	b := signUpOnlyEmail(t, router, "message-invalid-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	w := postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: ""}, a.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestSendMessage_Unauthorized(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/matches/1/messages", dto.MessageRequest{Body: "hi"})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// メッセージ履歴を新しい順に取得できることを検証
func TestGetMessages_Success(t *testing.T) {
	router, db := setupWithDB(t)

	// aとbを相互いいねでマッチさせる
	a := signUpOnlyEmail(t, router, "message-history-a@example.com")
	b := signUpOnlyEmail(t, router, "message-history-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	// aとbがそれぞれメッセージを送信する
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "1通目"}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "2通目"}, b.AccessToken).Code)

	// メッセージ履歴を取得する
	w := getJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	// レスポンスの内容を検証
	var res []dto.MessageResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 2)
	// 新しい順なので2通目が先頭
	assert.Equal(t, "2通目", res[0].Body)
	assert.Equal(t, "1通目", res[1].Body)
}

// before_idを指定すると、それより古いメッセージだけ取得できることを検証
func TestGetMessages_BeforeIDCursor(t *testing.T) {
	router, db := setupWithDB(t)

	// aとbを相互いいねでマッチさせる
	a := signUpOnlyEmail(t, router, "message-cursor-a@example.com")
	b := signUpOnlyEmail(t, router, "message-cursor-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "1通目"}, a.AccessToken).Code)
	secondRes := postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "2通目"}, b.AccessToken)
	require.Equal(t, http.StatusCreated, secondRes.Code)

	var second dto.MessageResponse
	require.NoError(t, json.Unmarshal(secondRes.Body.Bytes(), &second))

	// before_idに2通目のIDを指定して取得する
	w := getJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages?before_id=%d", matchID, second.ID), a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MessageResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, "1通目", res[0].Body)
}

// マッチの当事者以外が取得しようとすると403を返すことを検証
func TestGetMessages_NotParticipant(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "message-get-outsider-a@example.com")
	b := signUpOnlyEmail(t, router, "message-get-outsider-b@example.com")
	outsider := signUpOnlyEmail(t, router, "message-get-outsider-c@example.com")
	matchID := createMatch(t, router, db, a, b)

	w := getJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), outsider.AccessToken)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMessages_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/matches/1/messages")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
