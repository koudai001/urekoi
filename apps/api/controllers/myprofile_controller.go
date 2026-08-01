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

type MyProfileController struct {
	myProfileUsecase usecases.IMyProfileUsecase
}

func NewMyProfileController(myProfileUsecase usecases.IMyProfileUsecase) *MyProfileController {
	return &MyProfileController{
		myProfileUsecase: myProfileUsecase,
	}
}

func (ctrl *MyProfileController) GetMyProfile(c *gin.Context) {
	// リクエストのコンテキストから認証済みユーザーを取得
	user := c.MustGet(middlewares.ContextUserKey).(*models.User) // 値.(型)

	profile, err := ctrl.myProfileUsecase.GetMyProfile(user.ID)
	if err != nil {
		if errors.Is(err, usecases.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (ctrl *MyProfileController) UpdateMyProfile(c *gin.Context) {
	var req dto.MyProfileUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateMyProfileUpdateRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	profile, err := ctrl.myProfileUsecase.UpdateMyProfile(user.ID, req)
	if err != nil {
		if errors.Is(err, usecases.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}
