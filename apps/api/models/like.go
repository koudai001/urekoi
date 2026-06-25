package models

import "time"

type Like struct {
	ID         uint64 `gorm:"primaryKey"`
	FromUserID uint64 `gorm:"not null"`
	FromUser   User   `gorm:"foreignKey:FromUserID"`
	ToUserID   uint64 `gorm:"not null"`
	ToUser     User   `gorm:"foreignKey:ToUserID"`
	CreatedAt  time.Time
}
