package usecases

import (
	"api/dto"
	"api/repositories"
)

type IMatchUsecase interface {
	// userIDとマッチしている相手のプロフィール一覧を取得する
	GetMatches(userID uint64) ([]dto.MatchProfile, error)
}

type MatchUsecase struct {
	matchRepo repositories.IMatchRepository
}

func NewMatchUsecase(matchRepo repositories.IMatchRepository) IMatchUsecase {
	return &MatchUsecase{
		matchRepo: matchRepo,
	}
}

func (u *MatchUsecase) GetMatches(userID uint64) ([]dto.MatchProfile, error) {
	profiles, err := u.matchRepo.GetMatchedProfiles(userID)
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
