package usecases

import (
	"errors"

	"api/models"
	"api/repositories"
)

var (
	ErrCannotSkipSelf = errors.New("cannot skip yourself")
	ErrAlreadySkipped = errors.New("already skipped")
)

type ISkipUsecase interface {
	// スキップを送る
	SendSkip(fromUserID uint64, toUserID uint64) error
}

type SkipUsecase struct {
	skipRepo repositories.ISkipRepository
	authRepo repositories.IAuthRepository
}

func NewSkipUsecase(skipRepo repositories.ISkipRepository, authRepo repositories.IAuthRepository) ISkipUsecase {
	return &SkipUsecase{
		skipRepo: skipRepo,
		authRepo: authRepo,
	}
}

// fromUserIDからtoUserIDへのスキップを作成する
func (u *SkipUsecase) SendSkip(fromUserID uint64, toUserID uint64) error {
	if fromUserID == toUserID {
		return ErrCannotSkipSelf
	}

	// toUserIDが存在するか確認
	if _, err := u.authRepo.GetUserByID(toUserID); err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	skip := models.Skip{FromUserID: fromUserID, ToUserID: toUserID}
	if err := u.skipRepo.CreateSkip(&skip); err != nil {
		if errors.Is(err, repositories.ErrSkipAlreadyExists) {
			return ErrAlreadySkipped
		}
		return err
	}

	return nil
}
