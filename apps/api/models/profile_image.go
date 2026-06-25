package models

import "time"

type ProfileImage struct {
	ID        uint64  `gorm:"primaryKey"`
	ProfileID uint64  `gorm:"not null"`
	Profile   Profile `gorm:"foreignKey:ProfileID"`
	URL       string  `gorm:"type:varchar(255);not null"`
	SortOrder int16   `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
