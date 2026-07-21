package repositories

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// チケットの有効期限(この間にWS接続してこないと失効する)
const ticketTTL = 30 * time.Second

var ErrTicketNotFound = errors.New("ticket not found or already used")

type ITicketRepository interface {
	// ticket(WS接続時にwss://.../ws?ticket=...で渡す使い捨ての認証用文字列)とuserIDを紐づけて保存する
	CreateTicket(ticket string, userID uint64) error
	// ticketを検証し、1回きりの使用として消費する(取得と同時に削除する)
	ConsumeTicket(ticket string) (userID uint64, err error)
}

type TicketRepository struct {
	redis *redis.Client
}

// コンストラクタ
func NewTicketRepository(redisClient *redis.Client) ITicketRepository {
	return &TicketRepository{
		redis: redisClient,
	}
}

// ticketをキーにuserIDをRedisへ保存する(TTL付き)
func (r *TicketRepository) CreateTicket(ticket string, userID uint64) error {
	return r.redis.Set(context.Background(), ticketKey(ticket), userID, ticketTTL).Err()
}

// ticketに紐づくuserIDを取得すると同時にRedisから削除し、1回きりの使用にする
func (r *TicketRepository) ConsumeTicket(ticket string) (uint64, error) {
	val, err := r.redis.GetDel(context.Background(), ticketKey(ticket)).Result()
	if errors.Is(err, redis.Nil) {
		return 0, ErrTicketNotFound
	}
	if err != nil {
		return 0, err
	}

	userID, err := strconv.ParseUint(val, 10, 64)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

// Redisのキーを生成する
func ticketKey(ticket string) string {
	return fmt.Sprintf("ws:ticket:%s", ticket)
}
