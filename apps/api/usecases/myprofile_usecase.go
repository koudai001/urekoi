package usecases

import (
	"errors"
	"time"

	"api/dto"
	"api/models"
	"api/repositories"
)

type IMyProfileUsecase interface {
	// 自分のプロフィールを取得する
	GetMyProfile(userID uint64) (dto.ProfileDetail, error)
	// 初回プロフィールを作成する
	CreateMyProfile(userID uint64, req dto.ProfileCreateRequest) (dto.ProfileDetail, error)
	// 自分のプロフィールを更新する(タグも入れ替える)
	UpdateMyProfile(userID uint64, req dto.ProfileUpdateRequest) (dto.ProfileDetail, error)
}

func (u *MyProfileUsecase) CreateMyProfile(userID uint64, req dto.ProfileCreateRequest) (dto.ProfileDetail, error) {
	if _, err := u.profileRepo.GetProfileByUserID(userID); err == nil {
		return dto.ProfileDetail{}, ErrProfileAlreadyExists
	} else if !errors.Is(err, repositories.ErrProfileNotFound) {
		return dto.ProfileDetail{}, err
	}

	birthdate, err := time.Parse("2006-01-02", req.Birthdate)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	profile := models.Profile{
		UserID:         userID,
		Nickname:       req.Nickname,
		Gender:         req.Gender,
		Birthdate:      birthdate,
		PrefectureCode: req.PrefectureCode,
	}

	if err := u.profileRepo.CreateProfile(&profile); err != nil {
		return dto.ProfileDetail{}, err
	}

	return u.GetMyProfile(userID)
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

	return buildProfileDetail(*profile, false), nil
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
