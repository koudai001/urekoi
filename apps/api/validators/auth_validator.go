package validators

import (
	"errors"
	"time"

	"api/dto"
	"api/models"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

const birthdateLayout = "2006-01-02"

// 熟恋のコンセプト上の年齢制限(女性は30歳以上・男性は35歳以下)。BEが最終的な権威を持つ
const (
	minAge       = 18
	maxAge       = 100 // 現実的にあり得ない生年月日を弾くための上限
	minAgeFemale = 30
	maxAgeMale   = 35
)

func ValidateSignupRequest(req dto.SignupRequest) error {
	if err := validation.Validate(req.Email,
		validation.Required.Error("メールアドレスを入力してください"),
		is.Email.Error("メールアドレスの形式が正しくありません"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.Password,
		validation.Required.Error("パスワードを入力してください"),
		validation.RuneLength(8, 0).Error("パスワードは8文字以上で入力してください"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.Gender,
		validation.Required.Error("性別を選択してください"),
		validation.In("male", "female").Error("性別の値が不正です"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.Nickname,
		validation.Required.Error("ニックネームを入力してください"),
		validation.RuneLength(1, 20).Error("ニックネームは20文字以内で入力してください"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.PrefectureCode,
		validation.Required.Error("都道府県を選択してください"),
	); err != nil {
		return err
	}

	return validateBirthdate(req.Birthdate, req.Gender)
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

// 生年月日の形式・実在性・年齢(18〜100歳、女性30歳以上/男性35歳以下)を検証する
func validateBirthdate(birthdate string, gender string) error {
	if birthdate == "" {
		return errors.New("生年月日を入力してください")
	}

	// 文字列をtime.Timeに変換して、フォーマットが正しいかどうかを検証する
	parsed, err := time.Parse(birthdateLayout, birthdate)
	if err != nil || parsed.Format(birthdateLayout) != birthdate {
		return errors.New("実在する日付を入力してください")
	}
	// models.User構造体を使って年齢を計算する
	age := models.User{Birthdate: parsed}.Age()
	if age < minAge {
		return errors.New("18歳未満の方はご登録いただけません")
	}
	if age > maxAge {
		return errors.New("生年月日をご確認ください")
	}

	switch gender {
	case "female":
		if age < minAgeFemale {
			return errors.New("女性は30歳以上でご登録いただけます")
		}
	case "male":
		if age > maxAgeMale {
			return errors.New("男性は35歳以下でご登録いただけます")
		}
	}

	return nil
}
