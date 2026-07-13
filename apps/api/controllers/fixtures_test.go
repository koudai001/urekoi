package controllers_test

import (
	"testing"
	"time"

	"api/models"

	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// ユーザーとプロフィールをまとめて作成するヘルパー
func createProfile(t *testing.T, db *gorm.DB, email string, nickname string, age int16, prefectureCode int16) models.Profile {
	user := models.User{
		Email:     email,
		Password:  "hashed",
		Gender:    "female",
		Birthdate: time.Now().AddDate(-int(age), 0, 0),
	}
	require.NoError(t, db.Create(&user).Error)

	profile := models.Profile{
		UserID:         user.ID,
		Nickname:       nickname,
		PrefectureCode: prefectureCode,
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
func createProfileTag(t *testing.T, db *gorm.DB, profileID uint64, tagID uint64) {
	profileTag := models.ProfileTag{ProfileID: profileID, TagID: tagID}
	require.NoError(t, db.Create(&profileTag).Error)
}
