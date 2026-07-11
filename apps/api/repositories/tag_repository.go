package repositories

import (
	"api/models"

	"gorm.io/gorm"
)

type ITagRepository interface {
	GetAllTags() ([]models.Tag, error)
}

type TagRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewTagRepository(db *gorm.DB) ITagRepository {
	return &TagRepository{
		db: db,
	}
}

func (r *TagRepository) GetAllTags() ([]models.Tag, error) {
	var tags []models.Tag
	if err := r.db.Find(&tags).Error; err != nil {
		return nil, err
	}

	return tags, nil
}
