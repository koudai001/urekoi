package dto

type MatchProfile struct {
	UserID     uint64 `json:"user_id"`
	Nickname   string `json:"nickname"`
	Age        int16  `json:"age"`
	Prefecture string `json:"prefecture"`
	Image      string `json:"image"`
}
