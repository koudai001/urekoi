package ws

import (
	"context"
	"encoding/json"
	"log"

	"api/dto"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

// channelをsubscribeし続け、受信した新着メッセージイベントを
// このインスタンスが持っている該当ユーザーの接続にだけ配信する
func StartSubscriber(redisClient *redis.Client, hub *Hub, channel string) {
	sub := redisClient.Subscribe(context.Background(), channel)

	// channelの購読を開始する
	for redisMsg := range sub.Channel() {
		var payload dto.NewMessagePayload
		if err := json.Unmarshal([]byte(redisMsg.Payload), &payload); err != nil {
			log.Printf("failed to unmarshal ws pubsub payload: %v", err)
			continue
		}

		for _, conn := range hub.Get(payload.RecipientUserID) {
			// jsonでWebSocketに送信する
			if err := conn.WriteMessage(websocket.TextMessage, []byte(redisMsg.Payload)); err != nil {
				log.Printf("failed to push ws message: %v", err)
			}
		}
	}
}
