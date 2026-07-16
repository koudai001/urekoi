package dto

type ProfileSummary struct {
	UserID     uint64 `json:"user_id"`
	Nickname   string `json:"nickname"`
	Age        int16  `json:"age"`
	Prefecture string `json:"prefecture"`
	Image      string `json:"image"`
	IsNew      bool   `json:"is_new"`
	Online     string `json:"online"`
}

type ProfileDetail struct {
	UserID     uint64       `json:"user_id"`
	Nickname   string       `json:"nickname"`
	Age        int16        `json:"age"`
	Prefecture string       `json:"prefecture"`
	Bio        string       `json:"bio"`
	IsNew      bool         `json:"is_new"`
	Online     string       `json:"online"`
	Images     []string     `json:"images"`
	Tags       []TagSummary `json:"tags"`
}

type TagSummary struct {
	Label    string `json:"label"`
	Category string `json:"category"`
	ImageURL string `json:"image_url"`
}
