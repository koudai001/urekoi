package usecases

import (
	"errors"

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
	SendLike(fromUserID uint64, toUserID uint64) error
	GetReceivedLikes(userID uint64) ([]dto.LikeProfile, error)
}

type LikeUsecase struct {
	likeRepo repositories.ILikeRepository
	authRepo repositories.IAuthRepository
}

func NewLikeUsecase(likeRepo repositories.ILikeRepository, authRepo repositories.IAuthRepository) ILikeUsecase {
	return &LikeUsecase{
		likeRepo: likeRepo,
		authRepo: authRepo,
	}
}

// fromUserIDからtoUserIDへいいねを送る
func (u *LikeUsecase) SendLike(fromUserID uint64, toUserID uint64) error {
	if fromUserID == toUserID {
		return ErrCannotLikeSelf
	}

	if _, err := u.authRepo.GetUserByID(toUserID); err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	like := models.Like{FromUserID: fromUserID, ToUserID: toUserID}
	if err := u.likeRepo.CreateLike(&like); err != nil {
		if errors.Is(err, repositories.ErrLikeAlreadyExists) {
			return ErrAlreadyLiked
		}
		return err
	}

	return nil
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
			Photos:     []string{dummyImagePath},
		})
	}

	return res, nil
}
