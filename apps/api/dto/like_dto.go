package dto

type LikeRequest struct {
	ToUserID uint64 `json:"to_user_id"`
}

type LikeProfile struct {
	UserID     uint64   `json:"user_id"`
	Nickname   string   `json:"nickname"`
	Age        int16    `json:"age"`
	Prefecture string   `json:"prefecture"`
	Online     string   `json:"online"`
	Photos     []string `json:"photos"`
}
