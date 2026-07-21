package router

import (
	"net/http"

	"api/controllers"
	"api/middlewares"
	"api/repositories"
	"api/usecases"
	"api/ws"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, redisClient *redis.Client) *gin.Engine {
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

	wsPublisher := repositories.NewWsPublisher(redisClient)

	messageRepo := repositories.NewMessageRepository(db)
	messageUsecase := usecases.NewMessageUsecase(messageRepo, matchRepo, wsPublisher)
	messageController := controllers.NewMessageController(messageUsecase)

	ticketRepo := repositories.NewTicketRepository(redisClient)
	wsUsecase := usecases.NewWsUsecase(ticketRepo)
	hub := ws.NewHub()
	wsController := controllers.NewWsController(wsUsecase, hub)

	// Redisの新着メッセージイベントをsubscribeし、自分のサーバーが持つ接続へ配信し続ける
	go ws.StartSubscriber(redisClient, hub, repositories.WsMessagesChannel)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.POST("/signup", authController.SignUp)
	router.POST("/login", authController.Login)
	router.POST("/refresh", authController.Refresh)
	router.POST("/logout", authController.Logout)

	// 認証が必要なルート
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

	messageRouter := authRequired.Group("/matches/:matchId/messages")
	messageRouter.POST("", messageController.SendMessage)
	messageRouter.GET("", messageController.GetMessages)

	authRequired.POST("/ws/ticket", wsController.IssueTicket)

	// WSハンドシェイク
	router.GET("/ws", wsController.Connect)

	return router
}
