package repositories

import (
	"errors"
	"sort"
	"time"

	"api/models"

	"gorm.io/gorm"
)

var (
	ErrMatchAlreadyExists = errors.New("already matched")
	ErrMatchNotFound      = errors.New("match not found")
)

// マッチ相手のプロフィールと、そのマッチ自体のIDを合わせて表す
type MatchedProfile struct {
	models.Profile
	MatchID uint64
}

// マッチ相手のプロフィールに、そのマッチの最新メッセージを合わせて表す
type MessagedProfile struct {
	MatchedProfile
	LastMessage             string
	LastMessageAt           time.Time
	LastMessageSenderUserID uint64
}

type IMatchRepository interface {
	CreateMatch(match *models.Match) error
	// メッセージが1通も無いマッチの相手プロフィール一覧を取得する
	GetUnmessagedProfiles(userID uint64) ([]MatchedProfile, error)
	// メッセージが1通以上あるマッチの相手プロフィール一覧を、最新メッセージ付きで取得する
	GetMessagedProfiles(userID uint64) ([]MessagedProfile, error)
	GetMatchByID(matchID uint64) (*models.Match, error)
	GetMatchByUserIDs(user1ID uint64, user2ID uint64) (*models.Match, error)
}

type MatchRepository struct {
	db *gorm.DB
}

// コンストラクタ
func NewMatchRepository(db *gorm.DB) IMatchRepository {
	return &MatchRepository{
		db: db,
	}
}

// マッチを作成する
func (r *MatchRepository) CreateMatch(match *models.Match) error {
	if err := r.db.Create(match).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrMatchAlreadyExists
		}
		return err
	}

	return nil
}

// matchIDでマッチを1件取得する
func (r *MatchRepository) GetMatchByID(matchID uint64) (*models.Match, error) {
	var match models.Match
	if err := r.db.First(&match, matchID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMatchNotFound
		}
		return nil, err
	}

	return &match, nil
}

// ユーザーの組み合わせからマッチを1件取得する。user1IDには小さい方のIDを渡す。
func (r *MatchRepository) GetMatchByUserIDs(user1ID uint64, user2ID uint64) (*models.Match, error) {
	var match models.Match
	if err := r.db.Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).
		First(&match).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMatchNotFound
		}
		return nil, err
	}

	return &match, nil
}

func (r *MatchRepository) GetUnmessagedProfiles(userID uint64) ([]MatchedProfile, error) {
	var matches []models.Match
	if err := r.matchesQuery(userID).
		Where(`NOT EXISTS (SELECT 1 FROM messages WHERE messages.match_id = matches.id)`).
		Find(&matches).Error; err != nil {
		return nil, err
	}

	if len(matches) == 0 {
		return []MatchedProfile{}, nil
	}

	profileByUserID, err := r.profilesByUserIDs(r.partnerUserIDs(matches, userID))
	if err != nil {
		return nil, err
	}

	profiles := make([]MatchedProfile, 0, len(matches))
	for _, match := range matches {
		profiles = append(profiles, MatchedProfile{
			Profile: profileByUserID[match.PartnerUserID(userID)],
			MatchID: match.ID,
		})
	}

	return profiles, nil
}

func (r *MatchRepository) GetMessagedProfiles(userID uint64) ([]MessagedProfile, error) {
	// 各マッチの最新メッセージ1件(id最大値=最新)だけに絞り込んで取得する。
	var matches []models.Match
	if err := r.matchesQuery(userID).
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Where(`messages.id IN (SELECT MAX(m.id) FROM messages m GROUP BY m.match_id)`)
		}).
		Where(`EXISTS (SELECT 1 FROM messages WHERE messages.match_id = matches.id)`).
		Find(&matches).Error; err != nil {
		return nil, err
	}

	if len(matches) == 0 {
		return []MessagedProfile{}, nil
	}

	// 最新メッセージがある相手を上に表示するため、最新メッセージの日時が新しい順に並べる
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].Messages[0].CreatedAt.After(matches[j].Messages[0].CreatedAt)
	})

	// マッチの相手ユーザーIDからプロフィールを取得する
	profileByUserID, err := r.profilesByUserIDs(r.partnerUserIDs(matches, userID))
	if err != nil {
		return nil, err
	}

	// マッチの相手プロフィールと最新メッセージを組み合わせて返す
	profiles := make([]MessagedProfile, 0, len(matches))
	for _, match := range matches {
		lastMessage := match.Messages[0]
		profiles = append(profiles, MessagedProfile{
			MatchedProfile: MatchedProfile{
				Profile: profileByUserID[match.PartnerUserID(userID)],
				MatchID: match.ID,
			},
			LastMessage:             lastMessage.Body,
			LastMessageAt:           lastMessage.CreatedAt,
			LastMessageSenderUserID: lastMessage.SenderUserID,
		})
	}

	return profiles, nil
}

// userIDが当事者のマッチ一覧を取得するクエリ
func (r *MatchRepository) matchesQuery(userID uint64) *gorm.DB {
	return r.db.Where("user1_id = ? OR user2_id = ?", userID, userID)
}

// マッチから相手のユーザーIDを取得する
func (r *MatchRepository) partnerUserIDs(matches []models.Match, userID uint64) []uint64 {
	ids := make([]uint64, 0, len(matches))
	for _, match := range matches {
		ids = append(ids, match.PartnerUserID(userID))
	}

	return ids
}

// 相手のユーザーIDからプロフィールを取得し、user_idをキーにしたmapで返す
func (r *MatchRepository) profilesByUserIDs(userIDs []uint64) (map[uint64]models.Profile, error) {
	var profiles []models.Profile
	if err := r.db.Preload("Prefecture").Preload("User").
		Preload("Images", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order") }).
		Where("user_id IN ?", userIDs).
		Find(&profiles).Error; err != nil {
		return nil, err
	}

	profileByUserID := make(map[uint64]models.Profile, len(profiles))
	for _, p := range profiles {
		profileByUserID[p.UserID] = p
	}

	return profileByUserID, nil
}
