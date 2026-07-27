package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrProfileImageNotFound = errors.New("profile image not found")

type IProfileImageRepository interface {
	// プロフィール画像を1件作成する
	CreateProfileImage(image *models.ProfileImage) error
	// imageIDのプロフィール画像を1件取得する
	GetProfileImageByID(imageID uint64) (*models.ProfileImage, error)
	// imageIDのプロフィール画像を削除する
	DeleteProfileImage(imageID uint64) error
	// profileIDのプロフィール画像の枚数を取得する(新規作成時のsort_order算出に使う)
	CountProfileImages(profileID uint64) (int64, error)
	// imageIDsで渡された順序をそのままsort_orderとして一括反映する
	ReorderProfileImages(profileID uint64, imageIDs []uint64) error
}

type ProfileImageRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewProfileImageRepository(db *gorm.DB) IProfileImageRepository {
	return &ProfileImageRepository{
		db: db,
	}
}

func (r *ProfileImageRepository) CreateProfileImage(image *models.ProfileImage) error {
	return r.db.Create(image).Error
}

func (r *ProfileImageRepository) GetProfileImageByID(imageID uint64) (*models.ProfileImage, error) {
	var image models.ProfileImage
	if err := r.db.First(&image, imageID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProfileImageNotFound
		}
		return nil, err
	}

	return &image, nil
}

func (r *ProfileImageRepository) DeleteProfileImage(imageID uint64) error {
	return r.db.Delete(&models.ProfileImage{}, imageID).Error
}

func (r *ProfileImageRepository) CountProfileImages(profileID uint64) (int64, error) {
	var count int64
	if err := r.db.Model(&models.ProfileImage{}).Where("profile_id = ?", profileID).Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}

// imageIDsの並び順(配列の位置)をそのままsort_orderとして一括更新する
func (r *ProfileImageRepository) ReorderProfileImages(profileID uint64, imageIDs []uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i, imageID := range imageIDs {
			if err := tx.Model(&models.ProfileImage{}).
				Where("id = ? AND profile_id = ?", imageID, profileID).
				Update("sort_order", i).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
