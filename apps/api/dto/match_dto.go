package dto

import "time"

type MatchProfile struct {
	MatchID    uint64 `json:"match_id"`
	UserID     uint64 `json:"user_id"`
	Nickname   string `json:"nickname"`
	Age        int16  `json:"age"`
	Prefecture string `json:"prefecture"`
	Image      string `json:"image"`
}

// マッチ1件の詳細(相手のプロフィール詳細を含む。チャット画面で1回のリクエストで揃うようにする)
type MatchProfileDetail struct {
	MatchID   uint64    `json:"match_id"`
	MatchedAt time.Time `json:"matched_at"`
	PartnerResponse
}
