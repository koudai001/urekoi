package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID                 uint64              `gorm:"primaryKey"`
	Email              string              `gorm:"type:varchar(255);not null;uniqueIndex"`
	PasswordCredential *PasswordCredential `gorm:"foreignKey:UserID"`
	AuthIdentities     []AuthIdentity      `gorm:"foreignKey:UserID"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt `gorm:"index"`
}
