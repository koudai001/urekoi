package usecases

import (
	"crypto/rand"
	"encoding/hex"

	"api/repositories"
)

type IWsUsecase interface {
	// userID用のWS接続用チケットを発行する
	IssueTicket(userID uint64) (string, error)
	// ticketを検証し、紐づいているuserIDを返す(1回きりの使用)
	VerifyTicket(ticket string) (userID uint64, err error)
}

type WsUsecase struct {
	ticketRepo repositories.ITicketRepository
}

func NewWsUsecase(ticketRepo repositories.ITicketRepository) IWsUsecase {
	return &WsUsecase{
		ticketRepo: ticketRepo,
	}
}

// userID用の使い捨てチケットを生成し、Redisに保存する
func (u *WsUsecase) IssueTicket(userID uint64) (string, error) {
	ticket, err := generateTicket()
	if err != nil {
		return "", err
	}

	if err := u.ticketRepo.CreateTicket(ticket, userID); err != nil {
		return "", err
	}

	return ticket, nil
}

// ticketを検証し、紐づいているuserIDを返す(1回きりの使用)
func (u *WsUsecase) VerifyTicket(ticket string) (uint64, error) {
	return u.ticketRepo.ConsumeTicket(ticket)
}

// 使い捨てのランダムなticket文字列を生成する
func generateTicket() (string, error) {
	// 32バイトのランダムなバイト列を生成し、16進数文字列に変換する
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	return hex.EncodeToString(buf), nil
}
