package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"api/dto"
	"api/middlewares"
	"api/models"
	"api/usecases"

	"github.com/gin-gonic/gin"
)

// searchのlimitのデフォルト値と最大値
const (
	defaultPartnerSearchLimit = 20
	maxPartnerSearchLimit     = 50
)

type PartnerController struct {
	partnerUsecase usecases.IPartnerUsecase
}

func NewPartnerController(partnerUsecase usecases.IPartnerUsecase) *PartnerController {
	return &PartnerController{
		partnerUsecase: partnerUsecase,
	}
}

func (ctrl *PartnerController) Search(c *gin.Context) {
	user := c.MustGet(middlewares.ContextUserKey).(*models.User)

	// 任意の検索条件をDTOへ変換し、不正な型はUsecaseへ渡す前に400として返す。
	var input dto.PartnerSearchRequest
	if err := c.ShouldBindQuery(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid search parameters"})
		return
	}

	// 並び順は未指定の通常順か、新着順だけを許可する。
	if input.Sort != "" && input.Sort != "newest" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sort"})
		return
	}

	// 件数未指定時はデフォルトを使い、過大な取得要求は拒否
	if input.Limit == 0 {
		input.Limit = defaultPartnerSearchLimit
	} else if input.Limit < 1 || input.Limit > maxPartnerSearchLimit {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
		return
	}

	result, err := ctrl.partnerUsecase.Search(user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
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
