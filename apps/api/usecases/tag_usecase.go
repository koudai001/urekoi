package usecases

import (
	"api/dto"
	"api/repositories"
)

type ITagUsecase interface {
	// 選択可能な全タグを取得する
	ListTags() ([]dto.TagOption, error)
}

type TagUsecase struct {
	tagRepo repositories.ITagRepository
}

func NewTagUsecase(tagRepo repositories.ITagRepository) ITagUsecase {
	return &TagUsecase{
		tagRepo: tagRepo,
	}
}

func (u *TagUsecase) ListTags() ([]dto.TagOption, error) {
	tags, err := u.tagRepo.GetAllTags()
	if err != nil {
		return nil, err
	}

	res := make([]dto.TagOption, 0, len(tags))
	for _, t := range tags {
		res = append(res, dto.TagOption{
			ID:       t.ID,
			Label:    t.Label,
			Category: t.Category,
		})
	}

	return res, nil
}
