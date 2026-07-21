package controllers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"api/dto"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// チケットが発行され、空でない文字列が返ることを検証
func TestIssueTicket_Success(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "ws-ticket@example.com")

	w := postJSONWithAuth(t, router, "/ws/ticket", nil, me.AccessToken)

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.WsTicketResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.Ticket)
}

// 同じユーザーでも呼ぶたびに異なるチケットが発行されることを検証
func TestIssueTicket_UniquePerCall(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "ws-ticket-unique@example.com")

	first := postJSONWithAuth(t, router, "/ws/ticket", nil, me.AccessToken)
	second := postJSONWithAuth(t, router, "/ws/ticket", nil, me.AccessToken)

	var firstRes, secondRes dto.WsTicketResponse
	require.NoError(t, json.Unmarshal(first.Body.Bytes(), &firstRes))
	require.NoError(t, json.Unmarshal(second.Body.Bytes(), &secondRes))
	assert.NotEqual(t, firstRes.Ticket, secondRes.Ticket)
}

// access_tokenがない場合は401を返すことを検証
func TestIssueTicket_Unauthorized(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/ws/ticket", nil)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// 接続後、サーバーからpingが送られてくることを検証
func TestConnect_SendsPing(t *testing.T) {
	router := setup(t)

	server := httptest.NewServer(router)
	defer server.Close()

	// ユーザー登録してaccess_tokenを取得
	me := signUpOnlyEmail(t, router, "ws-ping@example.com")

	// チケットを発行してWebSocket接続する
	ticketRes := postJSONWithAuth(t, router, "/ws/ticket", nil, me.AccessToken)
	require.Equal(t, http.StatusCreated, ticketRes.Code)

	var ticket dto.WsTicketResponse
	require.NoError(t, json.Unmarshal(ticketRes.Body.Bytes(), &ticket))

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws?ticket=" + ticket.Ticket
	// TCP接続 → WebSocketへのアップグレードのハンドシェイク
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer conn.Close()

	// go-routineのパイプライン
	pingReceived := make(chan struct{}, 1)
	// サーバーからpingが送られてきたらチャネルに通知するようにする
	conn.SetPingHandler(func(appData string) error {
		select {
		case pingReceived <- struct{}{}:
		default:
		}
		// pongを返す
		return conn.WriteControl(websocket.PongMessage, []byte(appData), time.Now().Add(time.Second))
	})

	// ReadMessage()を回し続けないと制御フレーム(ping)が処理されないため、バックグラウンドで読み続ける
	go func() {
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}()

	select {
	case <-pingReceived:
		// テストOKなので抜ける
	case <-time.After(1 * time.Second):
		t.Fatal("ping was not received within 1s")
	}
}
