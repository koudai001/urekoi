package usecases

import (
	"errors"

	"api/dto"
	"api/repositories"
)

var ErrMatchNotFound = errors.New("match not found")

type IMatchUsecase interface {
	// userIDとマッチしている相手のプロフィール一覧を取得する。hasMessageで絞り込み可能
	GetMatches(userID uint64, hasMessage *bool) ([]dto.MatchProfile, error)
	// matchIDのマッチ詳細(相手のプロフィール詳細を含む)を取得する。userIDがそのマッチの当事者でなければ見つからない扱いにする
	GetMatch(userID uint64, matchID uint64) (dto.MatchProfileDetail, error)
}

type MatchUsecase struct {
	matchRepo   repositories.IMatchRepository
	profileRepo repositories.IProfileRepository
}

func NewMatchUsecase(matchRepo repositories.IMatchRepository, profileRepo repositories.IProfileRepository) IMatchUsecase {
	return &MatchUsecase{
		matchRepo:   matchRepo,
		profileRepo: profileRepo,
	}
}

func (u *MatchUsecase) GetMatches(userID uint64, hasMessage *bool) ([]dto.MatchProfile, error) {
	profiles, err := u.matchRepo.GetMatchedProfiles(userID, hasMessage)
	if err != nil {
		return nil, err
	}

	res := make([]dto.MatchProfile, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, dto.MatchProfile{
			MatchID:    p.MatchID,
			UserID:     p.UserID,
			Nickname:   p.Nickname,
			Age:        p.User.Age(),
			Prefecture: p.Prefecture.Name,
			Image:      firstImageURL(p.Images),
		})
	}

	return res, nil
}

func (u *MatchUsecase) GetMatch(userID uint64, matchID uint64) (dto.MatchProfileDetail, error) {
	match, err := u.matchRepo.GetMatchByID(matchID)
	if err != nil {
		if errors.Is(err, repositories.ErrMatchNotFound) {
			return dto.MatchProfileDetail{}, ErrMatchNotFound
		}
		return dto.MatchProfileDetail{}, err
	}

	// 当事者以外には存在を知られたくないので、一律「見つからない」として扱う
	var partnerUserID uint64
	switch userID {
	case match.User1ID:
		partnerUserID = match.User2ID
	case match.User2ID:
		partnerUserID = match.User1ID
	default:
		return dto.MatchProfileDetail{}, ErrMatchNotFound
	}

	profile, err := u.profileRepo.GetProfileByUserID(partnerUserID)
	if err != nil {
		return dto.MatchProfileDetail{}, err
	}

	profileTags, err := u.profileRepo.GetProfileTags(profile.ID)
	if err != nil {
		return dto.MatchProfileDetail{}, err
	}

	return dto.MatchProfileDetail{
		MatchID:         match.ID,
		MatchedAt:       match.MatchedAt,
		PartnerResponse: toPartnerResponse(*profile, profileTags, true),
	}, nil
}
