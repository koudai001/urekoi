package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

func ValidateMessageRequest(req dto.MessageRequest) error {
	return validation.Validate(req.Body,
		validation.Required.Error("メッセージを入力してください"),
		validation.RuneLength(1, 200).Error("メッセージは200文字以内で入力してください"),
	)
}
