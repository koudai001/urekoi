package usecases

import (
	"api/models"
	"api/repositories"

	"golang.org/x/crypto/bcrypt"
)

type IAuthUsecase interface {
	SignUp(email string, password string) (*models.User, error)
	// Login(email string, password string) (*string, error) //jwtを返す
	//jwt認証
	// GetUserFromToken(tokenString string) (*models.User, error) // nilを返したいから
}

type AuthUsecase struct {
	authRepo repositories.IAuthRepository
}

// コンストラクタ
func NewAuthUsecase(authRepo repositories.IAuthRepository) IAuthUsecase {
	return &AuthUsecase{
		authRepo: authRepo,
	}
}

func (u *AuthUsecase) SignUp(email string, password string) (*models.User, error) {
	//パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := u.authRepo.CreateUser(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// func (u *AuthUsecase) Login(email string, password string) (*string, error) {

// }
