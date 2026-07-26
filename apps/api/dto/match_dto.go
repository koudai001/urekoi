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

// has_messages=trueの場合のレスポンス(最新メッセージ情報を含む)
type MatchProfileWithLastMessage struct {
	MatchProfile
	LastMessage             string    `json:"last_message"`
	LastMessageAt           time.Time `json:"last_message_at"`
	LastMessageSenderUserID uint64    `json:"last_message_sender_user_id"`
}

// マッチ1件の詳細(相手のプロフィール詳細を含む。チャット画面で1回のリクエストで揃うようにする)
type MatchProfileDetail struct {
	MatchID   uint64    `json:"match_id"`
	MatchedAt time.Time `json:"matched_at"`
	PartnerResponse
}
