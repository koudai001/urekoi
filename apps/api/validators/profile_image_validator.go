package validators

import (
	"api/dto"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var allowedImageContentTypes = []interface{}{"image/jpeg", "image/png", "image/webp"}
var allowedImageExtensions = []interface{}{"jpg", "jpeg", "png", "webp"}

func ValidateProfileImagePresignRequest(req dto.ProfileImagePresignRequest) error {
	if err := validation.Validate(req.ContentType,
		validation.Required.Error("content_typeは必須です"),
		validation.In(allowedImageContentTypes...).Error("対応していない画像形式です"),
	); err != nil {
		return err
	}

	return validation.Validate(req.Extension,
		validation.Required.Error("extensionは必須です"),
		validation.In(allowedImageExtensions...).Error("対応していない拡張子です"),
	)
}

func ValidateProfileImageCreateRequest(req dto.ProfileImageCreateRequest) error {
	return validation.Validate(req.ImageKey,
		validation.Required.Error("image_keyは必須です"),
	)
}
