package models

import "time"

// メールアドレスとパスワードでログインするユーザーの認証情報
type PasswordCredential struct {
	UserID       uint64 `gorm:"primaryKey"`
	User         User   `gorm:"foreignKey:UserID"`
	PasswordHash string `gorm:"type:varchar(255);not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
