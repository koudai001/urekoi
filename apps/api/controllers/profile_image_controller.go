package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"api/dto"
	"api/middlewares"
	"api/models"
	"api/usecases"
	"api/validators"

	"github.com/gin-gonic/gin"
)

type ProfileImageController struct {
	profileImageUsecase usecases.IProfileImageUsecase
}

func NewProfileImageController(profileImageUsecase usecases.IProfileImageUsecase) *ProfileImageController {
	return &ProfileImageController{
		profileImageUsecase: profileImageUsecase,
	}
}

func (ctrl *ProfileImageController) PresignUpload(c *gin.Context) {
	var req dto.ProfileImagePresignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateProfileImagePresignRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	res, err := ctrl.profileImageUsecase.PresignUpload(user.ID, req.ContentType, req.Extension)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (ctrl *ProfileImageController) CreateImage(c *gin.Context) {
	var req dto.ProfileImageCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateProfileImageCreateRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	res, err := ctrl.profileImageUsecase.CreateImage(user.ID, req.ImageKey)
	if err != nil {
		if errors.Is(err, usecases.ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (ctrl *ProfileImageController) DeleteImage(c *gin.Context) {
	imageID, err := strconv.ParseUint(c.Param("imageId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid imageId"})
		return
	}

	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	if err := ctrl.profileImageUsecase.DeleteImage(user.ID, imageID); err != nil {
		switch {
		case errors.Is(err, usecases.ErrProfileNotFound), errors.Is(err, usecases.ErrProfileImageNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}
