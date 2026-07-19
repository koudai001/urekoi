package controllers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// いいねを送ると201を返すことを検証(相手からはまだいいねをもらっていないのでマッチはしない)
func TestSendLike_Success(t *testing.T) {
	router := setup(t)

	// 送信元と送信先のユーザーを作成
	from := signUpOnlyEmail(t, router, "like-from@example.com")
	to := signUpOnlyEmail(t, router, "like-to@example.com")

	// いいねを送信
	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken)

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.LikeResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.False(t, res.Matched)
}

// 既に相手からいいねをもらっている相手にいいねを送ると、マッチが成立してmatched: trueが返ることを検証
func TestSendLike_ResultsInMatch(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "like-match-from@example.com")
	to := signUpOnlyEmail(t, router, "like-match-to@example.com")

	// 先にtoからfromへいいねを送っておく
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: from.ID}, to.AccessToken).Code)

	// fromからtoへいいねを送ると相互いいねになりマッチする
	w := postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken)

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.LikeResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.True(t, res.Matched)
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

// もらったいいねの送信元プロフィール一覧をtotal付きで取得できることを検証
func TestGetPendingLikes_Success(t *testing.T) {
	router := setup(t)

	// 送信元と送信先のユーザーを作成
	from := signUpOnlyEmail(t, router, "like-received-from@example.com")
	to := signUpOnlyEmail(t, router, "like-received-to@example.com")

	// 送信元から送信先にいいねを送る
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken).Code)

	// 送信先にログインして、もらったいいねの送信元プロフィール一覧を取得
	w := getJSONWithAuth(t, router, "/likes/pending", to.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	// レスポンスの内容を検証
	var res dto.PendingLikesResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, 1, res.Total)
	// サインアップ時のデフォルトプロフィール情報が返ることを検証
	assert.ElementsMatch(t, []dto.LikeProfile{
		{UserID: from.ID, Nickname: "テストユーザー", Age: defaultTestAge, Prefecture: "東京都", Online: "online", Photos: []string{""}},
	}, res.Profiles)
}

// スキップ済みの相手はもらったいいね一覧から除外されることを検証
func TestGetPendingLikes_ExcludesSkipped(t *testing.T) {
	router := setup(t)

	from := signUpOnlyEmail(t, router, "like-skipped-from@example.com")
	to := signUpOnlyEmail(t, router, "like-skipped-to@example.com")

	// 送信元から送信先にいいねを送る
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/likes", dto.LikeRequest{ToUserID: to.ID}, from.AccessToken).Code)

	// 送信先が送信元をスキップする
	require.Equal(t, http.StatusCreated, postJSONWithAuth(t, router, "/skips", dto.SkipRequest{ToUserID: from.ID}, to.AccessToken).Code)

	// スキップ済みなので、もらったいいね一覧には含まれない
	w := getJSONWithAuth(t, router, "/likes/pending", to.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PendingLikesResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, 0, res.Total)
	assert.Empty(t, res.Profiles)
}

// 保留中のいいねがない場合はtotal=0・空配列を返すことを検証
func TestGetPendingLikes_Empty(t *testing.T) {
	router := setup(t)

	// いいねをもらっていないユーザーを作成
	me := signUpOnlyEmail(t, router, "like-received-empty@example.com")

	// いいねをもらっていないので、total=0・空配列が返ることを検証
	w := getJSONWithAuth(t, router, "/likes/pending", me.AccessToken)

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.PendingLikesResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.Equal(t, 0, res.Total)
	assert.Empty(t, res.Profiles)
}

// access_tokenがない場合は401を返すことを検証
func TestGetPendingLikes_Unauthorized(t *testing.T) {
	router := setup(t)

	w := getJSON(t, router, "/likes/pending")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
