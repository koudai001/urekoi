package dto

type SignupRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	Gender         string `json:"gender"`
	Birthdate      string `json:"birthdate"` // YYYY-MM-DD
	Nickname       string `json:"nickname"`
	PrefectureCode int16  `json:"prefecture_code"`
}

type SignupResponse struct {
	ID           uint64 `json:"id"`
	Email        string `json:"email"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refresh_token"`
}
