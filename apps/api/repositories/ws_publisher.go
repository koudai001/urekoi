package repositories

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// 新着メッセージのイベントを配信するRedis Pub/Subのチャンネル名
const WsMessagesChannel = "ws:messages"

type IWsPublisher interface {
	// channelにpayload(JSON)をPub/Subで配信する
	Publish(channel string, payload []byte) error
}

type WsPublisher struct {
	redis *redis.Client
}

// コンストラクタ
func NewWsPublisher(redisClient *redis.Client) IWsPublisher {
	return &WsPublisher{
		redis: redisClient,
	}
}

// channelにpayload(JSON)をPub/Subで配信する
func (p *WsPublisher) Publish(channel string, payload []byte) error {
	// context.Background()を使うのは、WS配信はリクエストのライフサイクルに依存しないため
	return p.redis.Publish(context.Background(), channel, payload).Err()
}
