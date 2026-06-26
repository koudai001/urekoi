package controllers

import (
	"net/http"

	"api/dto"
	"api/usecases"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authUsecase usecases.IAuthUsecase
}

// コンストラクタ
func NewAuthController(authUsecase usecases.IAuthUsecase) *AuthController {
	return &AuthController{
		authUsecase: authUsecase,
	}
}

func (ctrl *AuthController) SignUp(c *gin.Context) {
	var req dto.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.authUsecase.SignUp(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SignupResponse{
		ID:    user.ID,
		Email: user.Email,
	})
}
