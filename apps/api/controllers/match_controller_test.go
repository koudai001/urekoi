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

// has_messages=trueでメッセージが1通でもあるマッチだけに絞り込めることを検証
func TestGetMatches_FilterByHasMessageTrue(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "match-hm-a@example.com")
	messaged := signUpOnlyEmail(t, router, "match-hm-messaged@example.com")
	notMessaged := signUpOnlyEmail(t, router, "match-hm-not-messaged@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: messaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, messaged.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: notMessaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, notMessaged.AccessToken).Code)

	var messagedMatch models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", messaged.ID, messaged.ID).First(&messagedMatch).Error)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", messagedMatch.ID), dto.MessageRequest{Body: "よろしくお願いします"}, a.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/matches?has_messages=true", a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, messaged.ID, res[0].UserID)
}

// has_messages=falseでメッセージが1通も無いマッチだけに絞り込めることを検証
func TestGetMatches_FilterByHasMessageFalse(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "match-hmf-a@example.com")
	messaged := signUpOnlyEmail(t, router, "match-hmf-messaged@example.com")
	notMessaged := signUpOnlyEmail(t, router, "match-hmf-not-messaged@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: messaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, messaged.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: notMessaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, notMessaged.AccessToken).Code)

	var messagedMatch models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", messaged.ID, messaged.ID).First(&messagedMatch).Error)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", messagedMatch.ID), dto.MessageRequest{Body: "よろしくお願いします"}, a.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/matches?has_messages=false", a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, notMessaged.ID, res[0].UserID)
}

// has_messagesの値が不正な場合400を返すことを検証
func TestGetMatches_InvalidHasMessage(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "match-hm-invalid@example.com")

	w := getJSONWithAuth(t, router, "/matches?has_messages=maybe", me.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// マッチ1件の詳細を、相手のプロフィール詳細込みで1回のリクエストで取得できることを検証
func TestGetMatch_Success(t *testing.T) {
	router, db := setupWithDB(t)

	a := signUpOnlyEmail(t, router, "match-detail-a@example.com")
	b := signUpOnlyEmail(t, router, "match-detail-b@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: b.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, b.AccessToken).Code)

	var match models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", a.ID, a.ID).First(&match).Error)

	w := getJSONWithAuth(t, router, fmt.Sprintf("/matches/%d", match.ID), a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.MatchProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))

	// JSON往復でtime.Locationの表現が変わるだけなので、時刻自体の一致だけ見て以降の比較からは外す
	assert.True(t, match.MatchedAt.Equal(res.MatchedAt))
	res.MatchedAt = match.MatchedAt

	assert.Equal(t, dto.MatchProfileDetail{
		MatchID:   match.ID,
		MatchedAt: match.MatchedAt,
		PartnerResponse: dto.PartnerResponse{
			UserID:       b.ID,
			Nickname:     "テストユーザー",
			Age:          defaultTestAge,
			Prefecture:   "東京都",
			IsNew:        true,
			Online:       "online",
			Images:       []string{""},
			Tags:         []dto.RecsTagSummary{},
			AlreadyLiked: true, // マッチしている時点で相互いいね済み
		},
	}, res)
}

// 存在しないmatchIdの場合404を返すことを検証
func TestGetMatch_NotFound(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "match-detail-notfound@example.com")

	w := getJSONWithAuth(t, router, "/matches/9999", me.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// マッチの当事者でないユーザーがアクセスした場合、存在を知られないよう404を返すことを検証
func TestGetMatch_NotParticipant_ReturnsNotFound(t *testing.T) {
	router, db := setupWithDB(t)

	c := signUpOnlyEmail(t, router, "match-detail-c@example.com")
	d := signUpOnlyEmail(t, router, "match-detail-d@example.com")
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: d.ID}, c.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: c.ID}, d.AccessToken).Code)

	var match models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", c.ID, c.ID).First(&match).Error)

	outsider := signUpOnlyEmail(t, router, "match-detail-outsider@example.com")

	w := getJSONWithAuth(t, router, fmt.Sprintf("/matches/%d", match.ID), outsider.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMatch_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/matches/1")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
