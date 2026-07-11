package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"api/usecases"

	"github.com/gin-gonic/gin"
)

type SearchController struct {
	searchUsecase usecases.ISearchUsecase
}

func NewSearchController(searchUsecase usecases.ISearchUsecase) *SearchController {
	return &SearchController{
		searchUsecase: searchUsecase,
	}
}

func (ctrl *SearchController) ListProfiles(c *gin.Context) {
	profiles, err := ctrl.searchUsecase.ListProfiles()
	if err != nil {
		if errors.Is(err, usecases.ErrNoProfilesFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}

func (ctrl *SearchController) GetProfileDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	profile, err := ctrl.searchUsecase.GetProfileDetail(id)
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
