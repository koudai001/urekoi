package models

import "time"

type Skip struct {
	ID uint64 `gorm:"primaryKey"`
	// from_user_id: スキップした側、to_user_id: スキップされた側
	FromUserID uint64 `gorm:"not null;uniqueIndex:idx_skips_from_to;check:chk_skips_no_self_skip,from_user_id <> to_user_id"`
	FromUser   User   `gorm:"foreignKey:FromUserID"`
	ToUserID   uint64 `gorm:"not null;uniqueIndex:idx_skips_from_to"`
	ToUser     User   `gorm:"foreignKey:ToUserID"`
	CreatedAt  time.Time
}
