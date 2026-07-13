package controllers

import (
	"errors"
	"net/http"

	"api/dto"
	"api/usecases"
	"api/validators"

	"github.com/gin-gonic/gin"
)

// JSON構文・型がおかしい場合のエラーメッセージ(binding削除後はShouldBindJSONの失敗要因がこれに限られる)
const errInvalidRequestFormat = "リクエストの形式が正しくありません"

type AuthController struct {
	authUsecase usecases.IAuthUsecase
}

func NewAuthController(authUsecase usecases.IAuthUsecase) *AuthController {
	return &AuthController{
		authUsecase: authUsecase,
	}
}

func (ctrl *AuthController) SignUp(c *gin.Context) {
	var req dto.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateSignupRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, accessToken, refreshToken, err := ctrl.authUsecase.SignUp(req)
	if err != nil {
		if errors.Is(err, usecases.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SignupResponse{
		ID:           user.ID,
		Email:        user.Email,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

func (ctrl *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateLoginRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, refreshToken, err := ctrl.authUsecase.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, usecases.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

func (ctrl *AuthController) Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateRefreshRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, refreshToken, err := ctrl.authUsecase.Refresh(req.RefreshToken)
	if err != nil {
		if errors.Is(err, usecases.ErrInvalidRefreshToken) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

func (ctrl *AuthController) Logout(c *gin.Context) {
	var req dto.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidRequestFormat})
		return
	}

	if err := validators.ValidateLogoutRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.authUsecase.Logout(req.RefreshToken); err != nil {
		if errors.Is(err, usecases.ErrInvalidRefreshToken) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
