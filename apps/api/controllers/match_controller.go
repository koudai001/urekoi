package controllers

import (
	"errors"
	"net/http"
	"strconv"

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
	var hasMessage *bool
	if raw := c.Query("has_messages"); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid has_messages"})
			return
		}
		hasMessage = &parsed
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	profiles, err := ctrl.matchUsecase.GetMatches(user.ID, hasMessage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}

func (ctrl *MatchController) GetMatch(c *gin.Context) {
	matchID, err := strconv.ParseUint(c.Param("matchId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid matchId"})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	match, err := ctrl.matchUsecase.GetMatch(user.ID, matchID)
	if err != nil {
		if errors.Is(err, usecases.ErrMatchNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, match)
}
