package models

import "time"

type Profile struct {
	ID             uint64         `gorm:"primaryKey"`
	UserID         uint64         `gorm:"not null;uniqueIndex"`
	User           User           `gorm:"foreignKey:UserID"`
	Nickname       string         `gorm:"type:varchar(50);not null"`
	Gender         string         `gorm:"type:varchar(10);not null;check:gender IN ('male','female')"`
	Birthdate      time.Time      `gorm:"type:date;not null"`
	Images         []ProfileImage `gorm:"foreignKey:ProfileID"`
	ProfileTags    []ProfileTag   `gorm:"foreignKey:ProfileID"`
	PrefectureCode int16          `gorm:"not null"`
	Prefecture     Prefecture     `gorm:"foreignKey:PrefectureCode"`
	Bio            string         `gorm:"type:text"`
	Occupation     string         `gorm:"type:varchar(50)"`
	Hometown       string         `gorm:"type:varchar(50)"`
	BloodType      string         `gorm:"type:varchar(10)"`
	MBTI           string         `gorm:"type:varchar(10)"`
	BodyType       string         `gorm:"type:varchar(20)"`
	Education      string         `gorm:"type:varchar(20)"`
	Holiday        string         `gorm:"type:varchar(20)"`
	Alcohol        string         `gorm:"type:varchar(20)"`
	Smoking        string         `gorm:"type:varchar(20)"`
	HeightCm       int16
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// Birthdateから現在の満年齢を計算する
func (p Profile) Age() int16 {
	now := time.Now()

	age := now.Year() - p.Birthdate.Year()
	hasHadBirthdayThisYear := now.Month() > p.Birthdate.Month() ||
		(now.Month() == p.Birthdate.Month() && now.Day() >= p.Birthdate.Day())
	if !hasHadBirthdayThisYear {
		age--
	}

	return int16(age)
}
