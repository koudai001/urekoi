package middlewares

import (
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
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set(ContextUserKey, user)
		c.Next()
	}
}
