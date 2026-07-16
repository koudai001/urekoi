package models

import "time"

type Like struct {
	ID         uint64 `gorm:"primaryKey"`
	FromUserID uint64 `gorm:"not null;uniqueIndex:idx_likes_from_to"`
	FromUser   User   `gorm:"foreignKey:FromUserID"`
	ToUserID   uint64 `gorm:"not null;uniqueIndex:idx_likes_from_to"`
	ToUser     User   `gorm:"foreignKey:ToUserID"`
	CreatedAt  time.Time
}
