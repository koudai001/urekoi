package usecases

import "api/models"

// プロフィール画像アップロード機能が未実装のため、暫定的に空を返す(表示側でダミー画像に差し替える)
const dummyImagePath = ""

// 1枚目の画像URLを返す。写真が無ければダミー画像
func firstImageURL(images []models.ProfileImage) string {
	if len(images) == 0 {
		return dummyImagePath
	}

	return images[0].URL
}

// 画像URL一覧を返す。写真が無ければダミー画像1枚
func imageURLs(images []models.ProfileImage) []string {
	if len(images) == 0 {
		return []string{dummyImagePath}
	}

	urls := make([]string, 0, len(images))
	for _, image := range images {
		urls = append(urls, image.URL)
	}

	return urls
}
