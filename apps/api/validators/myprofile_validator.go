package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

const maxFieldLength = 20
const maxBioLength = 200

func ValidateMyProfileUpdateRequest(req dto.MyProfileUpdateRequest) error {
	if err := validation.Validate(req.Nickname,
		validation.Required.Error("ニックネームを入力してください"),
		validation.RuneLength(1, maxFieldLength).Error("ニックネームは20文字以内で入力してください"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.PrefectureCode,
		validation.Required.Error("都道府県を選択してください"),
	); err != nil {
		return err
	}

	if err := validation.Validate(req.Bio,
		validation.RuneLength(0, maxBioLength).Error("自己紹介は200文字以内で入力してください"),
	); err != nil {
		return err
	}

	fields := map[string]string{
		"職業":   req.Occupation,
		"出身地":  req.Hometown,
		"血液型":  req.BloodType,
		"MBTI": req.MBTI,
		"体型":   req.BodyType,
		"学歴":   req.Education,
		"休日":   req.Holiday,
		"お酒":   req.Alcohol,
		"タバコ":  req.Smoking,
	}
	for label, value := range fields {
		if err := validation.Validate(value,
			validation.RuneLength(0, maxFieldLength).Error(label+"は20文字以内で入力してください"),
		); err != nil {
			return err
		}
	}

	return nil
}
