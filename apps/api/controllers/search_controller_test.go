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
	"gorm.io/gorm"
)

// 複数人登録されている場合に全員分の一覧(id・年齢・都道府県)を取得できることを検証
func TestListProfiles_Success(t *testing.T) {
	router, db := setupWithDB(t)

	profile1 := createProfile(t, db, "profile1@example.com", "テスト太郎", 30, seed.PrefectureTokyo)
	profile2 := createProfile(t, db, "profile2@example.com", "テスト花子", 25, seed.PrefectureOsaka)

	accessToken := signUpAndGetAccessToken(t, router, "viewer@example.com")

	w := getJSONWithAuth(t, router, "/search/all", accessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.ProfileSummary
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res)) //レスポンスボディを構造体に変換し、resに格納
	require.Len(t, res, 2)
	assert.ElementsMatch(t, []dto.ProfileSummary{
		{ID: profile1.ID, Nickname: "テスト太郎", Age: 30, Prefecture: "東京都", Image: "", IsNew: true, Online: "online"},
		{ID: profile2.ID, Nickname: "テスト花子", Age: 25, Prefecture: "大阪府", Image: "", IsNew: true, Online: "online"},
	}, res)
}

// プロフィールが1件もない場合に404を返すことを検証
func TestListProfiles_NotFound(t *testing.T) {
	router := setup(t)

	accessToken := signUpAndGetAccessToken(t, router, "viewer2@example.com")

	w := getJSONWithAuth(t, router, "/search/all", accessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestListProfiles_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/search/all")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// タグ付きプロフィールの詳細(nickname・bio・タグ・NEWバッジ判定など)を取得できることを検証
func TestGetProfileDetail_Success(t *testing.T) {
	router, db := setupWithDB(t)

	profile := createProfile(t, db, "detail@example.com", "テスト太郎", 30, seed.PrefectureTokyo)

	tag := findTagByLabel(t, db, "甘いもの大好き")
	createProfileTag(t, db, profile.ID, tag.ID, 1)

	accessToken := signUpAndGetAccessToken(t, router, "viewer3@example.com")

	w := getJSONWithAuth(t, router, fmt.Sprintf("/search/all/partner/%d", profile.ID), accessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.ProfileDetail{
		ID:         profile.ID,
		Nickname:   "テスト太郎",
		Age:        30,
		Prefecture: "東京都",
		Bio:        "よろしくお願いします",
		IsNew:      true, // 作成直後なので新着
		Online:     "online",
		Images:     []string{""},
		Tags: []dto.TagSummary{
			{Label: "甘いもの大好き", Category: "グルメ・お酒", ImageURL: "/tags/sweets.png"},
		},
	}, res)
}

// 存在しないIDの場合404を返すことを検証
func TestGetProfileDetail_NotFound(t *testing.T) {
	router := setup(t)

	accessToken := signUpAndGetAccessToken(t, router, "viewer4@example.com")

	w := getJSONWithAuth(t, router, "/search/all/partner/9999", accessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// サインアップしてaccess_tokenを取得するヘルパー
func signUpAndGetAccessToken(t *testing.T, router http.Handler, email string) string {
	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    email,
		Password: "password123",
	})
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	return res.AccessToken
}

// ユーザーとプロフィールをまとめて作成するヘルパー
func createProfile(t *testing.T, db *gorm.DB, email string, nickname string, age int16, prefectureCode int16) models.Profile {
	user := models.User{Email: email, Password: "hashed"}
	require.NoError(t, db.Create(&user).Error)

	profile := models.Profile{
		UserID:         user.ID,
		Nickname:       nickname,
		Age:            age,
		PrefectureCode: prefectureCode,
		Bio:            "よろしくお願いします",
	}
	require.NoError(t, db.Create(&profile).Error)

	return profile
}

// seed済みのタグマスタをlabelで取得するヘルパー
func findTagByLabel(t *testing.T, db *gorm.DB, label string) models.Tag {
	var tag models.Tag
	require.NoError(t, db.Where("label = ?", label).First(&tag).Error)

	return tag
}

// プロフィールにタグを紐付けるヘルパー
func createProfileTag(t *testing.T, db *gorm.DB, profileID uint64, tagID uint64, sortOrder int16) {
	profileTag := models.ProfileTag{ProfileID: profileID, TagID: tagID, SortOrder: sortOrder}
	require.NoError(t, db.Create(&profileTag).Error)
}
