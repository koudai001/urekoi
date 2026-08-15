package middlewares

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"api/usecases"

	"github.com/gin-gonic/gin"
)

// 認証済みユーザーをコンテキストに詰める際のキー
const ContextUserKey = "user"

// AuthorizationヘッダーのJWTを検証し、認証済みユーザーのみ後続処理へ進める
func AuthRequired(authUsecase usecases.IAuthUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
		if !ok || token == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		user, err := authUsecase.GetUserFromToken(token)
		if err != nil {
			if errors.Is(err, usecases.ErrInvalidToken) {
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			// DB接続エラー等、トークン自体の問題ではない場合は500(詳細はレスポンスに含めずログにだけ残す)
			log.Printf("failed to get user from token: %v", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.Set(ContextUserKey, user)
		c.Next()
	}
}
