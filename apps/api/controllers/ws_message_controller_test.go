package controllers_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"api/dto"
	"api/repositories"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// メッセージ送信に成功すると、Redisの ws:messages チャンネルにイベントがpublishされることを検証
func TestSendMessage_PublishesToRedis(t *testing.T) {
	router, db, redisClient := setupWithRedis(t)

	a := signUpOnlyEmail(t, router, "message-publish-a@example.com")
	b := signUpOnlyEmail(t, router, "message-publish-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	// 送信前にsubscribeしておく
	ctx := context.Background()
	sub := redisClient.Subscribe(ctx, repositories.WsMessagesChannel)
	defer sub.Close()

	// aがbにメッセージを送信する
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "よろしく"}, a.AccessToken).Code)

	// Redis Pub/Subでイベントがpublishされるのを待つ(購読確認イベントは自動でスキップされる)
	recvCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	pubsubMsg, err := sub.ReceiveMessage(recvCtx)
	require.NoError(t, err)

	var payload dto.NewMessagePayload
	require.NoError(t, json.Unmarshal([]byte(pubsubMsg.Payload), &payload))
	assert.Equal(t, b.ID, payload.RecipientUserID)
	assert.Equal(t, matchID, payload.MatchID)
	assert.Equal(t, a.ID, payload.Message.SenderUserID)
	assert.Equal(t, "よろしく", payload.Message.Body)
}

// aがメッセージを送信すると、WS接続中のbにリアルタイムでプッシュされることを検証(送信→Redis publish→subscriber→WSまでの一連の流れ)
func TestSendMessage_PushesToConnectedRecipient(t *testing.T) {
	router, db := setupWithDB(t)

	// WS接続するためのサーバを立てる
	server := httptest.NewServer(router)
	defer server.Close()

	a := signUpOnlyEmail(t, router, "message-push-a@example.com")
	b := signUpOnlyEmail(t, router, "message-push-b@example.com")
	matchID := createMatch(t, router, db, a, b)

	// bが実際にWS接続する
	ticketRes := postJSONWithAuth(t, router, "/ws/ticket", nil, b.AccessToken)
	require.Equal(t, http.StatusCreated, ticketRes.Code)

	var ticket dto.WsTicketResponse
	require.NoError(t, json.Unmarshal(ticketRes.Body.Bytes(), &ticket))

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws?ticket=" + ticket.Ticket
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer conn.Close()

	// aがbにメッセージを送信する
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, fmt.Sprintf("/matches/%d/messages", matchID), dto.MessageRequest{Body: "よろしく"}, a.AccessToken).Code)

	// bのWS接続にプッシュされてくるのを待つ
	require.NoError(t, conn.SetReadDeadline(time.Now().Add(3*time.Second)))
	_, data, err := conn.ReadMessage()
	require.NoError(t, err)

	// レスポンスの内容を検証
	var payload dto.NewMessagePayload
	require.NoError(t, json.Unmarshal(data, &payload))
	assert.Equal(t, b.ID, payload.RecipientUserID)
	assert.Equal(t, matchID, payload.MatchID)
	assert.Equal(t, a.ID, payload.Message.SenderUserID)
	assert.Equal(t, "よろしく", payload.Message.Body)
}
