package seed

import (
	"api/models"

	"gorm.io/gorm"
)

// テストなどから参照する主要な都道府県コード(JIS X 0401)
const (
	PrefectureTokyo = 13
	PrefectureOsaka = 27
)

// 都道府県マスタ(JIS X 0401コード 1〜47)
var prefectures = []models.Prefecture{
	{ID: 1, Name: "北海道"},
	{ID: 2, Name: "青森県"},
	{ID: 3, Name: "岩手県"},
	{ID: 4, Name: "宮城県"},
	{ID: 5, Name: "秋田県"},
	{ID: 6, Name: "山形県"},
	{ID: 7, Name: "福島県"},
	{ID: 8, Name: "茨城県"},
	{ID: 9, Name: "栃木県"},
	{ID: 10, Name: "群馬県"},
	{ID: 11, Name: "埼玉県"},
	{ID: 12, Name: "千葉県"},
	{ID: PrefectureTokyo, Name: "東京都"},
	{ID: 14, Name: "神奈川県"},
	{ID: 15, Name: "新潟県"},
	{ID: 16, Name: "富山県"},
	{ID: 17, Name: "石川県"},
	{ID: 18, Name: "福井県"},
	{ID: 19, Name: "山梨県"},
	{ID: 20, Name: "長野県"},
	{ID: 21, Name: "岐阜県"},
	{ID: 22, Name: "静岡県"},
	{ID: 23, Name: "愛知県"},
	{ID: 24, Name: "三重県"},
	{ID: 25, Name: "滋賀県"},
	{ID: 26, Name: "京都府"},
	{ID: PrefectureOsaka, Name: "大阪府"},
	{ID: 28, Name: "兵庫県"},
	{ID: 29, Name: "奈良県"},
	{ID: 30, Name: "和歌山県"},
	{ID: 31, Name: "鳥取県"},
	{ID: 32, Name: "島根県"},
	{ID: 33, Name: "岡山県"},
	{ID: 34, Name: "広島県"},
	{ID: 35, Name: "山口県"},
	{ID: 36, Name: "徳島県"},
	{ID: 37, Name: "香川県"},
	{ID: 38, Name: "愛媛県"},
	{ID: 39, Name: "高知県"},
	{ID: 40, Name: "福岡県"},
	{ID: 41, Name: "佐賀県"},
	{ID: 42, Name: "長崎県"},
	{ID: 43, Name: "熊本県"},
	{ID: 44, Name: "大分県"},
	{ID: 45, Name: "宮崎県"},
	{ID: 46, Name: "鹿児島県"},
	{ID: 47, Name: "沖縄県"},
}

// マイタグマスタ
var tags = []models.Tag{
	{Label: "甘いもの大好き", Category: "グルメ・お酒", ImageURL: "/tags/sweets.png"},
	{Label: "ディズニー好き", Category: "趣味全般", ImageURL: "/tags/themepark.png"},
	{Label: "漫画が好き", Category: "本・マンガ", ImageURL: "/tags/manga.png"},
	{Label: "寝るの幸せ", Category: "心と身体", ImageURL: "/tags/sleep.png"},
	{Label: "ライブ・フェス好き", Category: "音楽", ImageURL: "/tags/live.png"},
	{Label: "食べることが大好き", Category: "グルメ・お酒", ImageURL: "/tags/food.png"},
	{Label: "ワイン好き", Category: "グルメ・お酒", ImageURL: "/tags/wine.png"},
	{Label: "旅行好き", Category: "趣味全般", ImageURL: "/tags/travel.png"},
}

// 都道府県・マイタグなどのマスタデータを投入する(冪等、AutoMigrateの後に呼ぶこと)
// テスト・マイグレーション両方から呼ぶ想定
func SeedDefault(db *gorm.DB) error {
	for _, p := range prefectures {
		if err := db.FirstOrCreate(&p, models.Prefecture{ID: p.ID}).Error; err != nil {
			return err
		}
	}

	for _, tag := range tags {
		t := tag
		if err := db.Where(models.Tag{Label: t.Label}).FirstOrCreate(&t).Error; err != nil {
			return err
		}
	}

	return nil
}
