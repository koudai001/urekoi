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

	profileRepo := repositories.NewProfileRepository(db)

	authRepo := repositories.NewAuthRepository(db)
	authUsecase := usecases.NewAuthUsecase(authRepo, profileRepo)
	authController := controllers.NewAuthController(authUsecase)

	searchUsecase := usecases.NewSearchUsecase(profileRepo)
	searchController := controllers.NewSearchController(searchUsecase)

	tagRepo := repositories.NewTagRepository(db)
	tagUsecase := usecases.NewTagUsecase(tagRepo)
	tagController := controllers.NewTagController(tagUsecase)

	myProfileUsecase := usecases.NewMyProfileUsecase(profileRepo)
	myProfileController := controllers.NewMyProfileController(myProfileUsecase)

	likeRepo := repositories.NewLikeRepository(db)
	likeUsecase := usecases.NewLikeUsecase(likeRepo, authRepo)
	likeController := controllers.NewLikeController(likeUsecase)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.POST("/signup", authController.SignUp)
	router.POST("/login", authController.Login)
	router.POST("/refresh", authController.Refresh)
	router.POST("/logout", authController.Logout)

	// 認証が必要なルートをグループ化
	authRequired := router.Group("")
	authRequired.Use(middlewares.AuthRequired(authUsecase))

	searchRouter := authRequired.Group("/search")
	searchRouter.GET("/all", searchController.ListProfiles)
	searchRouter.GET("/all/partner/:userId", searchController.GetProfileDetail)

	authRequired.GET("/tags", tagController.ListTags)
	authRequired.GET("/myprofile", myProfileController.GetMyProfile)

	likeRouter := authRequired.Group("/likes")
	likeRouter.POST("", likeController.SendLike)
	likeRouter.GET("/received", likeController.GetReceivedLikes)

	return router
}
