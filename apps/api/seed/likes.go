package seed

import (
	"errors"

	"api/models"

	"gorm.io/gorm"
)

// ローカル確認用: ダミープロフィール全員からuser_id=1へのいいねを投入する
// user_id=1が存在しない環境(まだ誰もサインアップしていない)では何もしない
func SeedDummyLikes(db *gorm.DB) error {
	var toUser models.User
	if err := db.First(&toUser, 1).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	for _, dp := range dummyProfiles {
		var fromUser models.User
		if err := db.Where(models.User{Email: dp.Email}).First(&fromUser).Error; err != nil {
			return err
		}

		if fromUser.ID == toUser.ID {
			continue
		}

		like := models.Like{FromUserID: fromUser.ID, ToUserID: toUser.ID}
		if err := db.Where(models.Like{FromUserID: fromUser.ID, ToUserID: toUser.ID}).
			FirstOrCreate(&like).Error; err != nil {
			return err
		}
	}

	return nil
}
