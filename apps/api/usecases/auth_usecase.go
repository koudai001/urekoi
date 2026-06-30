package usecases

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"api/models"
	"api/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// リフレッシュトークンの有効期限
const refreshTokenTTL = 30 * 24 * time.Hour

var (
	ErrEmailAlreadyExists  = errors.New("email already exists")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrInvalidToken        = errors.New("invalid token")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
)

type IAuthUsecase interface {
	// サインアップ成功時もログインと同様にaccessToken(JWT)とrefreshTokenを返す(自動ログイン)
	SignUp(email string, password string) (user *models.User, accessToken string, refreshToken string, err error)
	// ログイン成功時はaccessToken(JWT)とrefreshTokenを返す
	Login(email string, password string) (accessToken string, refreshToken string, err error)
	// refresh_tokenをローテーションし、新しいaccessTokenとrefreshTokenを返す
	Refresh(rawRefreshToken string) (accessToken string, refreshToken string, err error)
	// refresh_tokenを失効させる
	Logout(rawRefreshToken string) error
	// アクセストークン(JWT)からユーザー情報を取得する
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

func (u *AuthUsecase) SignUp(email string, password string) (*models.User, string, string, error) {
	//パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", "", err
	}

	user := models.User{
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := u.authRepo.CreateUser(&user); err != nil {
		if errors.Is(err, repositories.ErrEmailAlreadyExists) {
			return nil, "", "", ErrEmailAlreadyExists
		}
		return nil, "", "", err
	}

	accessToken, refreshToken, err := u.issueTokens(&user)
	if err != nil {
		return nil, "", "", err
	}

	return &user, accessToken, refreshToken, nil
}

func (u *AuthUsecase) Login(email string, password string) (string, string, error) {
	// ユーザーを取得
	user, err := u.authRepo.GetUserByEmail(email)
	if err != nil {
		return "", "", ErrInvalidCredentials
	}

	// パスワードを比較
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", "", ErrInvalidCredentials
	}

	return u.issueTokens(user)
}

// アクセストークン(JWT)とリフレッシュトークンを発行し、リフレッシュトークンのハッシュをDBに保存する
func (u *AuthUsecase) issueTokens(user *models.User) (string, string, error) {
	// アクセストークン(JWT)を生成
	accessToken, err := generateAccessToken(uint(user.ID), user.Email)
	if err != nil {
		return "", "", err
	}

	// リフレッシュトークンを生成
	rawRefreshToken, hashedRefreshToken, err := generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	// リフレッシュトークンをDBに保存
	refreshToken := models.RefreshToken{
		UserID:    user.ID,
		TokenHash: hashedRefreshToken,
		ExpiresAt: time.Now().Add(refreshTokenTTL),
	}
	if err := u.authRepo.CreateRefreshToken(&refreshToken); err != nil {
		return "", "", err
	}

	return accessToken, rawRefreshToken, nil
}

// refresh_tokenをローテーションし、新しいaccessTokenとrefreshTokenを返す
func (u *AuthUsecase) Refresh(rawRefreshToken string) (string, string, error) {
	// 受け取った生トークンをハッシュ化してDBを検索
	storedToken, err := u.authRepo.GetRefreshTokenByHash(hashRefreshToken(rawRefreshToken))
	if err != nil {
		return "", "", ErrInvalidRefreshToken
	}

	// リフレッシュトークンの有効期限をチェック
	if storedToken.ExpiresAt.Before(time.Now()) {
		return "", "", ErrInvalidRefreshToken
	}

	// アクセストークン(JWT)を生成
	accessToken, err := generateAccessToken(uint(storedToken.User.ID), storedToken.User.Email)
	if err != nil {
		return "", "", err
	}

	// 新しいリフレッシュトークンを生成
	newRawRefreshToken, newHashedRefreshToken, err := generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	// 新しいリフレッシュトークンをDBに保存
	newRefreshToken := models.RefreshToken{
		UserID:    storedToken.UserID,
		TokenHash: newHashedRefreshToken,
		ExpiresAt: time.Now().Add(refreshTokenTTL),
	}
	if err := u.authRepo.CreateRefreshToken(&newRefreshToken); err != nil {
		return "", "", err
	}

	// 古いリフレッシュトークンを失効(ローテーション)
	if err := u.authRepo.DeleteRefreshToken(storedToken.ID); err != nil {
		return "", "", err
	}

	return accessToken, newRawRefreshToken, nil
}

func (u *AuthUsecase) Logout(rawRefreshToken string) error {
	storedToken, err := u.authRepo.GetRefreshTokenByHash(hashRefreshToken(rawRefreshToken))
	if err != nil {
		return ErrInvalidRefreshToken
	}

	return u.authRepo.DeleteRefreshToken(storedToken.ID)
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

// アクセストークン(JWT)を生成する
func generateAccessToken(userId uint, email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		// 1,署名のアルゴリズム
		// 2,トークンに含める情報
		"sub":   userId, //subject（ユーザー識別子）
		"email": email,
		"exp":   time.Now().Add(time.Hour).Unix(), //1時間後をUnixタイムスタンプ
	})

	signed, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return "", err
	}

	return signed, nil
}

// リフレッシュトークンを生成し、ハッシュ化して返す
func generateRefreshToken() (rawToken string, hashedToken string, err error) {
	buf := make([]byte, 32)                   // 32個のゼロが並んだスライスを作る
	if _, err := rand.Read(buf); err != nil { // bufにランダムな値を入れる
		return "", "", err
	}

	// クライアントに返す生トークンを生成
	rawToken = hex.EncodeToString(buf) // 16進数文字列
	hashedToken = hashRefreshToken(rawToken)

	return rawToken, hashedToken, nil
}

// 生トークンをDB保存・検索用にsha256ハッシュ化する
func hashRefreshToken(rawToken string) string {
	hash := sha256.Sum256([]byte(rawToken)) // [32]byte（配列）が返る
	return hex.EncodeToString(hash[:])      // 配列をスライスに変換して16進数文字列に変換
}
