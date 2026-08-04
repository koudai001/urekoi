package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"api/dto"
	"api/models"
	"api/seed"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 自分のプロフィール(属性・タグ含む)を取得できることを検証
func TestGetMyProfile_Success(t *testing.T) {
	router, db, _ := setup(t)

	req := validSignupRequest("myprofile-viewer@example.com")
	req.Nickname = "テスト太郎"
	req.PrefectureCode = seed.PrefectureTokyo
	req.Birthdate = time.Now().AddDate(-30, 0, 0).Format("2006-01-02")
	signupRes := signUpWithFields(t, router, req)

	var profile models.Profile
	require.NoError(t, db.Where("user_id = ?", signupRes.ID).First(&profile).Error)

	tag := findTagByLabel(t, db, "旅行")
	createProfileTag(t, db, profile.ID, tag.ID)

	w := getJSONWithAuth(t, router, "/myprofile", signupRes.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.ProfileDetail{
		UserID:         signupRes.ID,
		Nickname:       "テスト太郎",
		Age:            30,
		PrefectureCode: seed.PrefectureTokyo,
		Prefecture:     "東京都",
		TagIDs:         []uint64{tag.ID},
		Tags: []dto.TagSummary{
			{Label: "旅行", Category: "好きなこと・挑戦してみたいこと"},
		},
		Images: []dto.ProfileImageResponse{},
	}, res)
}

// アップロード済みの画像がsort_order順に含まれることを検証
func TestGetMyProfile_WithImages(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意し、画像を2枚アップロードしておく
	router, _, _ := setup(t)
	req := validSignupRequest("myprofile-images@example.com")
	signupRes := signUpWithFields(t, router, req)

	first := createImage(t, router, signupRes.AccessToken)
	second := createImage(t, router, signupRes.AccessToken)

	// 実行: 自分のプロフィールを取得する
	w := getJSONWithAuth(t, router, "/myprofile", signupRes.AccessToken)
	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))

	// 検証: アップロード順(sort_order昇順)のまま2枚とも含まれ、URLが組み立てられていることを確認する
	require.Len(t, res.Images, 2)
	assert.Equal(t, first.ID, res.Images[0].ID)
	assert.Equal(t, second.ID, res.Images[1].ID)
	assert.Equal(t, int16(0), res.Images[0].SortOrder)
	assert.Equal(t, int16(1), res.Images[1].SortOrder)
	assert.NotEmpty(t, res.Images[0].URL)
	assert.NotEmpty(t, res.Images[1].URL)
}

// プロフィールが存在しない場合は404を返すことを検証
func TestGetMyProfile_NotFound(t *testing.T) {
	router, db, _ := setup(t)

	signupRes := signUpOnlyEmail(t, router, "myprofilenonexistent@example.com")

	// signupで自動作成されたプロフィールが無い状態を仕込む
	require.NoError(t, db.Where("user_id = ?", signupRes.ID).Delete(&models.Profile{}).Error)

	w := getJSONWithAuth(t, router, "/myprofile", signupRes.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMyProfile_Unauthorized(t *testing.T) {
	router, _, _ := setup(t)

	w := getJSON(t, router, "/myprofile")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// プロフィール属性の更新と、tag_idsによるタグの入れ替えを検証
func TestUpdateMyProfile_Success(t *testing.T) {
	// セットアップ: ログイン済みユーザーを用意する
	router, db, _ := setup(t)
	signupRes := signUpOnlyEmail(t, router, "myprofile-update@example.com")

	// 更新前のプロフィールに既存タグを紐付けておく
	var profile models.Profile
	require.NoError(t, db.Where("user_id = ?", signupRes.ID).First(&profile).Error)
	oldTag := findTagByLabel(t, db, "旅行")
	createProfileTag(t, db, profile.ID, oldTag.ID)

	// 更新後に紐付ける新しいタグを用意する
	newTag := findTagByLabel(t, db, "読書")

	// 実行: 属性とtag_idsをまとめて更新する
	w := putJSONWithAuth(t, router, "/myprofile", dto.ProfileUpdateRequest{
		Nickname:       "更新後太郎",
		PrefectureCode: seed.PrefectureOsaka,
		Bio:            "よろしくお願いします",
		TagIDs:         []uint64{newTag.ID},
	}, signupRes.AccessToken)

	// 検証: 200と、更新後の値・都道府県名・入れ替わったタグが返ることを確認する
	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileDetail
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, "更新後太郎", res.Nickname)
	assert.Equal(t, "大阪府", res.Prefecture)
	assert.Equal(t, "よろしくお願いします", res.Bio)
	assert.Equal(t, []uint64{newTag.ID}, res.TagIDs)
}

// ニックネーム未入力の場合400を返すことを検証
func TestUpdateMyProfile_ValidationError(t *testing.T) {
	router, _, _ := setup(t)
	signupRes := signUpOnlyEmail(t, router, "myprofile-update-invalid@example.com")

	w := putJSONWithAuth(t, router, "/myprofile", dto.ProfileUpdateRequest{
		PrefectureCode: seed.PrefectureTokyo,
	}, signupRes.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
