package controllers

import (
	"net/http"

	"api/usecases"

	"github.com/gin-gonic/gin"
)

type TagController struct {
	tagUsecase usecases.ITagUsecase
}

func NewTagController(tagUsecase usecases.ITagUsecase) *TagController {
	return &TagController{
		tagUsecase: tagUsecase,
	}
}

func (ctrl *TagController) ListTags(c *gin.Context) {
	tags, err := ctrl.tagUsecase.ListTags()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tags)
}
