package usecases

import (
	"errors"

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
}

func NewMessageUsecase(messageRepo repositories.IMessageRepository, matchRepo repositories.IMatchRepository) IMessageUsecase {
	return &MessageUsecase{
		messageRepo: messageRepo,
		matchRepo:   matchRepo,
	}
}

// matchIDにsenderUserIDからメッセージを送信する
func (u *MessageUsecase) SendMessage(matchID uint64, senderUserID uint64, body string) (dto.MessageResponse, error) {
	if err := u.verifyParticipant(matchID, senderUserID); err != nil {
		return dto.MessageResponse{}, err
	}

	message := models.Message{MatchID: matchID, SenderUserID: senderUserID, Body: body}
	if err := u.messageRepo.CreateMessage(&message); err != nil {
		return dto.MessageResponse{}, err
	}

	return toMessageResponse(message), nil
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
