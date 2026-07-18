package seed

import (
	"time"

	"api/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ローカル確認用のダミーユーザーのパスワード(このままログインもできる)
const dummyUserPassword = "password123"

type dummyProfile struct {
	Email          string
	Nickname       string
	Gender         string
	Age            int16 // Birthdateへ変換して保存する用の指定値
	PrefectureCode int16
	Bio            string
	TagLabels      []string
	PhotoURLs      []string
}

// プロフィール一覧・詳細画面の見た目を確認するためのダミーユーザー
var dummyProfiles = []dummyProfile{
	{
		Email:          "seed-misaki@gmail.com",
		Nickname:       "美咲",
		Gender:         "female",
		Age:            42,
		PrefectureCode: PrefectureTokyo,
		Bio:            "落ち着いた時間を一緒に過ごせる方を探しています。",
		TagLabels:      []string{"ワイン", "旅行"},
		PhotoURLs:      []string{"/profiles/woman-1.png", "/profiles/woman-3.png", "/profiles/woman-5.png"},
	},
	{
		Email:          "seed-yukari@gmail.com",
		Nickname:       "由香里",
		Gender:         "female",
		Age:            38,
		PrefectureCode: 14, // 神奈川県
		Bio:            "年下の方とお話してみたいです。よろしくお願いします。",
		TagLabels:      []string{"旅行", "焼肉"},
		PhotoURLs:      []string{"/profiles/woman-2.png", "/profiles/woman-4.png"},
	},
	{
		Email:          "seed-chinatsu@gmail.com",
		Nickname:       "千夏",
		Gender:         "female",
		Age:            45,
		PrefectureCode: PrefectureTokyo,
		Bio:            "大人の余裕を大切にしています。素敵なご縁を。",
		TagLabels:      []string{"読書", "映画鑑賞"},
		PhotoURLs:      []string{"/profiles/woman-3.png", "/profiles/woman-6.png", "/profiles/woman-8.png"},
	},
	{
		Email:          "seed-aya@gmail.com",
		Nickname:       "彩",
		Gender:         "female",
		Age:            39,
		PrefectureCode: 11, // 埼玉県
		Bio:            "気軽にメッセージいただけると嬉しいです。",
		TagLabels:      []string{"旅行", "映画鑑賞"},
		PhotoURLs:      []string{"/profiles/woman-4.png", "/profiles/woman-7.png"},
	},
	{
		Email:          "seed-mai@gmail.com",
		Nickname:       "麻衣",
		Gender:         "female",
		Age:            41,
		PrefectureCode: 12, // 千葉県
		Bio:            "ゆっくりお話できる関係が理想です。",
		TagLabels:      []string{"読書", "スポーツ観戦"},
		PhotoURLs:      []string{"/profiles/woman-5.png", "/profiles/woman-2.png", "/profiles/woman-7.png"},
	},
	{
		Email:          "seed-reina@gmail.com",
		Nickname:       "玲奈",
		Gender:         "female",
		Age:            38,
		PrefectureCode: PrefectureTokyo,
		Bio:            "感性の合う方とお会いしたいです。",
		TagLabels:      []string{"ワイン", "スイーツ"},
		PhotoURLs:      []string{"/profiles/woman-6.png", "/profiles/woman-1.png"},
	},
	{
		Email:          "seed-yoshiko@gmail.com",
		Nickname:       "佳子",
		Gender:         "female",
		Age:            46,
		PrefectureCode: PrefectureOsaka,
		Bio:            "一緒に色々な場所へ行ける方を探しています。",
		TagLabels:      []string{"旅行", "カフェ巡り"},
		PhotoURLs:      []string{"/profiles/woman-7.png", "/profiles/woman-8.png", "/profiles/woman-4.png"},
	},
	{
		Email:          "seed-saori@gmail.com",
		Nickname:       "沙織",
		Gender:         "female",
		Age:            37,
		PrefectureCode: PrefectureTokyo,
		Bio:            "夜のお出かけが好きです。素敵な出会いを。",
		TagLabels:      []string{"スポーツ観戦", "日本酒"},
		PhotoURLs:      []string{"/profiles/woman-8.png", "/profiles/woman-5.png"},
	},
}

// プロフィール一覧・詳細画面の確認用にダミーユーザー・プロフィール・マイタグを投入する
// テストのDBセットアップでは呼ばない(件数を前提にしたテストが壊れるため)。マイグレーションコマンドから呼ぶこと
func SeedDummyProfiles(db *gorm.DB) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dummyUserPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	for _, dp := range dummyProfiles {
		user := models.User{
			Email:     dp.Email,
			Password:  string(hashedPassword),
			Gender:    dp.Gender,
			Birthdate: time.Now().AddDate(-int(dp.Age), 0, 0),
		}
		if err := db.Where(models.User{Email: dp.Email}).FirstOrCreate(&user).Error; err != nil {
			return err
		}

		profile := models.Profile{
			UserID:         user.ID,
			Nickname:       dp.Nickname,
			PrefectureCode: dp.PrefectureCode,
			Bio:            dp.Bio,
		}
		if err := db.Where(models.Profile{UserID: user.ID}).FirstOrCreate(&profile).Error; err != nil {
			return err
		}

		for _, label := range dp.TagLabels {
			var tag models.Tag
			if err := db.Where(models.Tag{Label: label}).First(&tag).Error; err != nil {
				return err
			}

			profileTag := models.ProfileTag{ProfileID: profile.ID, TagID: tag.ID}
			if err := db.Where(models.ProfileTag{ProfileID: profile.ID, TagID: tag.ID}).
				FirstOrCreate(&profileTag).Error; err != nil {
				return err
			}
		}

		for i, url := range dp.PhotoURLs {
			profileImage := models.ProfileImage{ProfileID: profile.ID, URL: url, SortOrder: int16(i)}
			if err := db.Where(models.ProfileImage{ProfileID: profile.ID, URL: url}).
				FirstOrCreate(&profileImage).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
