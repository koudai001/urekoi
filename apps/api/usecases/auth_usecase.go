package usecases

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"api/dto"
	"api/models"
	"api/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// リフレッシュトークンの有効期限
const refreshTokenTTL = 30 * 24 * time.Hour

// auth_identitiesのprovider列に入れる値
const googleProvider = "google"

var (
	ErrEmailAlreadyExists  = errors.New("email already exists")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrInvalidToken        = errors.New("invalid token")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
	ErrGoogleAuthFailed    = errors.New("google authentication failed")
)

type IAuthUsecase interface {
	// サインアップ成功時もログインと同様にaccessToken(JWT)とrefreshTokenを返す(自動ログイン)。
	// signup時にUser・PasswordCredentialをまとめて作成する
	SignUp(req dto.SignupRequest) (user *models.User, accessToken string, refreshToken string, err error)
	// ログイン成功時はaccessToken(JWT)とrefreshTokenとプロフィール作成済みかどうかを返す
	Login(email string, password string) (accessToken string, refreshToken string, hasProfile bool, err error)
	// id_tokenを検証し、auth_identityが無ければユーザーを新規作成(同一emailの既存ユーザーがいればそれに紐付け)してログインする
	GoogleLogin(idToken string) (user *models.User, accessToken string, refreshToken string, hasProfile bool, err error)
	// refresh_tokenをローテーションし、新しいaccessToken・refreshToken・プロフィール作成済みかどうかを返す
	Refresh(rawRefreshToken string) (accessToken string, refreshToken string, hasProfile bool, err error)
	// refresh_tokenを失効させる
	Logout(rawRefreshToken string) error
	// アクセストークン(JWT)からユーザー情報を取得する
	GetUserFromToken(tokenString string) (*models.User, error)
}

type AuthUsecase struct {
	authRepo       repositories.IAuthRepository
	googleAuthRepo repositories.IGoogleAuthRepository
	profileRepo    repositories.IProfileRepository
}

func NewAuthUsecase(authRepo repositories.IAuthRepository, googleAuthRepo repositories.IGoogleAuthRepository, profileRepo repositories.IProfileRepository) IAuthUsecase {
	return &AuthUsecase{
		authRepo:       authRepo,
		googleAuthRepo: googleAuthRepo,
		profileRepo:    profileRepo,
	}
}

func (u *AuthUsecase) SignUp(req dto.SignupRequest) (*models.User, string, string, error) {
	//パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", "", err
	}

	user := models.User{
		Email: req.Email,
	}

	// 認証情報をひとつのトランザクションで作成する。プロフィール作成は別のリクエストで行う。
	err = u.authRepo.Transaction(func(tx *gorm.DB) error {
		// Userの作成
		if err := u.authRepo.WithTx(tx).CreateUser(&user); err != nil {
			return err
		}
		// PasswordCredentialの作成
		credential := models.PasswordCredential{
			UserID:       user.ID,
			PasswordHash: string(hashedPassword),
		}
		if err := u.authRepo.WithTx(tx).CreatePasswordCredential(&credential); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		if errors.Is(err, repositories.ErrEmailAlreadyExists) {
			return nil, "", "", ErrEmailAlreadyExists
		}
		return nil, "", "", err
	}
	// サインアップ成功時もログインと同様にaccessToken(JWT)とrefreshTokenを返す(自動ログイン)
	accessToken, refreshToken, err := u.issueTokens(&user)
	if err != nil {
		return nil, "", "", err
	}

	return &user, accessToken, refreshToken, nil
}

func (u *AuthUsecase) Login(email string, password string) (string, string, bool, error) {
	// ユーザーを取得
	user, err := u.authRepo.GetUserByEmail(email)
	if err != nil {
		return "", "", false, ErrInvalidCredentials
	}

	// ユーザーIDからパスワード認証情報を取得
	credential, err := u.authRepo.GetPasswordCredentialByUserID(user.ID)
	if err != nil {
		return "", "", false, ErrInvalidCredentials
	}

	// パスワードを比較
	if err := bcrypt.CompareHashAndPassword([]byte(credential.PasswordHash), []byte(password)); err != nil {
		return "", "", false, ErrInvalidCredentials
	}

	accessToken, refreshToken, err := u.issueTokens(user)
	if err != nil {
		return "", "", false, err
	}

	hasProfile, err := u.hasProfile(user.ID)
	if err != nil {
		return "", "", false, err
	}

	return accessToken, refreshToken, hasProfile, nil
}

func (u *AuthUsecase) GoogleLogin(idToken string) (*models.User, string, string, bool, error) {
	info, err := u.googleAuthRepo.VerifyIDToken(idToken)
	if err != nil {
		return nil, "", "", false, ErrGoogleAuthFailed
	}

	// auth_identityから既存ユーザーを解決する。無ければ同一emailの既存ユーザーに紐付け、それも無ければ新規作成する
	user, err := u.resolveGoogleUser(info)
	if err != nil {
		return nil, "", "", false, err
	}

	accessToken, refreshToken, err := u.issueTokens(user)
	if err != nil {
		return nil, "", "", false, err
	}

	hasProfile, err := u.hasProfile(user.ID)
	if err != nil {
		return nil, "", "", false, err
	}

	return user, accessToken, refreshToken, hasProfile, nil
}

// auth_identityから既存ユーザーを解決する。無ければ同一emailの既存ユーザーに紐付け、それも無ければ新規作成する
func (u *AuthUsecase) resolveGoogleUser(info *repositories.GoogleUserInfo) (*models.User, error) {
	identity, err := u.authRepo.GetAuthIdentity(googleProvider, info.Sub)
	// 既存のauth_identityがあればそれに紐付くユーザーを返す
	if err == nil {
		return u.authRepo.GetUserByID(identity.UserID)
	}
	// NotFound以外のエラーはそのまま返す
	if !errors.Is(err, repositories.ErrAuthIdentityNotFound) {
		return nil, err
	}

	user, err := u.authRepo.GetUserByEmail(info.Email)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		// 同一emailの既存ユーザーがいなければ新規作成する
		newUser := models.User{Email: info.Email}
		if err := u.authRepo.CreateUser(&newUser); err != nil {
			return nil, err
		}
		user = &newUser
	}

	if err := u.authRepo.CreateAuthIdentity(&models.AuthIdentity{
		UserID:         user.ID,
		Provider:       googleProvider,
		ProviderUserID: info.Sub,
	}); err != nil {
		return nil, err
	}

	return user, nil
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

// refresh_tokenをローテーションし、新しいaccessToken・refreshToken・プロフィール作成済みかどうかを返す
func (u *AuthUsecase) Refresh(rawRefreshToken string) (string, string, bool, error) {
	// 受け取った生トークンをハッシュ化してDBを検索
	storedToken, err := u.authRepo.GetRefreshTokenByHash(hashRefreshToken(rawRefreshToken))
	if err != nil {
		return "", "", false, ErrInvalidRefreshToken
	}

	// リフレッシュトークンの有効期限をチェック
	if storedToken.ExpiresAt.Before(time.Now()) {
		return "", "", false, ErrInvalidRefreshToken
	}

	// アクセストークン(JWT)を生成
	accessToken, err := generateAccessToken(uint(storedToken.User.ID), storedToken.User.Email)
	if err != nil {
		return "", "", false, err
	}

	// 新しいリフレッシュトークンを生成
	newRawRefreshToken, newHashedRefreshToken, err := generateRefreshToken()
	if err != nil {
		return "", "", false, err
	}

	// 新しいリフレッシュトークンをDBに保存
	newRefreshToken := models.RefreshToken{
		UserID:    storedToken.UserID,
		TokenHash: newHashedRefreshToken,
		ExpiresAt: time.Now().Add(refreshTokenTTL),
	}
	if err := u.authRepo.CreateRefreshToken(&newRefreshToken); err != nil {
		return "", "", false, err
	}

	// 古いリフレッシュトークンを失効(ローテーション)
	if err := u.authRepo.DeleteRefreshToken(storedToken.ID); err != nil {
		return "", "", false, err
	}

	// リフレッシュの度に最新のプロフィール作成状況を返す(Cookieの追従用)
	hasProfile, err := u.hasProfile(storedToken.UserID)
	if err != nil {
		return "", "", false, err
	}

	return accessToken, newRawRefreshToken, hasProfile, nil
}

// user_idのプロフィールが作成済みかどうかを返す
func (u *AuthUsecase) hasProfile(userID uint64) (bool, error) {
	_, err := u.profileRepo.GetProfileByUserID(userID)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, repositories.ErrProfileNotFound) {
		return false, nil
	}
	return false, err
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
