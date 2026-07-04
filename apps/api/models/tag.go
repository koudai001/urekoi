package models

type Tag struct {
	ID       uint64 `gorm:"primaryKey"`
	Label    string `gorm:"type:varchar(50);not null;uniqueIndex"`
	Category string `gorm:"type:varchar(50);not null"`
	ImageURL string `gorm:"type:varchar(255);not null"`
}
