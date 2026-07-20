package dto

import "time"

type MessageRequest struct {
	Body string `json:"body"`
}

type MessageResponse struct {
	ID           uint64    `json:"id"`
	SenderUserID uint64    `json:"sender_user_id"`
	Body         string    `json:"body"`
	CreatedAt    time.Time `json:"created_at"`
}
