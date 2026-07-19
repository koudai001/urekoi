package dto

type MatchProfile struct {
	MatchID    uint64 `json:"match_id"`
	UserID     uint64 `json:"user_id"`
	Nickname   string `json:"nickname"`
	Age        int16  `json:"age"`
	Prefecture string `json:"prefecture"`
	Image      string `json:"image"`
}
