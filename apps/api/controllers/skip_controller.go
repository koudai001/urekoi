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

type SkipController struct {
	skipUsecase usecases.ISkipUsecase
}

func NewSkipController(skipUsecase usecases.ISkipUsecase) *SkipController {
	return &SkipController{
		skipUsecase: skipUsecase,
	}
}

func (ctrl *SkipController) SendSkip(c *gin.Context) {
	var req dto.SkipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateSkipRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	if err := ctrl.skipUsecase.SendSkip(user.ID, req.ToUserID); err != nil {
		switch {
		case errors.Is(err, usecases.ErrCannotSkipSelf):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, usecases.ErrUserNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, usecases.ErrAlreadySkipped):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.Status(http.StatusCreated)
}
