package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint64    `gorm:"primaryKey"`
	Email     string    `gorm:"type:varchar(255);not null;uniqueIndex"`
	Password  string    `gorm:"type:varchar(255);not null"`
	Gender    string    `gorm:"type:varchar(10);not null;check:gender IN ('male','female')"` // signup時に確定。以降変更不可
	Birthdate time.Time `gorm:"type:date;not null"`                                          // signup時に確定。以降変更不可
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// Birthdateから現在の満年齢を計算する
func (u User) Age() int16 {
	now := time.Now()

	age := now.Year() - u.Birthdate.Year()
	hasHadBirthdayThisYear := now.Month() > u.Birthdate.Month() ||
		(now.Month() == u.Birthdate.Month() && now.Day() >= u.Birthdate.Day())
	if !hasHadBirthdayThisYear {
		age--
	}

	return int16(age)
}
