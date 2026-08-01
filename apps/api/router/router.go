package router

import (
	"net/http"

	"api/controllers"
	"api/middlewares"
	"api/repositories"
	"api/usecases"
	"api/ws"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, redisClient *redis.Client, s3Client *s3.Client) *gin.Engine {
	router := gin.Default()

	profileRepo := repositories.NewProfileRepository(db)

	authRepo := repositories.NewAuthRepository(db)
	authUsecase := usecases.NewAuthUsecase(authRepo, profileRepo)
	authController := controllers.NewAuthController(authUsecase)

	likeRepo := repositories.NewLikeRepository(db)

	partnerUsecase := usecases.NewPartnerUsecase(profileRepo, likeRepo)
	partnerController := controllers.NewPartnerController(partnerUsecase)

	tagRepo := repositories.NewTagRepository(db)
	tagUsecase := usecases.NewTagUsecase(tagRepo)
	tagController := controllers.NewTagController(tagUsecase)

	myProfileUsecase := usecases.NewMyProfileUsecase(profileRepo)
	myProfileController := controllers.NewMyProfileController(myProfileUsecase)

	s3Repo := repositories.NewS3Repository(s3Client)
	profileImageRepo := repositories.NewProfileImageRepository(db)
	profileImageUsecase := usecases.NewProfileImageUsecase(s3Repo, profileRepo, profileImageRepo)
	profileImageController := controllers.NewProfileImageController(profileImageUsecase)

	matchRepo := repositories.NewMatchRepository(db)
	likeUsecase := usecases.NewLikeUsecase(likeRepo, authRepo, matchRepo)
	likeController := controllers.NewLikeController(likeUsecase)

	skipRepo := repositories.NewSkipRepository(db)
	skipUsecase := usecases.NewSkipUsecase(skipRepo, authRepo)
	skipController := controllers.NewSkipController(skipUsecase)

	matchUsecase := usecases.NewMatchUsecase(matchRepo, profileRepo)
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

	partnerRouter := authRequired.Group("/partner")
	partnerRouter.GET("/recs", partnerController.GetRecs)
	partnerRouter.GET("/:userId", partnerController.GetByUserId)

	authRequired.GET("/tags", tagController.ListTags)
	authRequired.GET("/myprofile", myProfileController.GetMyProfile)
	authRequired.PUT("/myprofile", myProfileController.UpdateMyProfile)

	authRequired.POST("/myprofile/images/presign", profileImageController.PresignUpload)
	authRequired.POST("/myprofile/images", profileImageController.CreateImage)
	authRequired.DELETE("/myprofile/images/:imageId", profileImageController.DeleteImage)

	likeRouter := authRequired.Group("/likes")
	likeRouter.POST("", likeController.SendLike)
	likeRouter.GET("/pending", likeController.GetPendingLikes)

	authRequired.POST("/skips", skipController.SendSkip)

	matchRouter := authRequired.Group("/matches")
	matchRouter.GET("/unmessaged", matchController.GetUnmessagedMatches)
	matchRouter.GET("/messaged", matchController.GetMessagedMatches)
	matchRouter.GET("/:matchId", matchController.GetMatch)

	messageRouter := authRequired.Group("/matches/:matchId/messages")
	messageRouter.POST("", messageController.SendMessage)
	messageRouter.GET("", messageController.GetMessages)

	authRequired.POST("/ws/ticket", wsController.IssueTicket)

	// WSハンドシェイク
	router.GET("/ws", wsController.Connect)

	return router
}
