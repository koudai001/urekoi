package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrSkipAlreadyExists = errors.New("already skipped")

type ISkipRepository interface {
	CreateSkip(skip *models.Skip) error
}

type SkipRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewSkipRepository(db *gorm.DB) ISkipRepository {
	return &SkipRepository{
		db: db,
	}
}

// スキップを作成する
func (r *SkipRepository) CreateSkip(skip *models.Skip) error {
	if err := r.db.Create(skip).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrSkipAlreadyExists
		}
		return err
	}

	return nil
}
