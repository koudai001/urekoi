package infra

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func SetupRedis() *redis.Client {
	env := os.Getenv("GO_ENV")

	var addr string
	if env == "test" {
		mr, err := miniredis.Run()
		if err != nil {
			panic("Failed to start miniredis: " + err.Error())
		}
		addr = mr.Addr()
		log.Println("Setup miniredis (test)")
	} else {
		addr = fmt.Sprintf("%s:%s", os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PORT"))
	}

	client := redis.NewClient(&redis.Options{Addr: addr})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Redisサーバーへの接続を確認
	if err := client.Ping(ctx).Err(); err != nil {
		panic("Failed to connect redis in 5 seconds: " + err.Error())
	}
	log.Printf("Setup redis (addr=%s, GO_ENV=%s)", addr, env)

	return client
}
