package usecases

import (
	"errors"
	"time"

	"api/dto"
	"api/repositories"
)

var (
	ErrNoProfilesFound = errors.New("no profiles found")
	ErrProfileNotFound = errors.New("profile not found")
)

// 登録からこの日数以内なら新着(NEW)扱いにする
const newProfileThresholdDays = 7

// プロフィール画像アップロード機能が未実装のため、暫定的に空を返す(表示側でダミー画像に差し替える)
const dummyImagePath = ""

// オンライン状態は未実装のため固定で返す値
const mockOnlineStatus = "online"

type ISearchUsecase interface {
	// 登録済みユーザーのプロフィール一覧を取得する
	ListProfiles() ([]dto.ProfileSummary, error)
	// プロフィール1件の詳細を取得する
	GetProfileDetail(id uint64) (dto.ProfileDetail, error)
}

type SearchUsecase struct {
	profileRepo repositories.IProfileRepository
}

func NewSearchUsecase(profileRepo repositories.IProfileRepository) ISearchUsecase {
	return &SearchUsecase{
		profileRepo: profileRepo,
	}
}

func (u *SearchUsecase) ListProfiles() ([]dto.ProfileSummary, error) {
	profiles, err := u.profileRepo.GetAllProfiles()
	if err != nil {
		return nil, err
	}

	if len(profiles) == 0 {
		return nil, ErrNoProfilesFound
	}

	res := make([]dto.ProfileSummary, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, dto.ProfileSummary{
			ID:         p.ID,
			Nickname:   p.Nickname,
			Age:        p.Age,
			Prefecture: p.Prefecture.Name,
			Image:      dummyImagePath,
			IsNew:      isNewProfile(p.CreatedAt),
			Online:     mockOnlineStatus,
		})
	}

	return res, nil
}

func (u *SearchUsecase) GetProfileDetail(id uint64) (dto.ProfileDetail, error) {
	profile, err := u.profileRepo.GetProfileByID(id)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileDetail{}, ErrProfileNotFound
		}
		return dto.ProfileDetail{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(id)
	if err != nil {
		return dto.ProfileDetail{}, err
	}

	tags := make([]dto.TagSummary, 0, len(profileTags))
	for _, pt := range profileTags {
		tags = append(tags, dto.TagSummary{
			Label:    pt.Tag.Label,
			Category: pt.Tag.Category,
			ImageURL: pt.Tag.ImageURL,
		})
	}

	return dto.ProfileDetail{
		ID:         profile.ID,
		Nickname:   profile.Nickname,
		Age:        profile.Age,
		Prefecture: profile.Prefecture.Name,
		Bio:        profile.Bio,
		IsNew:      isNewProfile(profile.CreatedAt),
		Online:     mockOnlineStatus,
		Images:     []string{dummyImagePath},
		Tags:       tags,
	}, nil
}

// 登録からnewProfileThresholdDays以内なら新着(NEW)扱いにする
func isNewProfile(createdAt time.Time) bool {
	return time.Since(createdAt) < newProfileThresholdDays*24*time.Hour
}
