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

type PartnerController struct {
	partnerUsecase usecases.IPartnerUsecase
}

func NewPartnerController(partnerUsecase usecases.IPartnerUsecase) *PartnerController {
	return &PartnerController{
		partnerUsecase: partnerUsecase,
	}
}

func (ctrl *PartnerController) GetRecs(c *gin.Context) {
	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	profiles, err := ctrl.partnerUsecase.GetRecs(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}

func (ctrl *PartnerController) GetByUserId(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid userId"})
		return
	}

	viewer := c.MustGet(middlewares.ContextUserKey).(*models.User)

	profile, err := ctrl.partnerUsecase.GetDetail(viewer.ID, userID)
	if err != nil {
		if errors.Is(err, usecases.ErrPartnerNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}
