package usecases

import (
	"errors"
	"os"

	"api/models"
)

var ErrProfileNotFound = errors.New("profile not found")

var ErrProfileAlreadyExists = errors.New("profile already exists")

// 写真が1枚も無いプロフィールに対して返すダミー画像(表示側でダミー画像に差し替える)
const dummyImagePath = ""

// S3のkeyから閲覧用URLを組み立てる。keyが空(ダミー画像)ならそのまま返す
func buildImageURL(key string) string {
	if key == "" {
		return key
	}

	return os.Getenv("IMAGE_BASE_URL") + "/" + key
}

// 1枚目の画像URLを返す。写真が無ければダミー画像
func firstImageURL(images []models.ProfileImage) string {
	if len(images) == 0 {
		return dummyImagePath
	}

	return buildImageURL(images[0].ImageKey)
}
