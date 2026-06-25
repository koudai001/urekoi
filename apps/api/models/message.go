package models

import "time"

type Message struct {
	ID           uint64 `gorm:"primaryKey"`
	MatchID      uint64 `gorm:"not null"`
	Match        Match  `gorm:"foreignKey:MatchID;constraint:OnDelete:CASCADE"`
	SenderUserID uint64 `gorm:"not null"`
	SenderUser   User   `gorm:"foreignKey:SenderUserID"`
	Body         string `gorm:"type:text;not null"`
	CreatedAt    time.Time
}
