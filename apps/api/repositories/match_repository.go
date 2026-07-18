package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrMatchAlreadyExists = errors.New("already matched")

type IMatchRepository interface {
	CreateMatch(match *models.Match) error
	GetMatchedProfiles(userID uint64) ([]models.Profile, error)
}

type MatchRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewMatchRepository(db *gorm.DB) IMatchRepository {
	return &MatchRepository{
		db: db,
	}
}

// マッチを作成する
func (r *MatchRepository) CreateMatch(match *models.Match) error {
	if err := r.db.Create(match).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrMatchAlreadyExists
		}
		return err
	}

	return nil
}

// userIDとマッチしている相手のプロフィール一覧を取得する
func (r *MatchRepository) GetMatchedProfiles(userID uint64) ([]models.Profile, error) {
	var profiles []models.Profile
	if err := r.db.Preload("Prefecture").Preload("User").
		Preload("Images", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order") }).
		Joins(`JOIN matches ON
			(matches.user1_id = profiles.user_id AND matches.user2_id = ?) OR
			(matches.user2_id = profiles.user_id AND matches.user1_id = ?)`, userID, userID).
		Find(&profiles).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}
