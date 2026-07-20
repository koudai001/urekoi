package repositories

import (
	"api/models"

	"gorm.io/gorm"
)

type IMessageRepository interface {
	CreateMessage(message *models.Message) error
	GetMessagesByMatchID(matchID uint64, beforeID *uint64, limit int) ([]models.Message, error)
}

type MessageRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewMessageRepository(db *gorm.DB) IMessageRepository {
	return &MessageRepository{
		db: db,
	}
}

// メッセージを作成する
func (r *MessageRepository) CreateMessage(message *models.Message) error {
	return r.db.Create(message).Error
}

// matchIDのメッセージ一覧を新しい順に取得する。beforeIDを指定するとそれより古いメッセージから取得する
func (r *MessageRepository) GetMessagesByMatchID(matchID uint64, beforeID *uint64, limit int) ([]models.Message, error) {
	query := r.db.Where("match_id = ?", matchID)
	if beforeID != nil {
		query = query.Where("id < ?", *beforeID)
	}

	var messages []models.Message
	if err := query.Order("id DESC").Limit(limit).Find(&messages).Error; err != nil {
		return nil, err
	}

	return messages, nil
}
