package main

import (
	"api/infra"
	"api/models"
)

func main() {
	infra.Initialize()
	db := infra.SetupDB()

	if err := db.AutoMigrate(
		&models.User{},
		&models.Profile{},
		&models.ProfileImage{},
		&models.Prefecture{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
	); err != nil {
		panic("Failed to migrate database")
	}
}
