package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"
	"api/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 相互いいねでマッチした相手が一覧に含まれることを検証
func TestGetMatches_Success(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "match-a@example.com")
	b := signUpOnlyEmail(t, router, "match-b@example.com")

	// お互いにいいねを送ってマッチさせる
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: b.ID}, a.AccessToken).Code)
	matchRes := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, b.AccessToken)
	require.Equal(t, http.StatusCreated, matchRes.Code)

	var likeRes dto.LikeResponse
	require.NoError(t, json.Unmarshal(matchRes.Body.Bytes(), &likeRes))
	require.True(t, likeRes.Matched)

	// 成立したマッチのIDを直接引いておく
	var match models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", a.ID, a.ID).First(&match).Error)

	// aから見たマッチ一覧にbが含まれることを検証
	w := getJSONWithAuth(t, router, "/matches", a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, []dto.MatchProfile{
		{MatchID: match.ID, UserID: b.ID, Nickname: "テストユーザー", Age: defaultTestAge, Prefecture: "東京都", Image: ""},
	}, res)
}

// マッチが1件も無い場合は空配列を返すことを検証
func TestGetMatches_Empty(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "match-empty@example.com")

	w := getJSONWithAuth(t, router, "/matches", me.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMatches_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/matches")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
