package usecases

import (
	"errors"

	"api/dto"
	"api/repositories"
)

var ErrMatchNotFound = errors.New("match not found")

type IMatchUsecase interface {
	// メッセージが1通も無いマッチの相手プロフィール一覧を取得する
	GetUnmessagedMatches(userID uint64) ([]dto.MatchProfile, error)
	// メッセージが1通以上あるマッチの相手プロフィール一覧を、最新メッセージ付きで取得する
	GetMessagedMatches(userID uint64) ([]dto.MatchProfileWithLastMessage, error)
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

func (u *MatchUsecase) GetUnmessagedMatches(userID uint64) ([]dto.MatchProfile, error) {
	profiles, err := u.matchRepo.GetUnmessagedProfiles(userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.MatchProfile, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, toMatchProfile(p))
	}

	return res, nil
}

func (u *MatchUsecase) GetMessagedMatches(userID uint64) ([]dto.MatchProfileWithLastMessage, error) {
	profiles, err := u.matchRepo.GetMessagedProfiles(userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.MatchProfileWithLastMessage, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, dto.MatchProfileWithLastMessage{
			MatchProfile:            toMatchProfile(p.MatchedProfile),
			LastMessage:             p.LastMessage,
			LastMessageAt:           p.LastMessageAt,
			LastMessageSenderUserID: p.LastMessageSenderUserID,
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
	if userID != match.User1ID && userID != match.User2ID {
		return dto.MatchProfileDetail{}, ErrMatchNotFound
	}
	partnerUserID := match.PartnerUserID(userID)

	profile, err := u.profileRepo.GetProfileByUserID(partnerUserID)
	if err != nil {
		return dto.MatchProfileDetail{}, err
	}

	return dto.MatchProfileDetail{
		MatchID:       match.ID,
		MatchedAt:     match.MatchedAt,
		ProfileDetail: buildProfileDetail(*profile, true),
	}, nil
}

func toMatchProfile(p repositories.MatchedProfile) dto.MatchProfile {
	return dto.MatchProfile{
		MatchID:    p.MatchID,
		UserID:     p.UserID,
		Nickname:   p.Nickname,
		Age:        p.Age(),
		Prefecture: p.Prefecture.Name,
		Image:      firstImageURL(p.Images),
	}
}
