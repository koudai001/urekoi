package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"api/dto"
	"api/middlewares"
	"api/models"
	"api/repositories"
	"api/usecases"
	"api/validators"

	"github.com/gin-gonic/gin"
)

// GetMessagesで1回に返す件数のデフォルト値
const defaultMessagesLimit = 50

type MessageController struct {
	messageUsecase usecases.IMessageUsecase
}

func NewMessageController(messageUsecase usecases.IMessageUsecase) *MessageController {
	return &MessageController{
		messageUsecase: messageUsecase,
	}
}

func (ctrl *MessageController) SendMessage(c *gin.Context) {
	matchID, err := strconv.ParseUint(c.Param("matchId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid matchId"})
		return
	}

	var req dto.MessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateMessageRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	res, err := ctrl.messageUsecase.SendMessage(matchID, user.ID, req.Body)
	if err != nil {
		ctrl.handleMatchError(c, err)
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (ctrl *MessageController) GetMessages(c *gin.Context) {
	matchID, err := strconv.ParseUint(c.Param("matchId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid matchId"})
		return
	}

	var beforeID *uint64
	if raw := c.Query("before_id"); raw != "" {
		id, err := strconv.ParseUint(raw, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid before_id"})
			return
		}
		beforeID = &id
	}

	limit := defaultMessagesLimit
	if raw := c.Query("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
			return
		}
		limit = parsed
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	res, err := ctrl.messageUsecase.GetMessages(matchID, user.ID, beforeID, limit)
	if err != nil {
		ctrl.handleMatchError(c, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

// マッチ関連のエラーをHTTPステータスに変換する共通処理
func (ctrl *MessageController) handleMatchError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, repositories.ErrMatchNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, usecases.ErrNotMatchParticipant):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}
