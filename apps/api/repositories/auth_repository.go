package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var ErrEmailAlreadyExists = errors.New("email already exists")

type IAuthRepository interface {
	GetUserByEmail(email string) (*models.User, error)
	CreateUser(user *models.User) error
}

type AuthRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewAuthRepository(db *gorm.DB) IAuthRepository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrEmailAlreadyExists
		}
		return err
	}

	return nil
}
