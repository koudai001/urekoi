package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrLikeAlreadyExists = errors.New("already liked")

type ILikeRepository interface {
	CreateLike(like *models.Like) error
	GetLikedProfiles(userID uint64) ([]models.Profile, error)
}

type LikeRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewLikeRepository(db *gorm.DB) ILikeRepository {
	return &LikeRepository{
		db: db,
	}
}

// いいねを作成する
func (r *LikeRepository) CreateLike(like *models.Like) error {
	if err := r.db.Create(like).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrLikeAlreadyExists
		}
		return err
	}

	return nil
}

// userIDがもらったいいねの送信元プロフィール一覧を取得する
func (r *LikeRepository) GetLikedProfiles(userID uint64) ([]models.Profile, error) {
	var profiles []models.Profile
	if err := r.db.Preload("Prefecture").Preload("User").
		Joins("JOIN likes ON likes.from_user_id = profiles.user_id").
		Where("likes.to_user_id = ?", userID).
		Find(&profiles).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}
