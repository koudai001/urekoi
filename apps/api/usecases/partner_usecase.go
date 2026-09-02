package usecases

import (
	"errors"

	"api/dto"
	"api/models"
	"api/repositories"
)

var ErrPartnerNotFound = errors.New("profile not found")

type IPartnerUsecase interface {
	// 登録済みユーザーのプロフィールを、requestingUserID自身と対応済みの相手を除いて取得する
	Search(requestingUserID uint64, input dto.PartnerSearchRequest) (dto.PartnerSearchResponse, error)
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

func (u *PartnerUsecase) Search(requestingUserID uint64, input dto.PartnerSearchRequest) (dto.PartnerSearchResponse, error) {
	// 次ページの存在を追加のCOUNTクエリなしで判定するため、指定件数より1件多く取得する。
	profiles, err := u.profileRepo.SearchProfiles(requestingUserID, input.Sort, input.Cursor, input.Limit+1)
	if err != nil {
		return dto.PartnerSearchResponse{}, err
	}

	hasNext := len(profiles) > input.Limit
	if hasNext {
		// 余分に取得した1件を削除
		profiles = profiles[:input.Limit]
	}

	res := make([]dto.ProfileDetail, 0, len(profiles))
	for _, p := range profiles {
		// SearchProfilesは既にいいね済みの相手を除外して返すため、常にfalse
		res = append(res, buildProfileDetail(p, false))
	}

	var nextCursor *uint64
	if hasNext && len(profiles) > 0 {
		cursorValue := profiles[len(profiles)-1].UserID
		nextCursor = &cursorValue
	}

	return dto.PartnerSearchResponse{
		Profiles:   res,
		NextCursor: nextCursor,
	}, nil
}

func (u *PartnerUsecase) GetDetail(viewerUserID uint64, userID uint64) (dto.ProfileDetail, error) {
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileDetail{}, ErrPartnerNotFound
		}
		return dto.ProfileDetail{}, err
	}

	alreadyLiked, err := u.likeRepo.HasLiked(viewerUserID, userID)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	return buildProfileDetail(*profile, alreadyLiked), nil
}

// DBモデルからAPIレスポンス用のプロフィール詳細を組み立てる
func buildProfileDetail(profile models.Profile, alreadyLiked bool) dto.ProfileDetail {
	tags := make([]dto.TagSummary, 0, len(profile.ProfileTags))
	tagIDs := make([]uint64, 0, len(profile.ProfileTags))
	for _, pt := range profile.ProfileTags {
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
		UserID:         profile.UserID,
		Nickname:       profile.Nickname,
		Age:            profile.Age(),
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
		AlreadyLiked:   alreadyLiked,
	}
}
