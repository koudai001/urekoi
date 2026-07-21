package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// gorilla/websocketは同時に複数goroutineから書き込むことを許容しないため、
// 書き込み(WriteMessage)だけをロックで直列化するラッパー
type SafeConn struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

func NewSafeConn(conn *websocket.Conn) *SafeConn {
	return &SafeConn{conn: conn}
}

func (c *SafeConn) WriteMessage(messageType int, data []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.conn.WriteMessage(messageType, data)
}
