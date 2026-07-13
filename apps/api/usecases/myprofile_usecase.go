package usecases

import (
	"errors"

	"api/dto"
	"api/repositories"
)

type IMyProfileUsecase interface {
	// 自分のプロフィールを取得する
	GetMyProfile(userID uint64) (dto.MyProfileResponse, error)
}

type MyProfileUsecase struct {
	profileRepo repositories.IProfileRepository
}

func NewMyProfileUsecase(profileRepo repositories.IProfileRepository) IMyProfileUsecase {
	return &MyProfileUsecase{
		profileRepo: profileRepo,
	}
}

func (u *MyProfileUsecase) GetMyProfile(userID uint64) (dto.MyProfileResponse, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.MyProfileResponse{}, ErrProfileNotFound
		}
		return dto.MyProfileResponse{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(profile.ID)
	if err != nil {
		return dto.MyProfileResponse{}, err
	}

	tagIDs := make([]uint64, 0, len(profileTags))
	for _, pt := range profileTags {
		tagIDs = append(tagIDs, pt.TagID)
	}

	return dto.MyProfileResponse{
		ID:             profile.ID,
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
	}, nil
}
