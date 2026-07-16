package repositories

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
)

type IAuthRepository interface {
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id uint64) (*models.User, error)
	CreateUser(user *models.User) error
	CreateRefreshToken(refreshToken *models.RefreshToken) error
	GetRefreshTokenByHash(tokenHash string) (*models.RefreshToken, error)
	DeleteRefreshToken(id uint64) error
	// トランザクション用のDBハンドル(tx)にバインドした新しいrepositoryを返す
	WithTx(tx *gorm.DB) IAuthRepository
	// fn内の処理をひとつのトランザクションとして実行する
	Transaction(fn func(tx *gorm.DB) error) error
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

func (r *AuthRepository) WithTx(tx *gorm.DB) IAuthRepository {
	return &AuthRepository{db: tx}
}

func (r *AuthRepository) Transaction(fn func(tx *gorm.DB) error) error {
	return r.db.Transaction(fn)
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *AuthRepository) GetUserByID(id uint64) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
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

func (r *AuthRepository) CreateRefreshToken(refreshToken *models.RefreshToken) error {
	return r.db.Create(refreshToken).Error
}

func (r *AuthRepository) GetRefreshTokenByHash(tokenHash string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken
	if err := r.db.Preload("User").Where("token_hash = ?", tokenHash).First(&refreshToken).Error; err != nil {
		return nil, err
	}

	return &refreshToken, nil
}

func (r *AuthRepository) DeleteRefreshToken(id uint64) error {
	return r.db.Delete(&models.RefreshToken{}, id).Error
}
