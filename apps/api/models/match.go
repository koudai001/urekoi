package models

import "time"

type Match struct {
	ID uint64 `gorm:"primaryKey"`
	// マッチの重複防止のため、常にuser_idの小さい方をUser1IDに入れる
	User1ID   uint64    `gorm:"not null;uniqueIndex:idx_matches_pair;check:user1_id < user2_id"`
	User1     User      `gorm:"foreignKey:User1ID"`
	User2ID   uint64    `gorm:"not null;uniqueIndex:idx_matches_pair"`
	User2     User      `gorm:"foreignKey:User2ID"`
	MatchedAt time.Time `gorm:"not null"`
	Messages  []Message `gorm:"foreignKey:MatchID"`
}

// userIDから見た相手のuser_idを返す。userIDがこのマッチの当事者であることが前提
func (m Match) PartnerUserID(userID uint64) uint64 {
	if m.User1ID == userID {
		return m.User2ID
	}
	return m.User1ID
}
