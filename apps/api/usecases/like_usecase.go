package usecases

import (
	"errors"
	"time"

	"api/dto"
	"api/models"
	"api/repositories"
)

var (
	ErrCannotLikeSelf = errors.New("cannot like yourself")
	ErrAlreadyLiked   = errors.New("already liked")
	ErrUserNotFound   = errors.New("user not found")
)

type ILikeUsecase interface {
	SendLike(fromUserID uint64, toUserID uint64) (dto.LikeResponse, error)
	GetPendingLikes(userID uint64) (dto.PendingLikesResponse, error)
}

type LikeUsecase struct {
	likeRepo  repositories.ILikeRepository
	authRepo  repositories.IAuthRepository
	matchRepo repositories.IMatchRepository
}

func NewLikeUsecase(likeRepo repositories.ILikeRepository, authRepo repositories.IAuthRepository, matchRepo repositories.IMatchRepository) ILikeUsecase {
	return &LikeUsecase{
		likeRepo:  likeRepo,
		authRepo:  authRepo,
		matchRepo: matchRepo,
	}
}

// fromUserIDからtoUserIDへいいねを送る。相手が既にfromUserIDにいいね済みならマッチを成立させる
func (u *LikeUsecase) SendLike(fromUserID uint64, toUserID uint64) (dto.LikeResponse, error) {
	if fromUserID == toUserID {
		return dto.LikeResponse{}, ErrCannotLikeSelf
	}

	// toUserIDが存在するか確認
	if _, err := u.authRepo.GetUserByID(toUserID); err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			return dto.LikeResponse{}, ErrUserNotFound
		}
		return dto.LikeResponse{}, err
	}

	// fromUserIDからtoUserIDへのいいねを作成
	like := models.Like{FromUserID: fromUserID, ToUserID: toUserID}
	if err := u.likeRepo.CreateLike(&like); err != nil {
		if errors.Is(err, repositories.ErrLikeAlreadyExists) {
			return dto.LikeResponse{}, ErrAlreadyLiked
		}
		return dto.LikeResponse{}, err
	}

	// toUserIDがfromUserIDに既にいいねしているか確認
	alreadyLikedByPartner, err := u.likeRepo.HasLiked(toUserID, fromUserID)
	if err != nil {
		return dto.LikeResponse{}, err
	}
	if !alreadyLikedByPartner {
		return dto.LikeResponse{Matched: false}, nil
	}

	// 相互いいねが成立したのでマッチを作成
	match := models.Match{User1ID: fromUserID, User2ID: toUserID, MatchedAt: time.Now()}
	if fromUserID > toUserID {
		match.User1ID, match.User2ID = toUserID, fromUserID
	}
	if err := u.matchRepo.CreateMatch(&match); err != nil {
		if !errors.Is(err, repositories.ErrMatchAlreadyExists) {
			return dto.LikeResponse{}, err
		}

		// 重複してる場合は既存のマッチを取得する
		existingMatch, getErr := u.matchRepo.GetMatchByUserIDs(match.User1ID, match.User2ID)
		if getErr != nil {
			return dto.LikeResponse{}, getErr
		}
		match = *existingMatch
	}

	return dto.LikeResponse{Matched: true, MatchID: match.ID}, nil
}

// userIDがもらったいいねのうち、マッチ済み・スキップ済みの相手を除いた一覧を取得する
func (u *LikeUsecase) GetPendingLikes(userID uint64) (dto.PendingLikesResponse, error) {
	profiles, err := u.likeRepo.GetPendingLikes(userID)
	if err != nil {
		return dto.PendingLikesResponse{}, err
	}

	res := make([]dto.LikeProfile, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, dto.LikeProfile{
			UserID:     p.UserID,
			Nickname:   p.Nickname,
			Age:        p.Age(),
			Prefecture: p.Prefecture.Name,
			Online:     mockOnlineStatus,
			Photos:     imageURLs(p.Images),
		})
	}

	return dto.PendingLikesResponse{Total: len(res), Profiles: res}, nil
}
