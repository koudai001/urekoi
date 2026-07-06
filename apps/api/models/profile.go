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
	Bio            string     `gorm:"type:text"`
	Occupation     string     `gorm:"type:varchar(50)"`
	Hometown       string     `gorm:"type:varchar(50)"`
	BloodType      string     `gorm:"type:varchar(10)"`
	MBTI           string     `gorm:"type:varchar(10)"`
	BodyType       string     `gorm:"type:varchar(20)"`
	Education      string     `gorm:"type:varchar(20)"`
	Holiday        string     `gorm:"type:varchar(20)"`
	Alcohol        string     `gorm:"type:varchar(20)"`
	Smoking        string     `gorm:"type:varchar(20)"`
	HeightCm       int16
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
