package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// いいねを送ると201を返すことを検証
func TestSendLike_Success(t *testing.T) {
	router := setup(t)

	// 送信元と送信先のユーザーを作成
	from := signUpOnlyEmail(t, router, "like-from@example.com")
	to := signUpOnlyEmail(t, router, "like-to@example.com")

	// いいねを送信
	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken)

	// 201 Createdが返ることを検証
	assert.Equal(t, http.StatusCreated, w.Code)
}

// 自分自身にいいねすると400を返すことを検証
func TestSendLike_Self(t *testing.T) {
	router := setup(t)

	me := signUpOnlyEmail(t, router, "like-self@example.com")

	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: me.ID}, me.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// 同じ相手に重複していいねすると409を返すことを検証
func TestSendLike_Duplicate(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "like-dup-from@example.com")
	to := signUpOnlyEmail(t, router, "like-dup-to@example.com")

	first := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken)
	assert.Equal(t, http.StatusConflict, second.Code)
}

// 存在しない相手にいいねすると404を返すことを検証
func TestSendLike_UserNotFound(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "like-notfound@example.com")

	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: 9999}, from.AccessToken)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// to_user_idが未指定の場合400を返すことを検証
func TestSendLike_ValidationError(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "like-invalid@example.com")

	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{}, from.AccessToken)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestSendLike_Unauthorized(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/likes", dto.LikeRequest{ToUserID: 1})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// もらったいいねの送信元プロフィール一覧を取得できることを検証
func TestGetReceivedLikes_Success(t *testing.T) {
	router := setup(t)

	// 送信元と送信先のユーザーを作成
	from := signUpOnlyEmail(t, router, "like-received-from@example.com")
	to := signUpOnlyEmail(t, router, "like-received-to@example.com")

	// 送信元から送信先にいいねを送る
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken).Code)

	// 送信先にログインして、もらったいいねの送信元プロフィール一覧を取得
	w := getJSONWithAuth(t, router, "/likes/received", to.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	// レスポンスの内容を検証
	var res []dto.ProfileSummary
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	// サインアップ時のデフォルトプロフィール情報が返ることを検証
	assert.ElementsMatch(t, []dto.ProfileSummary{
		{UserID: from.ID, Nickname: "テストユーザー", Age: defaultTestAge, Prefecture: "東京都", Image: "", IsNew: true, Online: "online"},
	}, res)
}

// いいねをもらっていない場合は空配列を返すことを検証
func TestGetReceivedLikes_Empty(t *testing.T) {
	router := setup(t)

	// いいねをもらっていないユーザーを作成
	me := signUpOnlyEmail(t, router, "like-received-empty@example.com")

	// いいねをもらっていないので、空配列が返ることを検証
	w := getJSONWithAuth(t, router, "/likes/received", me.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res []dto.ProfileSummary
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Empty(t, res)
}

// access_tokenがない場合は401を返すことを検証
func TestGetReceivedLikes_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/likes/received")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
