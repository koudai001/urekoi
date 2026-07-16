package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

func ValidateLikeRequest(req dto.LikeRequest) error {
	return validation.Validate(req.ToUserID,
		validation.Required.Error("to_user_idは必須です"),
	)
}
