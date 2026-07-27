package controllers_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"api/dto"
	"api/models"
	"api/seed"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 複数人登録されている場合に、自分以外の全員分のプロフィール詳細一覧を取得できることを検証
func TestGetRecs_Success(t *testing.T) {
	router, db, _ := setup(t)

	profile1 := createProfile(t, db, "recs1@example.com", "テスト太郎", 30, seed.PrefectureTokyo)
	profile2 := createProfile(t, db, "recs2@example.com", "テスト花子", 25, seed.PrefectureOsaka)

	viewerRes := signUpOnlyEmail(t, router, "recs-viewer@example.com")

	w := getJSONWithAuth(t, router, "/partner/recs", viewerRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 2)
	assert.ElementsMatch(t, []dto.PartnerResponse{
		{UserID: profile1.UserID, Nickname: "テスト太郎", Age: 30, Prefecture: "東京都", Images: []string{""}, IsNew: true, Online: "online", Tags: []dto.RecsTagSummary{}, AlreadyLiked: false},
		{UserID: profile2.UserID, Nickname: "テスト花子", Age: 25, Prefecture: "大阪府", Images: []string{""}, IsNew: true, Online: "online", Tags: []dto.RecsTagSummary{}, AlreadyLiked: false},
	}, res)
}

// 既にいいね済みの相手は候補から除外されることを検証
func TestGetRecs_ExcludesAlreadyLiked(t *testing.T) {
	router, db, _ := setup(t)

	liked := createProfile(t, db, "recs-liked@example.com", "いいね済み", 30, seed.PrefectureTokyo)
	other := createProfile(t, db, "recs-other@example.com", "未いいね", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-like@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: liked.UserID}, viewer.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/recs", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, other.UserID, res[0].UserID)
}

// 既にスキップ済みの相手は候補から除外されることを検証
func TestGetRecs_ExcludesSkipped(t *testing.T) {
	router, db, _ := setup(t)

	skipped := createProfile(t, db, "recs-skipped@example.com", "スキップ済み", 30, seed.PrefectureTokyo)
	other := createProfile(t, db, "recs-other2@example.com", "未スキップ", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-skip@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: skipped.UserID}, viewer.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/recs", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, other.UserID, res[0].UserID)
}

// マッチ済みの相手は候補から除外されることを検証
func TestGetRecs_ExcludesMatched(t *testing.T) {
	router, db, _ := setup(t)

	// 相互いいねを送る側なのでaccess_tokenが要るためsignupで作る(signupは自動でプロフィールも作る)
	matched := signUpOnlyEmail(t, router, "recs-matched@example.com")
	other := createProfile(t, db, "recs-other3@example.com", "未マッチ", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-match@example.com")

	// お互いにいいねを送ってマッチさせる
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: matched.ID}, viewer.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: viewer.ID}, matched.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/recs", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 1)
	assert.Equal(t, other.UserID, res[0].UserID)
}

// 候補となるプロフィールが1件もない場合に空配列(200)を返すことを検証
func TestGetRecs_Empty(t *testing.T) {
	router, db, _ := setup(t)

	viewerRes := signUpOnlyEmail(t, router, "recs-viewer-empty@example.com")
	require.NoError(t, db.Where("user_id = ?", viewerRes.ID).Delete(&models.Profile{}).Error)

	w := getJSONWithAuth(t, router, "/partner/recs", viewerRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res)
}

// access_tokenがない場合は401を返すことを検証
func TestGetRecs_Unauthorized(t *testing.T) {
	router, _, _ := setup(t)

	w := getJSON(t, router, "/partner/recs")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// タグ付きプロフィールの詳細(nickname・タグ・NEWバッジ判定など)を取得できることを検証(未いいね)
func TestGetDetail_Success(t *testing.T) {
	router, db, _ := setup(t)

	profile := createProfile(t, db, "recs-detail@example.com", "テスト太郎", 30, seed.PrefectureTokyo)

	tag := findTagByLabel(t, db, "旅行")
	createProfileTag(t, db, profile.ID, tag.ID)

	accessToken := signUpOnlyEmail(t, router, "recs-viewer3@example.com").AccessToken

	w := getJSONWithAuth(t, router, fmt.Sprintf("/partner/%d", profile.UserID), accessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.PartnerResponse{
		UserID:       profile.UserID,
		Nickname:     "テスト太郎",
		Age:          30,
		Prefecture:   "東京都",
		IsNew:        true, // 作成直後なので新着
		Online:       "online",
		Images:       []string{""},
		AlreadyLiked: false, // まだいいねしていない
		Tags: []dto.RecsTagSummary{
			{Label: "旅行", Category: "好きなこと・挑戦してみたいこと", ImageURL: ""},
		},
	}, res)
}

// 既にいいね済みの相手はalready_liked: trueで返ることを検証
func TestGetDetail_AlreadyLiked(t *testing.T) {
	router, db, _ := setup(t)

	profile := createProfile(t, db, "recs-already-liked@example.com", "テスト花子", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer5@example.com")
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: profile.UserID}, viewer.AccessToken).Code)

	w := getJSONWithAuth(t, router, fmt.Sprintf("/partner/%d", profile.UserID), viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.True(t, res.AlreadyLiked)
}

// 存在しないIDの場合404を返すことを検証
func TestGetDetail_NotFound(t *testing.T) {
	router, _, _ := setup(t)

	accessToken := signUpOnlyEmail(t, router, "recs-viewer4@example.com").AccessToken

	w := getJSONWithAuth(t, router, "/partner/9999", accessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
