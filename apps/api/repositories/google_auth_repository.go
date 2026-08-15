package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"os"

	"google.golang.org/api/idtoken"
)

var ErrGoogleAuthFailed = errors.New("failed to authenticate with google")

// GoogleのOAuthユーザー情報(id_tokenの中身から取得)
type GoogleUserInfo struct {
	Sub   string
	Email string
}

type IGoogleAuthRepository interface {
	// id_token(JWT)の署名・aud・iss・expをGoogle公式ライブラリで検証し、ユーザー情報(sub・email)を取り出す
	VerifyIDToken(idToken string) (*GoogleUserInfo, error)
}

// GO_ENVに応じて本物のGoogle検証(local/dev/prod)か、テスト用の偽実装(test)かを切り替える
func NewGoogleAuthRepository() IGoogleAuthRepository {
	if os.Getenv("GO_ENV") == "test" {
		return &FakeGoogleAuthRepository{}
	}

	return &GoogleAuthRepository{
		clientID: os.Getenv("GOOGLE_CLIENT_ID"),
	}
}

type GoogleAuthRepository struct {
	clientID string
}

func (r *GoogleAuthRepository) VerifyIDToken(idTokenString string) (*GoogleUserInfo, error) {
	payload, err := idtoken.Validate(context.Background(), idTokenString, r.clientID)
	if err != nil {
		return nil, ErrGoogleAuthFailed
	}

	email, _ := payload.Claims["email"].(string)
	if payload.Subject == "" || email == "" {
		return nil, ErrGoogleAuthFailed
	}

	return &GoogleUserInfo{Sub: payload.Subject, Email: email}, nil
}

// テスト用の偽実装。実際の署名検証はせず、idTokenをテストが組み立てたJSON({"sub":"...","email":"..."})として扱う
type FakeGoogleAuthRepository struct{}

func (r *FakeGoogleAuthRepository) VerifyIDToken(idTokenString string) (*GoogleUserInfo, error) {
	var info GoogleUserInfo
	if err := json.Unmarshal([]byte(idTokenString), &info); err != nil {
		return nil, ErrGoogleAuthFailed
	}
	if info.Sub == "" || info.Email == "" {
		return nil, ErrGoogleAuthFailed
	}

	return &info, nil
}
