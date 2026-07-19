package controllers

import (
	"errors"
	"net/http"

	"api/dto"
	"api/middlewares"
	"api/models"
	"api/usecases"
	"api/validators"

	"github.com/gin-gonic/gin"
)

type LikeController struct {
	likeUsecase usecases.ILikeUsecase
}

func NewLikeController(likeUsecase usecases.ILikeUsecase) *LikeController {
	return &LikeController{
		likeUsecase: likeUsecase,
	}
}

func (ctrl *LikeController) SendLike(c *gin.Context) {
	var req dto.LikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateLikeRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	matched, err := ctrl.likeUsecase.SendLike(user.ID, req.ToUserID)
	if err != nil {
		switch {
		case errors.Is(err, usecases.ErrCannotLikeSelf):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, usecases.ErrUserNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, usecases.ErrAlreadyLiked):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, dto.LikeResponse{Matched: matched})
}

func (ctrl *LikeController) GetPendingLikes(c *gin.Context) {
	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	res, err := ctrl.likeUsecase.GetPendingLikes(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
