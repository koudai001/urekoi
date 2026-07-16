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
	router, db := setupWithDB(t)

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

	var res dto.MyProfileResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, dto.MyProfileResponse{
		ID:             profile.ID,
		Nickname:       "テスト太郎",
		Age:            30,
		PrefectureCode: seed.PrefectureTokyo,
		Prefecture:     "東京都",
		TagIDs:         []uint64{tag.ID},
	}, res)
}

// プロフィールが存在しない場合は404を返すことを検証
func TestGetMyProfile_NotFound(t *testing.T) {
	router, db := setupWithDB(t)

	signupRes := signUpOnlyEmail(t, router, "myprofilenonexistent@example.com")

	// signupで自動作成されたプロフィールが無い状態を仕込む
	require.NoError(t, db.Where("user_id = ?", signupRes.ID).Delete(&models.Profile{}).Error)

	w := getJSONWithAuth(t, router, "/myprofile", signupRes.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestGetMyProfile_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/myprofile")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
