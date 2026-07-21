package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// userIDごとの現在のWSコネクションを保持する(複数タブ/端末を考慮してスライス)
type Hub struct {
	mu    sync.Mutex             // connsに対する排他制御用のミューテックス
	conns map[uint64][]*SafeConn // WebSocket接続のリスト
}

func NewHub() *Hub {
	return &Hub{
		conns: make(map[uint64][]*SafeConn),
	}
}

// userIDのコネクションを登録し、書き込みロック付きのラッパーを返す
// (呼び出し側もping送信等で書き込む場合は、このSafeConn経由で行うこと)
func (h *Hub) Add(userID uint64, conn *websocket.Conn) *SafeConn {
	h.mu.Lock()
	defer h.mu.Unlock()

	// SafeConnでラップして登録
	safeConn := NewSafeConn(conn)
	h.conns[userID] = append(h.conns[userID], safeConn)

	return safeConn
}

// userIDの現在の接続一覧を返す(呼び出し側で安全に扱えるようコピーを返す)
func (h *Hub) Get(userID uint64) []*SafeConn {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns := h.conns[userID]
	result := make([]*SafeConn, len(conns))
	copy(result, conns)

	return result
}

// userIDから該当のコネクションを取り除く(切断時に呼ぶ)
func (h *Hub) Remove(userID uint64, conn *SafeConn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns := h.conns[userID]
	for i, c := range conns {
		if c == conn {
			// スライスから該当のコネクションを削除
			h.conns[userID] = append(conns[:i], conns[i+1:]...)
			break
		}
	}
	// userIDに紐づくコネクションがなくなった場合は、マップから削除
	if len(h.conns[userID]) == 0 {
		delete(h.conns, userID)
	}
}
