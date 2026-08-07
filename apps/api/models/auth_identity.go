package models

import "time"

// OAuth/OIDCプロバイダーにおけるユーザーの一意な識別子
type AuthIdentity struct {
	ID             uint64 `gorm:"primaryKey"`
	UserID         uint64 `gorm:"not null;index"`
	User           User   `gorm:"foreignKey:UserID"`
	Provider       string `gorm:"type:varchar(50);not null;uniqueIndex:idx_auth_identities_provider_user"`
	ProviderUserID string `gorm:"type:varchar(255);not null;uniqueIndex:idx_auth_identities_provider_user"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
