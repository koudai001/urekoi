package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func postJSON(t *testing.T, router http.Handler, path string, body any) *httptest.ResponseRecorder {
	payload, err := json.Marshal(body)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func getJSON(_ *testing.T, router http.Handler, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

// Authorizationヘッダーにaccess_tokenを付けてGETする
func getJSONWithAuth(_ *testing.T, router http.Handler, path string, accessToken string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

// Authorizationヘッダーにaccess_tokenを付けてPOSTする
func postJSONWithAuth(t *testing.T, router http.Handler, path string, body any, accessToken string) *httptest.ResponseRecorder {
	payload, err := json.Marshal(body) // JSONに変換
	require.NoError(t, err)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// レスポンスを記録するためのRecorderを作成
	w := httptest.NewRecorder()

	// ルーターにリクエストを送信
	router.ServeHTTP(w, req)
	return w
}
