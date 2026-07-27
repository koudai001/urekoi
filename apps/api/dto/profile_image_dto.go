package dto

type ProfileImagePresignRequest struct {
	ContentType string `json:"content_type"`
	Extension   string `json:"extension"`
}

type ProfileImagePresignResponse struct {
	UploadURL string `json:"upload_url"`
	ImageKey  string `json:"image_key"`
}

type ProfileImageCreateRequest struct {
	ImageKey string `json:"image_key"`
}

type ProfileImageResponse struct {
	ID        uint64 `json:"id"`
	URL       string `json:"url"`
	SortOrder int16  `json:"sort_order"`
}

type ProfileImageOrderRequest struct {
	ImageIDs []uint64 `json:"image_ids"`
}
