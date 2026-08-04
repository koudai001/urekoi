package usecases

import (
	"errors"

	"api/dto"
	"api/models"
	"api/repositories"
)

type IMyProfileUsecase interface {
	// 自分のプロフィールを取得する
	GetMyProfile(userID uint64) (dto.ProfileDetail, error)
	// 自分のプロフィールを更新する(タグも入れ替える)
	UpdateMyProfile(userID uint64, req dto.ProfileUpdateRequest) (dto.ProfileDetail, error)
}

type MyProfileUsecase struct {
	profileRepo repositories.IProfileRepository
}

func NewMyProfileUsecase(profileRepo repositories.IProfileRepository) IMyProfileUsecase {
	return &MyProfileUsecase{
		profileRepo: profileRepo,
	}
}

func (u *MyProfileUsecase) GetMyProfile(userID uint64) (dto.ProfileDetail, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileDetail{}, ErrProfileNotFound
		}
		return dto.ProfileDetail{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(profile.ID)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	tagIDs := make([]uint64, 0, len(profileTags))
	tags := make([]dto.TagSummary, 0, len(profileTags))
	for _, pt := range profileTags {
		tagIDs = append(tagIDs, pt.TagID)
		tags = append(tags, dto.TagSummary{
			Label:    pt.Tag.Label,
			Category: pt.Tag.Category,
			ImageURL: pt.Tag.ImageURL,
		})
	}

	// sort_order順にpreload済みのImagesをそのままレスポンスへ詰め替える
	images := make([]dto.ProfileImageResponse, 0, len(profile.Images))
	for _, image := range profile.Images {
		images = append(images, dto.ProfileImageResponse{
			ID:        image.ID,
			URL:       buildImageURL(image.ImageKey),
			SortOrder: image.SortOrder,
		})
	}

	return dto.ProfileDetail{
		UserID:         profile.UserID,
		Nickname:       profile.Nickname,
		Age:            profile.User.Age(),
		PrefectureCode: profile.PrefectureCode,
		Prefecture:     profile.Prefecture.Name,
		Bio:            profile.Bio,
		Occupation:     profile.Occupation,
		Hometown:       profile.Hometown,
		BloodType:      profile.BloodType,
		MBTI:           profile.MBTI,
		BodyType:       profile.BodyType,
		Education:      profile.Education,
		Holiday:        profile.Holiday,
		Alcohol:        profile.Alcohol,
		Smoking:        profile.Smoking,
		HeightCm:       profile.HeightCm,
		TagIDs:         tagIDs,
		Tags:           tags,
		Images:         images,
	}, nil
}

func (u *MyProfileUsecase) UpdateMyProfile(userID uint64, req dto.ProfileUpdateRequest) (dto.ProfileDetail, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileDetail{}, ErrProfileNotFound
		}
		return dto.ProfileDetail{}, err
	}

	profile.Nickname = req.Nickname
	profile.PrefectureCode = req.PrefectureCode
	// Preload済みの古いPrefectureを持ったままSaveすると、GORMがbelongs to関連からPrefectureCodeを
	// 古い値へ上書きしてしまうため、空にしてから保存する
	profile.Prefecture = models.Prefecture{}
	profile.Bio = req.Bio
	profile.Occupation = req.Occupation
	profile.Hometown = req.Hometown
	profile.BloodType = req.BloodType
	profile.MBTI = req.MBTI
	profile.BodyType = req.BodyType
	profile.Education = req.Education
	profile.Holiday = req.Holiday
	profile.Alcohol = req.Alcohol
	profile.Smoking = req.Smoking
	profile.HeightCm = req.HeightCm

	if err := u.profileRepo.UpdateProfile(profile); err != nil {
		return dto.ProfileDetail{}, err
	}

	if err := u.profileRepo.ReplaceProfileTags(profile.ID, req.TagIDs); err != nil {
		return dto.ProfileDetail{}, err
	}

	// 都道府県名・タグを更新後の状態で反映するため取得し直す
	return u.GetMyProfile(userID)
}
