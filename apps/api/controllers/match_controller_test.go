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

// メッセージが1通も無いマッチだけが一覧に含まれることを検証(メッセージ済みのマッチは除外)
func TestGetUnmessagedMatches_Success(t *testing.T) {
	router, db, _ := setup(t)

	a := signUpOnlyEmail(t, router, "match-a@example.com")
	messaged := signUpOnlyEmail(t, router, "match-messaged@example.com")
	notMessaged := signUpOnlyEmail(t, router, "match-not-messaged@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: messaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, messaged.AccessToken).Code)
	matchRes := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: notMessaged.ID}, a.AccessToken)
	require.Equal(t, http.StatusCreated, matchRes.Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, notMessaged.AccessToken).Code)

	var messagedMatch models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", messaged.ID, messaged.ID).First(&messagedMatch).Error)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", messagedMatch.ID), dto.MessageRequest{Body: "よろしくお願いします"}, a.AccessToken).Code)

	var notMessagedMatch models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", notMessaged.ID, notMessaged.ID).First(&notMessagedMatch).Error)

	w := getJSONWithAuth(t, router, "/matches/unmessaged", a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, []dto.MatchProfile{
		{MatchID: notMessagedMatch.ID, UserID: notMessaged.ID, Nickname: "テストユーザー", Age: defaultTestAge, Prefecture: "東京都", Image: ""},
	}, res)
}

// マッチが1件も無い場合は空配列を返すことを検証
func TestGetUnmessagedMatches_Empty(t *testing.T) {
	router, _, _ := setup(t)

	me := signUpOnlyEmail(t, router, "match-empty@example.com")

	w := getJSONWithAuth(t, router, "/matches/unmessaged", me.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfile
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res)
}

// access_tokenがない場合は401を返すことを検証
func TestGetUnmessagedMatches_Unauthorized(t *testing.T) {
	router, _, _ := setup(t)

	w := getJSON(t, router, "/matches/unmessaged")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// メッセージが1通以上あるマッチだけが、最新メッセージの新しい順・最新メッセージ付きで一覧に含まれることを検証
func TestGetMessagedMatches_Success(t *testing.T) {
	router, db, _ := setup(t)

	a := signUpOnlyEmail(t, router, "match-hm-a@example.com")
	messaged := signUpOnlyEmail(t, router, "match-hm-messaged@example.com")
	messagedLatest := signUpOnlyEmail(t, router, "match-hm-messaged-latest@example.com")
	notMessaged := signUpOnlyEmail(t, router, "match-hm-not-messaged@example.com")

	// aをmessaged/messagedLatest/notMessagedそれぞれと相互いいねでマッチさせる
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: messaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, messaged.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: messagedLatest.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, messagedLatest.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: notMessaged.ID}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: a.ID}, notMessaged.AccessToken).Code)

	// 成立したマッチのIDを直接引いておく(notMessagedとのマッチにはメッセージを送らない)
	var messagedMatch, messagedLatestMatch models.Match
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", messaged.ID, messaged.ID).First(&messagedMatch).Error)
	require.NoError(t, db.Where("user1_id = ? OR user2_id = ?", messagedLatest.ID, messagedLatest.ID).First(&messagedLatestMatch).Error)

	// aから両方のマッチにメッセージを送る。後から送った方(messagedLatest)が一覧の先頭に来るはず
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", messagedMatch.ID), dto.MessageRequest{Body: "よろしくお願いします"}, a.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", messagedLatestMatch.ID), dto.MessageRequest{Body: "よろしく!"}, a.AccessToken).Code)

	// aから見たメッセージ済み一覧を取得する
	w := getJSONWithAuth(t, router, "/matches/messaged", a.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfileWithLastMessage
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	// notMessagedを含まず2件だけ、かつ最新メッセージの新しい順(messagedLatestが先頭)であることを検証
	require.Len(t, res, 2)
	assert.Equal(t, messagedLatest.ID, res[0].UserID)
	assert.Equal(t, messaged.ID, res[1].UserID)
}

// メッセージが1通も無い場合は空配列を返すことを検証
func TestGetMessagedMatches_Empty(t *testing.T) {
	router, _, _ := setup(t)

	me := signUpOnlyEmail(t, router, "match-hm-empty@example.com")

	w := getJSONWithAuth(t, router, "/matches/messaged", me.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.MatchProfileWithLastMessage
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMessagedMatches_Unauthorized(t *testing.T) {
	router, _, _ := setup(t)

	w := getJSON(t, router, "/matches/messaged")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// マッチ1件の詳細を、相手のプロフィール詳細込みで1回のリクエストで取得できることを検証
func TestGetMatch_Success(t *testing.T) {
	router, db, _ := setup(t)

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
		ProfileDetail: dto.ProfileDetail{
			UserID:       b.ID,
			Nickname:     "テストユーザー",
			Age:          defaultTestAge,
			Prefecture:   "東京都",
			IsNew:        true,
			Online:       "online",
			Images:       []dto.ProfileImageResponse{},
			TagIDs:       []uint64{},
			Tags:         []dto.TagSummary{},
			AlreadyLiked: true, // マッチしている時点で相互いいね済み
		},
	}, res)
}

// 存在しないmatchIdの場合404を返すことを検証
func TestGetMatch_NotFound(t *testing.T) {
	router, _, _ := setup(t)

	me := signUpOnlyEmail(t, router, "match-detail-notfound@example.com")

	w := getJSONWithAuth(t, router, "/matches/9999", me.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// マッチの当事者でないユーザーがアクセスした場合、存在を知られないよう404を返すことを検証
func TestGetMatch_NotParticipant_ReturnsNotFound(t *testing.T) {
	router, db, _ := setup(t)

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
	router, _, _ := setup(t)

	w := getJSON(t, router, "/matches/1")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
