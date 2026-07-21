package controllers

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"api/dto"
	"api/middlewares"
	"api/models"
	"api/usecases"
	"api/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func mustGetEnvMs(key string) time.Duration {
	ms, err := strconv.Atoi(os.Getenv(key))
	if err != nil {
		panic(key + " must be set to a valid number of milliseconds: " + err.Error())
	}

	return time.Duration(ms) * time.Millisecond
}

var upgrader = websocket.Upgrader{
	// TODO: 本番ではFE_URLのオリジンだけ許可するようにする
	CheckOrigin: func(r *http.Request) bool { return true },
}

type WsController struct {
	wsUsecase usecases.IWsUsecase
	hub       *ws.Hub
}

func NewWsController(wsUsecase usecases.IWsUsecase, hub *ws.Hub) *WsController {
	return &WsController{
		wsUsecase: wsUsecase,
		hub:       hub,
	}
}

func (ctrl *WsController) IssueTicket(c *gin.Context) {
	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	ticket, err := ctrl.wsUsecase.IssueTicket(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.WsTicketResponse{Ticket: ticket})
}

// ticketを検証してWebSocketへアップグレードし、切断されるまで接続を維持する
func (ctrl *WsController) Connect(c *gin.Context) {
	ticket := c.Query("ticket")
	if ticket == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket is required"})
		return
	}

	// ticketを検証してユーザーIDを取得
	userID, err := ctrl.wsUsecase.VerifyTicket(ticket)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// WebSocketへアップグレード
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		// Upgrade失敗時点でgorilla/websocketがレスポンスを書き込み済み
		return
	}
	defer conn.Close()
	log.Printf("WS connected: userID=%d", userID)

	// hubに接続を登録し、切断時に削除する
	safeConn := ctrl.hub.Add(userID, conn)
	defer ctrl.hub.Remove(userID, safeConn)

	// pongが返らなくなったら切断するまでの猶予とping送信間隔(TestMainでの.env読み込み後に評価する必要があるため、呼び出し時に取得する)
	pongWait := mustGetEnvMs("WS_PONG_WAIT_MS")
	pingPeriod := pongWait * 9 / 10

	// pongが返らなくなったら切断するためのReadDeadlineを設定
	if err := conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		return
	}
	// pongを受信したらReadDeadlineを延長する
	conn.SetPongHandler(func(string) error {
		log.Printf("WS pong received: userID=%d", userID)
		return conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	// 切断を検知するためのチャネル　関数自体がreturnした瞬間にcloseされるようにdeferでcloseする
	done := make(chan struct{})
	defer close(done)

	// go-routineでpingを定期送信する
	go func() {
		// 54秒ごとにpingを送信することで、60秒のReadDeadlineを延長する
		// 54秒ごとのタイマーを作成
		ticker := time.NewTicker(pingPeriod)
		defer ticker.Stop()

		// 複数のパイプラインをselectで待機する
		for {
			select {
			case <-done: // 切断されたらping送信を終了
				return
			case <-ticker.C: // timerが発火したらpingを送信
				if err := safeConn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
				log.Printf("WS ping sent: userID=%d", userID)
			}
		}
	}()

	// pongの処理(PongHandlerの発火)と、切断・タイムアウトの検知を行う
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			log.Printf("WS disconnected: userID=%d, err=%v", userID, err)
			break
		}
	}
}
