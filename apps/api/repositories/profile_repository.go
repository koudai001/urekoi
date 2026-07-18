package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrProfileNotFound = errors.New("profile not found")

type IProfileRepository interface {
	// excludeUserIDのプロフィールは結果から除外する(自分自身を一覧に出さないため)
	GetAllProfiles(excludeUserID uint64) ([]models.Profile, error)
	GetProfileTags(profileID uint64) ([]models.ProfileTag, error)
	GetProfileByUserID(userID uint64) (*models.Profile, error)
	CreateProfile(profile *models.Profile) error
	UpdateProfile(profile *models.Profile) error
	ReplaceProfileTags(profileID uint64, tagIDs []uint64) error
	// トランザクション用のDBハンドル(tx)にバインドした新しいrepositoryを返す
	WithTx(tx *gorm.DB) IProfileRepository
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

func (r *ProfileRepository) WithTx(tx *gorm.DB) IProfileRepository {
	// rは触らず、新しいインスタンスを作って返す（txを使った新しいrepositoryを返す）
	return &ProfileRepository{db: tx}
}

func (r *ProfileRepository) GetAllProfiles(excludeUserID uint64) ([]models.Profile, error) {
	var profiles []models.Profile
	if err := r.db.Preload("Prefecture").Preload("User").
		Preload("Images", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order") }).
		Where("user_id != ?", excludeUserID).
		Find(&profiles).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}

func (r *ProfileRepository) GetProfileTags(profileID uint64) ([]models.ProfileTag, error) {
	var profileTags []models.ProfileTag
	if err := r.db.Preload("Tag").
		Where("profile_id = ?", profileID).
		Find(&profileTags).Error; err != nil {
		return nil, err
	}

	return profileTags, nil
}

func (r *ProfileRepository) GetProfileByUserID(userID uint64) (*models.Profile, error) {
	var profile models.Profile
	if err := r.db.Preload("Prefecture").Preload("User").
		Preload("Images", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order") }).
		Where("user_id = ?", userID).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProfileNotFound
		}
		return nil, err
	}

	return &profile, nil
}

func (r *ProfileRepository) CreateProfile(profile *models.Profile) error {
	return r.db.Create(profile).Error
}

func (r *ProfileRepository) UpdateProfile(profile *models.Profile) error {
	return r.db.Save(profile).Error
}

// 既存のタグ紐付けを全て削除し、tagIDsで渡されたものに入れ替える
func (r *ProfileRepository) ReplaceProfileTags(profileID uint64, tagIDs []uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("profile_id = ?", profileID).Delete(&models.ProfileTag{}).Error; err != nil {
			return err
		}

		for _, tagID := range tagIDs {
			profileTag := models.ProfileTag{
				ProfileID: profileID,
				TagID:     tagID,
			}
			if err := tx.Create(&profileTag).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
