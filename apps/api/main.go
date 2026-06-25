package main

import "api/infra"

func main() {
	infra.Initialize()
	db := infra.SetupDB()
	router := setupRouter(db)
	router.Run("localhost:8080")
}
