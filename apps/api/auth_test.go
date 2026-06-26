package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"api/dto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSignUp_Success(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    "test@example.com",
		Password: "password123",
	})

	require.Equal(t, http.StatusCreated, w.Code)

	var res dto.SignupResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotZero(t, res.ID)
	assert.Equal(t, "test@example.com", res.Email)
}

func TestSignUp_InvalidRequest(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/signup", dto.SignupRequest{
		Email:    "not-an-email",
		Password: "short",
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestSignUp_DuplicateEmail(t *testing.T) {
	router := setup(t)

	body := dto.SignupRequest{
		Email:    "dup@example.com",
		Password: "password123",
	}

	first := postJSON(t, router, "/signup", body)
	require.Equal(t, http.StatusCreated, first.Code)

	second := postJSON(t, router, "/signup", body)
	assert.Equal(t, http.StatusConflict, second.Code)
}

func TestLogin_Success(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "login@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    signupReq.Email,
		Password: signupReq.Password,
	})

	require.Equal(t, http.StatusOK, w.Code)

	var res dto.LoginResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &res))
	assert.NotEmpty(t, res.Token)
}

func TestLogin_WrongPassword(t *testing.T) {
	router := setup(t)

	signupReq := dto.SignupRequest{
		Email:    "login2@example.com",
		Password: "password123",
	}
	require.Equal(t, http.StatusCreated, postJSON(t, router, "/signup", signupReq).Code)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    signupReq.Email,
		Password: "wrongpassword",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLogin_UnknownEmail(t *testing.T) {
	router := setup(t)

	w := postJSON(t, router, "/login", dto.LoginRequest{
		Email:    "notfound@example.com",
		Password: "password123",
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
