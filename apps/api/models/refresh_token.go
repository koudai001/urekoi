package models

import "time"

type RefreshToken struct {
	ID        uint64    `gorm:"primaryKey"`
	UserID    uint64    `gorm:"not null"`
	User      User      `gorm:"foreignKey:UserID"`
	TokenHash string    `gorm:"type:varchar(255);not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}
