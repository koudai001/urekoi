package controllers

import (
	"errors"
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
		if errors.Is(err, usecases.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SignupResponse{
		ID:    user.ID,
		Email: user.Email,
	})
}

func (ctrl *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := ctrl.authUsecase.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, usecases.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.LoginResponse{
		Token: *token,
	})
}
