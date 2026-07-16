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

// 複数人登録されている場合に、自分以外の全員分の一覧(id・年齢・都道府県)を取得できることを検証
// (signupは自動でプロフィールも作るため、一覧確認用のviewer自身は結果から除外されること)
func TestListProfiles_Success(t *testing.T) {
	router, db := setupWithDB(t)

	profile1 := createProfile(t, db, "profile1@example.com", "テスト太郎", 30, seed.PrefectureTokyo)
	profile2 := createProfile(t, db, "profile2@example.com", "テスト花子", 25, seed.PrefectureOsaka)

	viewerRes := signUpOnlyEmail(t, router, "viewer@example.com")

	w := getJSONWithAuth(t, router, "/search/all", viewerRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.ProfileSummary
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res)) //レスポンスボディを構造体に変換し、resに格納
	require.Len(t, res, 2)
	assert.ElementsMatch(t, []dto.ProfileSummary{
		{ID: profile1.UserID, Nickname: "テスト太郎", Age: 30, Prefecture: "東京都", Image: "", IsNew: true, Online: "online"},
		{ID: profile2.UserID, Nickname: "テスト花子", Age: 25, Prefecture: "大阪府", Image: "", IsNew: true, Online: "online"},
	}, res)
}

// プロフィールが1件もない場合に404を返すことを検証
// (signupが自動でプロフィールも作るため、あえてDBから削除して0件の状態を作る)
func TestListProfiles_NotFound(t *testing.T) {
	router, db := setupWithDB(t)

	viewerRes := signUpOnlyEmail(t, router, "viewer2@example.com")
	require.NoError(t, db.Where("user_id = ?", viewerRes.ID).Delete(&models.Profile{}).Error)

	w := getJSONWithAuth(t, router, "/search/all", viewerRes.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestListProfiles_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/search/all")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// タグ付きプロフィールの詳細(nickname・タグ・NEWバッジ判定など)を取得できることを検証
func TestGetProfileDetail_Success(t *testing.T) {
	router, db := setupWithDB(t)

	profile := createProfile(t, db, "detail@example.com", "テスト太郎", 30, seed.PrefectureTokyo)

	tag := findTagByLabel(t, db, "旅行")
	createProfileTag(t, db, profile.ID, tag.ID)

	accessToken := signUpOnlyEmail(t, router, "viewer3@example.com").AccessToken

	w := getJSONWithAuth(t, router, fmt.Sprintf("/search/all/partner/%d", profile.UserID), accessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.ProfileDetail{
		ID:         profile.UserID,
		Nickname:   "テスト太郎",
		Age:        30,
		Prefecture: "東京都",
		IsNew:      true, // 作成直後なので新着
		Online:     "online",
		Images:     []string{""},
		Tags: []dto.TagSummary{
			{Label: "旅行", Category: "好きなこと・挑戦してみたいこと", ImageURL: ""},
		},
	}, res)
}

// 存在しないIDの場合404を返すことを検証
func TestGetProfileDetail_NotFound(t *testing.T) {
	router := setup(t)

	accessToken := signUpOnlyEmail(t, router, "viewer4@example.com").AccessToken

	w := getJSONWithAuth(t, router, "/search/all/partner/9999", accessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
