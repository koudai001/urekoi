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
	// いいねを送る。戻り値は相互いいねによりマッチが成立したかどうか
	SendLike(fromUserID uint64, toUserID uint64) (matched bool, err error)
	GetReceivedLikes(userID uint64) ([]dto.LikeProfile, error)
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
func (u *LikeUsecase) SendLike(fromUserID uint64, toUserID uint64) (bool, error) {
	if fromUserID == toUserID {
		return false, ErrCannotLikeSelf
	}

	// toUserIDが存在するか確認
	if _, err := u.authRepo.GetUserByID(toUserID); err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			return false, ErrUserNotFound
		}
		return false, err
	}

	// fromUserIDからtoUserIDへのいいねを作成
	like := models.Like{FromUserID: fromUserID, ToUserID: toUserID}
	if err := u.likeRepo.CreateLike(&like); err != nil {
		if errors.Is(err, repositories.ErrLikeAlreadyExists) {
			return false, ErrAlreadyLiked
		}
		return false, err
	}

	// toUserIDがfromUserIDに既にいいねしているか確認
	alreadyLikedByPartner, err := u.likeRepo.HasLiked(toUserID, fromUserID)
	if err != nil {
		return false, err
	}
	if !alreadyLikedByPartner {
		return false, nil
	}

	// 相互いいねが成立したのでマッチを作成
	match := models.Match{User1ID: fromUserID, User2ID: toUserID, MatchedAt: time.Now()}
	if fromUserID > toUserID {
		match.User1ID, match.User2ID = toUserID, fromUserID
	}
	if err := u.matchRepo.CreateMatch(&match); err != nil {
		// 相手側の同時いいねと競合して既にマッチ済みになっていても、結果としてはマッチ成立
		if !errors.Is(err, repositories.ErrMatchAlreadyExists) {
			return false, err
		}
	}

	return true, nil
}

// userIDがもらったいいね(送信元プロフィール)一覧を取得する
func (u *LikeUsecase) GetReceivedLikes(userID uint64) ([]dto.LikeProfile, error) {
	profiles, err := u.likeRepo.GetLikedProfiles(userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.LikeProfile, 0, len(profiles))
	for _, p := range profiles {
		res = append(res, dto.LikeProfile{
			UserID:     p.UserID,
			Nickname:   p.Nickname,
			Age:        p.User.Age(),
			Prefecture: p.Prefecture.Name,
			Online:     mockOnlineStatus,
			Photos:     imageURLs(p.Images),
		})
	}

	return res, nil
}
