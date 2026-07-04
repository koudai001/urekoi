package main

import (
	"api/infra"
	"api/models"
	"api/seed"
)

func main() {
	infra.Initialize()
	db := infra.SetupDB()

	if err := db.AutoMigrate(
		&models.User{},
		&models.Profile{},
		&models.ProfileImage{},
		&models.Prefecture{},
		&models.Tag{},
		&models.ProfileTag{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.RefreshToken{},
	); err != nil {
		panic("Failed to migrate database")
	}

	if err := seed.SeedDefault(db); err != nil {
		panic("Failed to seed database")
	}

	if err := seed.SeedDummyProfiles(db); err != nil {
		panic("Failed to seed dummy profiles")
	}
}
