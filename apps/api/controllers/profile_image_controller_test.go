package controllers_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"api/dto"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 署名付きURLとimage_keyを発行できることを検証
func TestPresignUpload_Success(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "presign-success@example.com")

	// 実行: 有効なcontent_type/extensionでpresignをリクエストする
	w := postJSONWithAuth(t, router, "/myprofile/images/presign", dto.ProfileImagePresignRequest{
		ContentType: "image/jpeg",
		Extension:   "jpg",
	}, me.AccessToken)

	// 検証: 200と、upload_url・image_keyが期待した形式で返ることを確認する
	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileImagePresignResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.UploadURL)
	// image_keyが自分のuserID配下・指定した拡張子で発行されていることを検証
	assert.True(t, strings.HasPrefix(res.ImageKey, fmt.Sprintf("profiles/%d/", me.ID)))
	assert.True(t, strings.HasSuffix(res.ImageKey, ".jpg"))
}

// content_type/extensionが未指定の場合400を返すことを検証
func TestPresignUpload_ValidationError(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "presign-invalid@example.com")

	// 実行: content_type/extensionを空のままリクエストする
	w := postJSONWithAuth(t, router, "/myprofile/images/presign", dto.ProfileImagePresignRequest{}, me.AccessToken)

	// 検証: バリデーションエラーで400になることを確認する
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// 対応していない画像形式の場合400を返すことを検証
func TestPresignUpload_UnsupportedContentType(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "presign-unsupported@example.com")

	// 実行: 画像以外のcontent_type(PDF)でリクエストする
	w := postJSONWithAuth(t, router, "/myprofile/images/presign", dto.ProfileImagePresignRequest{
		ContentType: "application/pdf",
		Extension:   "pdf",
	}, me.AccessToken)

	// 検証: 許可リストに無い形式なので400になることを確認する
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestPresignUpload_Unauthorized(t *testing.T) {
	// セットアップ: ルーターだけ用意する(ログインしない)
	router, _, _ := setup(t)

	// 実行: access_token無しでリクエストする
	w := postJSON(t, router, "/myprofile/images/presign", dto.ProfileImagePresignRequest{
		ContentType: "image/jpeg",
		Extension:   "jpg",
	})

	// 検証: 未認証で401になることを確認する
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// presign済みのimage_keyからプロフィール画像を登録できることを検証
func TestCreateImage_Success(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "create-image-success@example.com")

	// 実行: 実際にpresignを叩いて発行されたimage_keyで登録する
	imageKey := presignImageKey(t, router, me.AccessToken)
	w := postJSONWithAuth(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{
		ImageKey: imageKey,
	}, me.AccessToken)

	// 検証: 201と、1枚目なのでsort_order=0で登録されることを確認する
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.ProfileImageResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotZero(t, res.ID)
	assert.Equal(t, int16(0), res.SortOrder)
}

// 2枚目以降は既存の枚数分だけsort_orderが増えていくことを検証
func TestCreateImage_SortOrderIncrements(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "create-image-sortorder@example.com")

	// 実行: 実際にpresignを叩いて発行したimage_keyで、同じユーザーが2枚連続登録する
	first := postJSONWithAuth(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{
		ImageKey: presignImageKey(t, router, me.AccessToken),
	}, me.AccessToken)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSONWithAuth(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{
		ImageKey: presignImageKey(t, router, me.AccessToken),
	}, me.AccessToken)
	require.Equal(t, http.StatusCreated, second.Code)

	// 検証: 1枚目がsort_order=0、2枚目がsort_order=1になっていることを確認する
	var firstRes, secondRes dto.ProfileImageResponse
	require.NoError(t, json.Unmarshal(first.Body.Bytes(), &firstRes))
	require.NoError(t, json.Unmarshal(second.Body.Bytes(), &secondRes))
	assert.Equal(t, int16(0), firstRes.SortOrder)
	assert.Equal(t, int16(1), secondRes.SortOrder)
}

// image_keyが未指定の場合400を返すことを検証
func TestCreateImage_ValidationError(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "create-image-invalid@example.com")

	// 実行: image_keyを空のままリクエストする
	w := postJSONWithAuth(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{}, me.AccessToken)

	// 検証: バリデーションエラーで400になることを確認する
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestCreateImage_Unauthorized(t *testing.T) {
	// セットアップ: ルーターだけ用意する(ログインしない)
	router, _, _ := setup(t)

	// 実行: access_token無しでリクエストする
	w := postJSON(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{
		ImageKey: "profiles/1/xxxx.jpg",
	})

	// 検証: 未認証で401になることを確認する
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// プロフィール画像を削除できることを検証
func TestDeleteImage_Success(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意し、画像を1枚登録しておく
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "delete-image-success@example.com")
	image := createImage(t, router, me.AccessToken)

	// 実行: 自分の画像を削除する
	w := deleteWithAuth(t, router, fmt.Sprintf("/myprofile/images/%d", image.ID), me.AccessToken)

	// 検証: 204で削除が成功することを確認する
	assert.Equal(t, http.StatusNoContent, w.Code)
}

// 他人の画像を削除しようとした場合、存在を知られないよう404を返すことを検証
func TestDeleteImage_NotOwner(t *testing.T) {
	// セットアップ: 画像を持つユーザーaと、別のユーザーbを用意する
	router, _, _ := setup(t)
	a := signUpOnlyEmail(t, router, "delete-image-a@example.com")
	b := signUpOnlyEmail(t, router, "delete-image-b@example.com")
	image := createImage(t, router, a.AccessToken)

	// 実行: bがaの画像を削除しようとする
	w := deleteWithAuth(t, router, fmt.Sprintf("/myprofile/images/%d", image.ID), b.AccessToken)

	// 検証: 自分の画像でないため404になることを確認する
	assert.Equal(t, http.StatusNotFound, w.Code)
}

// 存在しないimageIdの場合404を返すことを検証
func TestDeleteImage_NotFound(t *testing.T) {
	// セットアップ: ルーターとログイン済みユーザーを用意する
	router, _, _ := setup(t)
	me := signUpOnlyEmail(t, router, "delete-image-notfound@example.com")

	// 実行: 存在しないimageIdで削除する
	w := deleteWithAuth(t, router, "/myprofile/images/9999", me.AccessToken)

	// 検証: 404になることを確認する
	assert.Equal(t, http.StatusNotFound, w.Code)
}

// access_tokenがない場合は401を返すことを検証
func TestDeleteImage_Unauthorized(t *testing.T) {
	// セットアップ: ルーターだけ用意する(ログインしない)
	router, _, _ := setup(t)

	// 実行: access_token無しで削除する
	w := deleteWithAuth(t, router, "/myprofile/images/1", "")

	// 検証: 未認証で401になることを確認する
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// presignを叩いて、実際に発行されたimage_keyを返すテスト用ヘルパー
func presignImageKey(t *testing.T, router *gin.Engine, accessToken string) string {
	t.Helper()

	w := postJSONWithAuth(t, router, "/myprofile/images/presign", dto.ProfileImagePresignRequest{
		ContentType: "image/jpeg",
		Extension:   "jpg",
	}, accessToken)
	require.Equal(t, http.StatusOK, w.Code)

	var res dto.ProfileImagePresignResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))

	return res.ImageKey
}

// presign+createを実際に叩いて、登録済みのプロフィール画像を1枚作るテスト用ヘルパー
func createImage(t *testing.T, router *gin.Engine, accessToken string) dto.ProfileImageResponse {
	t.Helper()

	imageKey := presignImageKey(t, router, accessToken)
	w := postJSONWithAuth(t, router, "/myprofile/images", dto.ProfileImageCreateRequest{
		ImageKey: imageKey,
	}, accessToken)
	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.ProfileImageResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))

	return res
}
