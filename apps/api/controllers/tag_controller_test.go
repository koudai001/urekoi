package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// seed済みの全タグ(id・label・category)を取得できることを検証
func TestListTags_Success(t *testing.T) {
	router := setup(t)

	accessToken := signUpAndGetAccessToken(t, router, "tags-viewer@example.com")

	w := getJSONWithAuth(t, router, "/tags", accessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.TagOption
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	require.Len(t, res, 30)

	found := false
	for _, tag := range res {
		if tag.Label == "新宿" {
			found = true
			assert.Equal(t, "待ち合わせ希望エリア", tag.Category)
			assert.NotZero(t, tag.ID)
		}
	}
	assert.True(t, found, "新宿タグが含まれていること")
}

// access_tokenがない場合は401を返すことを検証
func TestListTags_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/tags")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
