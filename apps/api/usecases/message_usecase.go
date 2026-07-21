package usecases

import (
	"encoding/json"
	"errors"
	"log"

	"api/dto"
	"api/models"
	"api/repositories"
)

var ErrNotMatchParticipant = errors.New("not a participant of this match")

type IMessageUsecase interface {
	// メッセージを送信する
	SendMessage(matchID uint64, senderUserID uint64, body string) (dto.MessageResponse, error)
	// matchIDのメッセージ一覧を取得する
	GetMessages(matchID uint64, userID uint64, beforeID *uint64, limit int) ([]dto.MessageResponse, error)
}

type MessageUsecase struct {
	messageRepo repositories.IMessageRepository
	matchRepo   repositories.IMatchRepository
	wsPublisher repositories.IWsPublisher
}

func NewMessageUsecase(messageRepo repositories.IMessageRepository, matchRepo repositories.IMatchRepository, wsPublisher repositories.IWsPublisher) IMessageUsecase {
	return &MessageUsecase{
		messageRepo: messageRepo,
		matchRepo:   matchRepo,
		wsPublisher: wsPublisher,
	}
}

// matchIDにsenderUserIDからメッセージを送信する
func (u *MessageUsecase) SendMessage(matchID uint64, senderUserID uint64, body string) (dto.MessageResponse, error) {
	match, err := u.matchRepo.GetMatchByID(matchID)
	if err != nil {
		return dto.MessageResponse{}, err
	}

	recipientUserID, err := otherParticipant(match, senderUserID)
	if err != nil {
		return dto.MessageResponse{}, err
	}

	message := models.Message{MatchID: matchID, SenderUserID: senderUserID, Body: body}
	if err := u.messageRepo.CreateMessage(&message); err != nil {
		return dto.MessageResponse{}, err
	}

	res := toMessageResponse(message)
	u.publishNewMessage(recipientUserID, matchID, res)

	return res, nil
}

// matchの当事者からuserIDを除いた、もう一方のuserIDを返す
func otherParticipant(match *models.Match, userID uint64) (uint64, error) {
	switch userID {
	case match.User1ID:
		return match.User2ID, nil
	case match.User2ID:
		return match.User1ID, nil
	default:
		return 0, ErrNotMatchParticipant
	}
}

// WS経由でのリアルタイム配信。新着メッセージのイベントをRedisにpublishする。
// 配信の失敗はメッセージ送信自体の失敗として扱わない(既にDB保存は成功しているため)
func (u *MessageUsecase) publishNewMessage(recipientUserID uint64, matchID uint64, message dto.MessageResponse) {
	// JSONに変換してRedisにpublishする
	payload, err := json.Marshal(dto.NewMessagePayload{
		RecipientUserID: recipientUserID,
		MatchID:         matchID,
		Message:         message,
	})
	if err != nil {
		log.Printf("failed to marshal ws message payload: %v", err)
		return
	}

	if err := u.wsPublisher.Publish(repositories.WsMessagesChannel, payload); err != nil {
		log.Printf("failed to publish ws message: %v", err)
	}
}

// userIDがmatchIDの当事者であることを確認した上で、メッセージ一覧を取得する
func (u *MessageUsecase) GetMessages(matchID uint64, userID uint64, beforeID *uint64, limit int) ([]dto.MessageResponse, error) {
	if err := u.verifyParticipant(matchID, userID); err != nil {
		return nil, err
	}

	messages, err := u.messageRepo.GetMessagesByMatchID(matchID, beforeID, limit)
	if err != nil {
		return nil, err
	}

	res := make([]dto.MessageResponse, 0, len(messages))
	for _, m := range messages {
		res = append(res, toMessageResponse(m))
	}

	return res, nil
}

// userIDがmatchIDの当事者(User1IDかUser2ID)かどうかを確認する
func (u *MessageUsecase) verifyParticipant(matchID uint64, userID uint64) error {
	match, err := u.matchRepo.GetMatchByID(matchID)
	if err != nil {
		return err
	}
	if match.User1ID != userID && match.User2ID != userID {
		return ErrNotMatchParticipant
	}

	return nil
}

// models.Messageをdto.MessageResponseに変換する
func toMessageResponse(m models.Message) dto.MessageResponse {
	return dto.MessageResponse{
		ID:           m.ID,
		SenderUserID: m.SenderUserID,
		Body:         m.Body,
		CreatedAt:    m.CreatedAt,
	}
}
