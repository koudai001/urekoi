package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

func ValidateSignupRequest(req dto.SignupRequest) error {
	if err := validation.Validate(req.Email,
		validation.Required.Error("メールアドレスを入力してください"),
		is.Email.Error("メールアドレスの形式が正しくありません"),
	); err != nil {
		return err
	}

	return validation.Validate(req.Password,
		validation.Required.Error("パスワードを入力してください"),
		validation.Length(8, 0).Error("パスワードは8文字以上で入力してください"),
	)
}

func ValidateLoginRequest(req dto.LoginRequest) error {
	if err := validation.Validate(req.Email,
		validation.Required.Error("メールアドレスを入力してください"),
		is.Email.Error("メールアドレスの形式が正しくありません"),
	); err != nil {
		return err
	}

	return validation.Validate(req.Password,
		validation.Required.Error("パスワードを入力してください"),
	)
}

func ValidateRefreshRequest(req dto.RefreshRequest) error {
	return validation.Validate(req.RefreshToken,
		validation.Required.Error("リフレッシュトークンを入力してください"),
	)
}

func ValidateLogoutRequest(req dto.LogoutRequest) error {
	return validation.Validate(req.RefreshToken,
		validation.Required.Error("リフレッシュトークンを入力してください"),
	)
}
