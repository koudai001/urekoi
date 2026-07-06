package dto

type MyProfileResponse struct {
	ID             uint64   `json:"id"`
	Nickname       string   `json:"nickname"`
	Age            int16    `json:"age"`
	PrefectureCode int16    `json:"prefecture_code"`
	Prefecture     string   `json:"prefecture"`
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
