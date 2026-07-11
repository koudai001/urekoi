package router

import (
	"net/http"

	"api/controllers"
	"api/middlewares"
	"api/repositories"
	"api/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	authRepo := repositories.NewAuthRepository(db)
	authUsecase := usecases.NewAuthUsecase(authRepo)
	authController := controllers.NewAuthController(authUsecase)

	profileRepo := repositories.NewProfileRepository(db)
	searchUsecase := usecases.NewSearchUsecase(profileRepo)
	searchController := controllers.NewSearchController(searchUsecase)

	tagRepo := repositories.NewTagRepository(db)
	tagUsecase := usecases.NewTagUsecase(tagRepo)
	tagController := controllers.NewTagController(tagUsecase)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.POST("/signup", authController.SignUp)
	router.POST("/login", authController.Login)
	router.POST("/refresh", authController.Refresh)
	router.POST("/logout", authController.Logout)

	searchRouter := router.Group("/search")
	searchRouter.Use(middlewares.AuthRequired(authUsecase))
	searchRouter.GET("/all", searchController.ListProfiles)
	searchRouter.GET("/all/partner/:id", searchController.GetProfileDetail)

	router.GET("/tags", middlewares.AuthRequired(authUsecase), tagController.ListTags)

	return router
}
