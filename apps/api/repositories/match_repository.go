package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var (
	ErrMatchAlreadyExists = errors.New("already matched")
	ErrMatchNotFound      = errors.New("match not found")
)

// マッチ相手のプロフィールと、そのマッチ自体のIDを合わせて表す
type MatchedProfile struct {
	models.Profile
	MatchID uint64
}

type IMatchRepository interface {
	CreateMatch(match *models.Match) error
	GetMatchedProfiles(userID uint64) ([]MatchedProfile, error)
	GetMatchByID(matchID uint64) (*models.Match, error)
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

// matchIDでマッチを1件取得する
func (r *MatchRepository) GetMatchByID(matchID uint64) (*models.Match, error) {
	var match models.Match
	if err := r.db.First(&match, matchID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMatchNotFound
		}
		return nil, err
	}

	return &match, nil
}

// userIDとマッチしている相手のプロフィール一覧を、マッチ自体のIDと合わせて取得する
func (r *MatchRepository) GetMatchedProfiles(userID uint64) ([]MatchedProfile, error) {
	var profiles []MatchedProfile
	if err := r.db.Model(&models.Profile{}).
		Select("profiles.*, matches.id AS match_id").
		Preload("Prefecture").Preload("User").
		Preload("Images", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order") }).
		Joins(`JOIN matches ON
			(matches.user1_id = profiles.user_id AND matches.user2_id = ?) OR
			(matches.user2_id = profiles.user_id AND matches.user1_id = ?)`, userID, userID).
		Find(&profiles).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}
