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

// 新着順・取得件数・カーソルを指定し、候補を重複なくページングできることを検証
func TestSearchPartners_Success(t *testing.T) {
	router, db, _ := setup(t)

	profile1 := createProfile(t, db, "recs1@example.com", "テスト太郎", 30, seed.PrefectureTokyo)
	profile2 := createProfile(t, db, "recs2@example.com", "テスト花子", 25, seed.PrefectureOsaka)

	viewerRes := signUpOnlyEmail(t, router, "recs-viewer@example.com")

	// 新着順の1ページ目を1件だけ取得する。
	w := getJSONWithAuth(t, router, "/partner/search?sort=newest&limit=1", viewerRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerSearchResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res.Profiles, 1)
	assert.Equal(t, profile2.UserID, res.Profiles[0].UserID)
	require.NotNil(t, res.NextCursor)
	assert.Equal(t, profile2.UserID, *res.NextCursor)

	// 返されたカーソルから次ページを取得し、残りの候補と最終ページ判定を確認する。
	nextURL := fmt.Sprintf("/partner/search?sort=newest&limit=1&cursor=%d", *res.NextCursor)
	w = getJSONWithAuth(t, router, nextURL, viewerRes.AccessToken)
	require.Equal(t, http.StatusOK, w.Code)

	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res.Profiles, 1)
	assert.Equal(t, profile1.UserID, res.Profiles[0].UserID)
	assert.Nil(t, res.NextCursor)
}

// 不正な検索クエリをUsecaseへ渡さず、400として返すことを検証
func TestSearchPartners_InvalidQuery(t *testing.T) {
	router, _, _ := setup(t)
	viewer := signUpOnlyEmail(t, router, "recs-invalid-query@example.com")

	tests := []string{
		"/partner/search?sort=unknown",
		"/partner/search?cursor=invalid",
		"/partner/search?limit=51",
	}

	for _, path := range tests {
		w := getJSONWithAuth(t, router, path, viewer.AccessToken)
		assert.Equal(t, http.StatusBadRequest, w.Code, path)
	}
}

// 既にいいね済みの相手は候補から除外されることを検証
func TestSearchPartners_ExcludesAlreadyLiked(t *testing.T) {
	router, db, _ := setup(t)

	liked := createProfile(t, db, "recs-liked@example.com", "いいね済み", 30, seed.PrefectureTokyo)
	other := createProfile(t, db, "recs-other@example.com", "未いいね", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-like@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: liked.UserID}, viewer.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/search", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerSearchResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res.Profiles, 1)
	assert.Equal(t, other.UserID, res.Profiles[0].UserID)
}

// 既にスキップ済みの相手は候補から除外されることを検証
func TestSearchPartners_ExcludesSkipped(t *testing.T) {
	router, db, _ := setup(t)

	skipped := createProfile(t, db, "recs-skipped@example.com", "スキップ済み", 30, seed.PrefectureTokyo)
	other := createProfile(t, db, "recs-other2@example.com", "未スキップ", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-skip@example.com")

	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: skipped.UserID}, viewer.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/search", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerSearchResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res.Profiles, 1)
	assert.Equal(t, other.UserID, res.Profiles[0].UserID)
}

// マッチ済みの相手は候補から除外されることを検証
func TestSearchPartners_ExcludesMatched(t *testing.T) {
	router, db, _ := setup(t)

	// 相互いいねを送る側なのでaccess_tokenが要るためsignupで作る(signupは自動でプロフィールも作る)
	matched := signUpOnlyEmail(t, router, "recs-matched@example.com")
	other := createProfile(t, db, "recs-other3@example.com", "未マッチ", 28, seed.PrefectureTokyo)

	viewer := signUpOnlyEmail(t, router, "recs-viewer-match@example.com")

	// お互いにいいねを送ってマッチさせる
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: matched.ID}, viewer.AccessToken).Code)
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: viewer.ID}, matched.AccessToken).Code)

	w := getJSONWithAuth(t, router, "/partner/search", viewer.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerSearchResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res.Profiles, 1)
	assert.Equal(t, other.UserID, res.Profiles[0].UserID)
}

// 候補となるプロフィールが1件もない場合に空配列(200)を返すことを検証
func TestSearchPartners_Empty(t *testing.T) {
	router, db, _ := setup(t)

	viewerRes := signUpOnlyEmail(t, router, "recs-viewer-empty@example.com")
	require.NoError(t, db.Where("user_id = ?", viewerRes.ID).Delete(&models.Profile{}).Error)

	w := getJSONWithAuth(t, router, "/partner/search", viewerRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PartnerSearchResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res.Profiles)
	assert.Nil(t, res.NextCursor)
}

// access_tokenがない場合は401を返すことを検証
func TestSearchPartners_Unauthorized(t *testing.T) {
	router, _, _ := setup(t)

	w := getJSON(t, router, "/partner/search")

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

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.ProfileDetail{
		UserID:       profile.UserID,
		Nickname:     "テスト太郎",
		Age:          30,
		Prefecture:   "東京都",
		IsNew:        true, // 作成直後なので新着
		Online:       "online",
		Images:       []dto.ProfileImageResponse{},
		AlreadyLiked: false, // まだいいねしていない
		TagIDs:       []uint64{tag.ID},
		Tags: []dto.TagSummary{
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

	var res dto.ProfileDetail
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
