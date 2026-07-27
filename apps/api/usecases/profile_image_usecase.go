package usecases

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"

	"api/dto"
	"api/models"
	"api/repositories"
)

var ErrProfileImageNotFound = errors.New("profile image not found")

type IProfileImageUsecase interface {
	// アップロード用の署名付きURLとkeyを発行する
	PresignUpload(userID uint64, contentType string, extension string) (dto.ProfileImagePresignResponse, error)
	// presignでアップロード済みのkeyからプロフィール画像を登録する
	CreateImage(userID uint64, imageKey string) (dto.ProfileImageResponse, error)
	// プロフィール画像を削除する。userIDが当事者でなければErrProfileImageNotFoundを返す
	DeleteImage(userID uint64, imageID uint64) error
}

type ProfileImageUsecase struct {
	s3Repo           repositories.IS3Repository
	profileRepo      repositories.IProfileRepository
	profileImageRepo repositories.IProfileImageRepository
}

func NewProfileImageUsecase(
	s3Repo repositories.IS3Repository,
	profileRepo repositories.IProfileRepository,
	profileImageRepo repositories.IProfileImageRepository,
) IProfileImageUsecase {
	return &ProfileImageUsecase{
		s3Repo:           s3Repo,
		profileRepo:      profileRepo,
		profileImageRepo: profileImageRepo,
	}
}

func (u *ProfileImageUsecase) PresignUpload(userID uint64, contentType string, extension string) (dto.ProfileImagePresignResponse, error) {
	// S3のkeyを生成する
	key, err := generateImageKey(userID, extension)
	if err != nil {
		return dto.ProfileImagePresignResponse{}, err
	}

	// 署名付きURLを発行する
	uploadURL, err := u.s3Repo.PresignUpload(key, contentType)
	if err != nil {
		return dto.ProfileImagePresignResponse{}, err
	}

	return dto.ProfileImagePresignResponse{
		UploadURL: uploadURL,
		ImageKey:  key,
	}, nil
}

func (u *ProfileImageUsecase) CreateImage(userID uint64, imageKey string) (dto.ProfileImageResponse, error) {
	// userIDからprofile_id(外部キー)を引く。Imagesもpreload済みなのでsort_orderの算出にも使う
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return dto.ProfileImageResponse{}, ErrProfileNotFound
		}
		return dto.ProfileImageResponse{}, err
	}

	// 既存の画像枚数をそのまま新しいsort_orderにする(末尾に追加)
	sortOrder := int16(len(profile.Images))

	image := &models.ProfileImage{
		ProfileID: profile.ID,
		ImageKey:  imageKey,
		SortOrder: sortOrder,
	}
	if err := u.profileImageRepo.CreateProfileImage(image); err != nil {
		return dto.ProfileImageResponse{}, err
	}

	return dto.ProfileImageResponse{
		ID: image.ID,
		// TODO: 閲覧用URLの組み立て(IMAGE_BASE_URL + ImageKey)は未実装。今は暫定でImageKeyをそのまま返す
		URL:       image.ImageKey,
		SortOrder: image.SortOrder,
	}, nil
}

func (u *ProfileImageUsecase) DeleteImage(userID uint64, imageID uint64) error {
	// userIDからprofile_id(外部キー)を引く
	profile, err := u.profileRepo.GetProfileByUserID(userID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileNotFound) {
			return ErrProfileNotFound
		}
		return err
	}

	image, err := u.profileImageRepo.GetProfileImageByID(imageID)
	if err != nil {
		if errors.Is(err, repositories.ErrProfileImageNotFound) {
			return ErrProfileImageNotFound
		}
		return err
	}

	// 当事者以外には存在を知られたくないので、自分の画像でなければ一律「見つからない」として扱う
	if image.ProfileID != profile.ID {
		return ErrProfileImageNotFound
	}

	// S3側のオブジェクトも削除する
	if err := u.s3Repo.DeleteObject(image.ImageKey); err != nil {
		return err
	}

	return u.profileImageRepo.DeleteProfileImage(imageID)
}

// profiles/{userID}/{ランダムなファイル名}.{extension}の形式でS3のkeyを生成する
func generateImageKey(userID uint64, extension string) (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	return fmt.Sprintf("profiles/%d/%s.%s", userID, hex.EncodeToString(buf), extension), nil
}
