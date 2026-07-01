package main

import (
	"log"
	"os"

	"api/infra"
	"api/router"
)

func main() {
	infra.Initialize()
	db := infra.SetupDB()
	router := router.SetupRouter(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalln(err)
	}
}
