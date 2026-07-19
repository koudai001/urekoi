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

	likeRepo := repositories.NewLikeRepository(db)

	searchUsecase := usecases.NewSearchUsecase(profileRepo, likeRepo)
	searchController := controllers.NewSearchController(searchUsecase)

	tagRepo := repositories.NewTagRepository(db)
	tagUsecase := usecases.NewTagUsecase(tagRepo)
	tagController := controllers.NewTagController(tagUsecase)

	myProfileUsecase := usecases.NewMyProfileUsecase(profileRepo)
	myProfileController := controllers.NewMyProfileController(myProfileUsecase)

	matchRepo := repositories.NewMatchRepository(db)
	likeUsecase := usecases.NewLikeUsecase(likeRepo, authRepo, matchRepo)
	likeController := controllers.NewLikeController(likeUsecase)

	skipRepo := repositories.NewSkipRepository(db)
	skipUsecase := usecases.NewSkipUsecase(skipRepo, authRepo)
	skipController := controllers.NewSkipController(skipUsecase)

	matchUsecase := usecases.NewMatchUsecase(matchRepo)
	matchController := controllers.NewMatchController(matchUsecase)

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
	likeRouter.GET("/pending", likeController.GetPendingLikes)

	authRequired.POST("/skips", skipController.SendSkip)

	authRequired.GET("/matches", matchController.GetMatches)

	return router
}
