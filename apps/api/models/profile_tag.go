package models

import "time"

type ProfileTag struct {
	ID        uint64  `gorm:"primaryKey"`
	ProfileID uint64  `gorm:"not null"`
	Profile   Profile `gorm:"foreignKey:ProfileID"`
	TagID     uint64  `gorm:"not null"`
	Tag       Tag     `gorm:"foreignKey:TagID"`
	SortOrder int16   `gorm:"not null"`
	CreatedAt time.Time
}
