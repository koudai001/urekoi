package models

import "time"

type Like struct {
	ID         uint64 `gorm:"primaryKey"`
	FromUserID uint64 `gorm:"not null;uniqueIndex:idx_likes_from_to;check:chk_likes_no_self_like,from_user_id <> to_user_id"`
	FromUser   User   `gorm:"foreignKey:FromUserID"`
	ToUserID   uint64 `gorm:"not null;uniqueIndex:idx_likes_from_to"`
	ToUser     User   `gorm:"foreignKey:ToUserID"`
	CreatedAt  time.Time
}
