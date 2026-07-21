package dto

type WsTicketResponse struct {
	Ticket string `json:"ticket"`
}

// Redis Pub/Subで配信し、そのままWS経由でクライアントへプッシュする新着メッセージのペイロード
type NewMessagePayload struct {
	RecipientUserID uint64          `json:"recipient_user_id"`
	MatchID         uint64          `json:"match_id"`
	Message         MessageResponse `json:"message"`
}
