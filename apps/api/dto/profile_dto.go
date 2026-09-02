package dto

// 自分/相手どちらのプロフィール表示にも使う共通レスポンス。
// already_likedは相手プロフィール表示時のみ使う
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
	AlreadyLiked   bool                   `json:"already_liked"`
}

// 検索候補1ページ分と、次ページ取得に使うカーソルを返す。
// 最終ページではNextCursorをnilにし、JSONではnullとして返す。
type PartnerSearchResponse struct {
	Profiles   []ProfileDetail `json:"profiles"`
	NextCursor *uint64         `json:"next_cursor"`
}

// 相手検索の条件
type PartnerSearchRequest struct {
	Sort   string `form:"sort"`
	Cursor uint64 `form:"cursor"`
	Limit  int    `form:"limit"`
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

// 初回プロフィール作成に必要な最小項目。
type ProfileCreateRequest struct {
	Nickname       string `json:"nickname"`
	PrefectureCode int16  `json:"prefecture_code"`
	Gender         string `json:"gender"`
	Birthdate      string `json:"birthdate"`
}

type TagSummary struct {
	Label    string `json:"label"`
	Category string `json:"category"`
	ImageURL string `json:"image_url"`
}
