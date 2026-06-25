package models

import "time"

type Match struct {
	ID        uint64 `gorm:"primaryKey"`
	User1ID   uint64 `gorm:"not null"`
	User1     User   `gorm:"foreignKey:User1ID"`
	User2ID   uint64 `gorm:"not null"`
	User2     User   `gorm:"foreignKey:User2ID"`
	MatchedAt time.Time `gorm:"not null"`
}
