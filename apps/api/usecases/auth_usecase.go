package usecases

import (
	"errors"
	"os"
	"time"

	"api/models"
	"api/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid token")
)

type IAuthUsecase interface {
	SignUp(email string, password string) (*models.User, error)
	Login(email string, password string) (*string, error) //jwtを返す
	GetUserFromToken(tokenString string) (*models.User, error)
}

type AuthUsecase struct {
	authRepo repositories.IAuthRepository
}

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
		if errors.Is(err, repositories.ErrEmailAlreadyExists) {
			return nil, ErrEmailAlreadyExists
		}
		return nil, err
	}

	return &user, nil
}

func (u *AuthUsecase) Login(email string, password string) (*string, error) {
	// ユーザーを取得
	user, err := u.authRepo.GetUserByEmail(email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// パスワードを比較
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// JWTを生成して返す
	return createToken(uint(user.ID), user.Email)
}

func (u *AuthUsecase) GetUserFromToken(tokenString string) (*models.User, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		// 署名を検証
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(os.Getenv("SECRET")), nil
	})
	// jwtの型
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	email, ok := claims["email"].(string)
	if !ok {
		return nil, ErrInvalidToken
	}

	return u.authRepo.GetUserByEmail(email)
}

func createToken(userId uint, email string) (*string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		// 1,署名のアルゴリズム
		// 2,トークンに含める情報
		"sub":   userId, //subject（ユーザー識別子）
		"email": email,
		"exp":   time.Now().Add(time.Hour).Unix(), //1時間後をUnixタイムスタンプ
	})

	signed, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return nil, err
	}

	return &signed, nil
}
