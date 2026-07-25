package usecases

import (
	"errors"
	"time"

	"api/dto"
	"api/models"
	"api/repositories"
)

var ErrPartnerNotFound = errors.New("profile not found")

// 登録からこの日数以内なら新着(NEW)扱いにする
const newPartnerThresholdDays = 7

// オンライン状態は未実装のため固定で返す値
const mockPartnerOnlineStatus = "online"

type IPartnerUsecase interface {
	// 登録済みユーザーのプロフィール一覧を取得する(requestingUserID自身は除外)
	GetRecs(requestingUserID uint64) ([]dto.PartnerResponse, error)
	// プロフィール1件の詳細をuser_idで取得する(viewerUserIDはいいね済みかの判定に使う)
	GetDetail(viewerUserID uint64, userID uint64) (dto.PartnerResponse, error)
}

type PartnerUsecase struct {
	profileRepo repositories.IProfileRepository
	likeRepo    repositories.ILikeRepository
}

func NewPartnerUsecase(profileRepo repositories.IProfileRepository, likeRepo repositories.ILikeRepository) IPartnerUsecase {
	return &PartnerUsecase{
		profileRepo: profileRepo,
		likeRepo:    likeRepo,
	}
}

func (u *PartnerUsecase) GetRecs(requestingUserID uint64) ([]dto.PartnerResponse, error) {
	profiles, err := u.profileRepo.GetRecsProfiles(requestingUserID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.PartnerResponse, 0, len(profiles))
	for _, p := range profiles {
		profileTags, err := u.profileRepo.GetProfileTags(p.ID)
		if err != nil {
			return nil, err
		}

		// GetRecsProfilesは既にいいね済みの相手を除外して返すため、常にfalse
		res = append(res, toPartnerResponse(p, profileTags, false))
	}

	return res, nil
}

func (u *PartnerUsecase) GetDetail(viewerUserID uint64, userID uint64) (dto.PartnerResponse, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.PartnerResponse{}, ErrPartnerNotFound
		}
		return dto.PartnerResponse{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(profile.ID)
	if err != nil {
		return dto.PartnerResponse{}, err
	}

	alreadyLiked, err := u.likeRepo.HasLiked(viewerUserID, userID)
	if err != nil {
		return dto.PartnerResponse{}, err
	}

	return toPartnerResponse(*profile, profileTags, alreadyLiked), nil
}

// 登録からnewPartnerThresholdDays以内なら新着(NEW)扱いにする
func isNewPartner(createdAt time.Time) bool {
	return time.Since(createdAt) < newPartnerThresholdDays*24*time.Hour
}

func toPartnerResponse(profile models.Profile, profileTags []models.ProfileTag, alreadyLiked bool) dto.PartnerResponse {
	tags := make([]dto.RecsTagSummary, 0, len(profileTags))
	for _, pt := range profileTags {
		tags = append(tags, dto.RecsTagSummary{
			Label:    pt.Tag.Label,
			Category: pt.Tag.Category,
			ImageURL: pt.Tag.ImageURL,
		})
	}

	return dto.PartnerResponse{
		UserID:       profile.UserID,
		Nickname:     profile.Nickname,
		Age:          profile.User.Age(),
		Prefecture:   profile.Prefecture.Name,
		Bio:          profile.Bio,
		IsNew:        isNewPartner(profile.CreatedAt),
		Online:       mockPartnerOnlineStatus,
		Images:       imageURLs(profile.Images),
		Tags:         tags,
		AlreadyLiked: alreadyLiked,
	}
}
