package main

import (
	"log"

	"api/infra"
	"api/router"
)

func main() {
	infra.Initialize()
	db := infra.SetupDB()
	router := router.SetupRouter(db)
	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalln(err)
	}
}
