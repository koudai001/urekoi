package dto

// 自分/相手どちらのプロフィール表示にも使う共通レスポンス。is_new/online/already_likedは
// 相手プロフィール表示時のみ使う
type ProfileDetail struct {
	UserID         uint64                 `json:"user_id"`
	Nickname       string                 `json:"nickname"`
	Age            int16                  `json:"age"`
	PrefectureCode int16                  `json:"prefecture_code"`
	Prefecture     string                 `json:"prefecture"`
	Bio            string                 `json:"bio"`
	Occupation     string                 `json:"occupation"`
	Hometown       string                 `json:"hometown"`
	BloodType      string                 `json:"blood_type"`
	MBTI           string                 `json:"mbti"`
	BodyType       string                 `json:"body_type"`
	Education      string                 `json:"education"`
	Holiday        string                 `json:"holiday"`
	Alcohol        string                 `json:"alcohol"`
	Smoking        string                 `json:"smoking"`
	HeightCm       int16                  `json:"height_cm"`
	TagIDs         []uint64               `json:"tag_ids"`
	Tags           []TagSummary           `json:"tags"`
	Images         []ProfileImageResponse `json:"images"`
	IsNew          bool                   `json:"is_new"`
	Online         string                 `json:"online"`
	AlreadyLiked   bool                   `json:"already_liked"`
}

type ProfileUpdateRequest struct {
	Nickname       string   `json:"nickname"`
	PrefectureCode int16    `json:"prefecture_code"`
	Bio            string   `json:"bio"`
	Occupation     string   `json:"occupation"`
	Hometown       string   `json:"hometown"`
	BloodType      string   `json:"blood_type"`
	MBTI           string   `json:"mbti"`
	BodyType       string   `json:"body_type"`
	Education      string   `json:"education"`
	Holiday        string   `json:"holiday"`
	Alcohol        string   `json:"alcohol"`
	Smoking        string   `json:"smoking"`
	HeightCm       int16    `json:"height_cm"`
	TagIDs         []uint64 `json:"tag_ids"`
}

type TagSummary struct {
	Label    string `json:"label"`
	Category string `json:"category"`
	ImageURL string `json:"image_url"`
}
