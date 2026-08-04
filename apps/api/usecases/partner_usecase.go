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
	GetRecs(requestingUserID uint64) ([]dto.ProfileDetail, error)
	// プロフィール1件の詳細をuser_idで取得する(viewerUserIDはいいね済みかの判定に使う)
	GetDetail(viewerUserID uint64, userID uint64) (dto.ProfileDetail, error)
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

func (u *PartnerUsecase) GetRecs(requestingUserID uint64) ([]dto.ProfileDetail, error) {
	profiles, err := u.profileRepo.GetRecsProfiles(requestingUserID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.ProfileDetail, 0, len(profiles))
	for _, p := range profiles {
		profileTags, err := u.profileRepo.GetProfileTags(p.ID)
		if err != nil {
			return nil, err
		}

		// GetRecsProfilesは既にいいね済みの相手を除外して返すため、常にfalse
		res = append(res, toProfileDetail(p, profileTags, false))
	}

	return res, nil
}

func (u *PartnerUsecase) GetDetail(viewerUserID uint64, userID uint64) (dto.ProfileDetail, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileDetail{}, ErrPartnerNotFound
		}
		return dto.ProfileDetail{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(profile.ID)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	alreadyLiked, err := u.likeRepo.HasLiked(viewerUserID, userID)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	return toProfileDetail(*profile, profileTags, alreadyLiked), nil
}

// 登録からnewPartnerThresholdDays以内なら新着(NEW)扱いにする
func isNewPartner(createdAt time.Time) bool {
	return time.Since(createdAt) < newPartnerThresholdDays*24*time.Hour
}

func toProfileDetail(profile models.Profile, profileTags []models.ProfileTag, alreadyLiked bool) dto.ProfileDetail {
	tags := make([]dto.TagSummary, 0, len(profileTags))
	tagIDs := make([]uint64, 0, len(profileTags))
	for _, pt := range profileTags {
		tagIDs = append(tagIDs, pt.TagID)
		tags = append(tags, dto.TagSummary{
			Label:    pt.Tag.Label,
			Category: pt.Tag.Category,
			ImageURL: pt.Tag.ImageURL,
		})
	}

	images := make([]dto.ProfileImageResponse, 0, len(profile.Images))
	for _, image := range profile.Images {
		images = append(images, dto.ProfileImageResponse{
			ID:        image.ID,
			URL:       buildImageURL(image.ImageKey),
			SortOrder: image.SortOrder,
		})
	}

	return dto.ProfileDetail{
		UserID:       profile.UserID,
		Nickname:     profile.Nickname,
		Age:          profile.User.Age(),
		Prefecture:   profile.Prefecture.Name,
		Bio:          profile.Bio,
		IsNew:        isNewPartner(profile.CreatedAt),
		Online:       mockPartnerOnlineStatus,
		Images:       images,
		TagIDs:       tagIDs,
		Tags:         tags,
		AlreadyLiked: alreadyLiked,
	}
}
