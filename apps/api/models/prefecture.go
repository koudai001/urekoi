package models

// ID is the JIS X 0401 code (1〜47), seeded manually rather than auto-incremented.
type Prefecture struct {
	ID   int16  `gorm:"primaryKey;autoIncrement:false"`
	Name string `gorm:"type:varchar(10);not null"`
}
