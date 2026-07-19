package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

func ValidateSkipRequest(req dto.SkipRequest) error {
	return validation.Validate(req.ToUserID,
		validation.Required.Error("to_user_idは必須です"),
	)
}
