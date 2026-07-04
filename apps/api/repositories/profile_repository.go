package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrProfileNotFound = errors.New("profile not found")

type IProfileRepository interface {
	GetAllProfiles() ([]models.Profile, error)
	GetProfileByID(id uint64) (*models.Profile, error)
	GetProfileTags(profileID uint64) ([]models.ProfileTag, error)
}

type ProfileRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewProfileRepository(db *gorm.DB) IProfileRepository {
	return &ProfileRepository{
		db: db,
	}
}

func (r *ProfileRepository) GetAllProfiles() ([]models.Profile, error) {
	var profiles []models.Profile
	if err := r.db.Preload("Prefecture").Find(&profiles).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}

func (r *ProfileRepository) GetProfileByID(id uint64) (*models.Profile, error) {
	var profile models.Profile
	if err := r.db.Preload("Prefecture").First(&profile, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProfileNotFound
		}
		return nil, err
	}

	return &profile, nil
}

func (r *ProfileRepository) GetProfileTags(profileID uint64) ([]models.ProfileTag, error) {
	var profileTags []models.ProfileTag
	if err := r.db.Preload("Tag").
		Where("profile_id = ?", profileID).
		Order("sort_order").
		Find(&profileTags).Error; err != nil {
		return nil, err
	}

	return profileTags, nil
}
