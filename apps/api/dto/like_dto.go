package dto

type LikeRequest struct {
	ToUserID uint64 `json:"to_user_id"`
}

type LikeResponse struct {
	Matched bool   `json:"matched"`
	MatchID uint64 `json:"match_id,omitempty"`
}

type PendingLikesResponse struct {
	Total    int             `json:"total"`
	Profiles []ProfileDetail `json:"profiles"`
}
