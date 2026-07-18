package controllers

import (
	"net/http"

	"api/middlewares"
	"api/models"
	"api/usecases"

	"github.com/gin-gonic/gin"
)

type MatchController struct {
	matchUsecase usecases.IMatchUsecase
}

func NewMatchController(matchUsecase usecases.IMatchUsecase) *MatchController {
	return &MatchController{
		matchUsecase: matchUsecase,
	}
}

func (ctrl *MatchController) GetMatches(c *gin.Context) {
	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	profiles, err := ctrl.matchUsecase.GetMatches(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}
