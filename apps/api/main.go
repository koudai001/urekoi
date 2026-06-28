package main

import (
	"api/infra"
	"api/router"
)

func main() {
	infra.Initialize()
	db := infra.SetupDB()
	router := router.SetupRouter(db)
	router.Run("localhost:8080")
}
