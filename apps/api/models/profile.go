package models

import "time"

type Profile struct {
	ID             uint64     `gorm:"primaryKey"`
	UserID         uint64     `gorm:"not null;uniqueIndex"`
	User           User       `gorm:"foreignKey:UserID"`
	Nickname       string     `gorm:"type:varchar(50);not null"`
	Age            int16      `gorm:"not null"`
	PrefectureCode int16      `gorm:"not null"`
	Prefecture     Prefecture `gorm:"foreignKey:PrefectureCode"`
	Introduction   string     `gorm:"type:text"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
