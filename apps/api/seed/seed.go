package seed

import (
	"api/models"

	"gorm.io/gorm"
)

// テストなどから参照する主要な都道府県コード(JIS X 0401)
const (
	PrefectureTokyo = 13
	PrefectureOsaka = 27
)

// 都道府県マスタ(JIS X 0401コード 1〜47)
var prefectures = []models.Prefecture{
	{ID: 1, Name: "北海道"},
	{ID: 2, Name: "青森県"},
	{ID: 3, Name: "岩手県"},
	{ID: 4, Name: "宮城県"},
	{ID: 5, Name: "秋田県"},
	{ID: 6, Name: "山形県"},
	{ID: 7, Name: "福島県"},
	{ID: 8, Name: "茨城県"},
	{ID: 9, Name: "栃木県"},
	{ID: 10, Name: "群馬県"},
	{ID: 11, Name: "埼玉県"},
	{ID: 12, Name: "千葉県"},
	{ID: PrefectureTokyo, Name: "東京都"},
	{ID: 14, Name: "神奈川県"},
	{ID: 15, Name: "新潟県"},
	{ID: 16, Name: "富山県"},
	{ID: 17, Name: "石川県"},
	{ID: 18, Name: "福井県"},
	{ID: 19, Name: "山梨県"},
	{ID: 20, Name: "長野県"},
	{ID: 21, Name: "岐阜県"},
	{ID: 22, Name: "静岡県"},
	{ID: 23, Name: "愛知県"},
	{ID: 24, Name: "三重県"},
	{ID: 25, Name: "滋賀県"},
	{ID: 26, Name: "京都府"},
	{ID: PrefectureOsaka, Name: "大阪府"},
	{ID: 28, Name: "兵庫県"},
	{ID: 29, Name: "奈良県"},
	{ID: 30, Name: "和歌山県"},
	{ID: 31, Name: "鳥取県"},
	{ID: 32, Name: "島根県"},
	{ID: 33, Name: "岡山県"},
	{ID: 34, Name: "広島県"},
	{ID: 35, Name: "山口県"},
	{ID: 36, Name: "徳島県"},
	{ID: 37, Name: "香川県"},
	{ID: 38, Name: "愛媛県"},
	{ID: 39, Name: "高知県"},
	{ID: 40, Name: "福岡県"},
	{ID: 41, Name: "佐賀県"},
	{ID: 42, Name: "長崎県"},
	{ID: 43, Name: "熊本県"},
	{ID: 44, Name: "大分県"},
	{ID: 45, Name: "宮崎県"},
	{ID: 46, Name: "鹿児島県"},
	{ID: 47, Name: "沖縄県"},
}

// タグマスタ(FEのプロフィール編集画面の構成に合わせたカテゴリ)
var tags = []models.Tag{
	// パートナーに求めること
	{Label: "誠実さ", Category: "パートナーに求めること"},
	{Label: "経済力", Category: "パートナーに求めること"},
	{Label: "価値観の一致", Category: "パートナーに求めること"},
	{Label: "一緒にいて楽しい", Category: "パートナーに求めること"},
	// 会える時間
	{Label: "平日昼", Category: "会える時間"},
	{Label: "平日夕方", Category: "会える時間"},
	{Label: "平日夜", Category: "会える時間"},
	{Label: "土日昼", Category: "会える時間"},
	{Label: "土日夕方", Category: "会える時間"},
	{Label: "土日夜", Category: "会える時間"},
	// 待ち合わせ希望エリア
	{Label: "新宿", Category: "待ち合わせ希望エリア"},
	{Label: "渋谷", Category: "待ち合わせ希望エリア"},
	{Label: "池袋", Category: "待ち合わせ希望エリア"},
	{Label: "銀座", Category: "待ち合わせ希望エリア"},
	{Label: "六本木", Category: "待ち合わせ希望エリア"},
	{Label: "横浜", Category: "待ち合わせ希望エリア"},
	// 好きなこと・挑戦してみたいこと
	{Label: "旅行", Category: "好きなこと・挑戦してみたいこと"},
	{Label: "料理", Category: "好きなこと・挑戦してみたいこと"},
	{Label: "読書", Category: "好きなこと・挑戦してみたいこと"},
	{Label: "映画鑑賞", Category: "好きなこと・挑戦してみたいこと"},
	{Label: "スポーツ観戦", Category: "好きなこと・挑戦してみたいこと"},
	// 好きなグルメやお酒
	{Label: "ワイン", Category: "好きなグルメやお酒"},
	{Label: "カフェ巡り", Category: "好きなグルメやお酒"},
	{Label: "焼肉", Category: "好きなグルメやお酒"},
	{Label: "スイーツ", Category: "好きなグルメやお酒"},
	{Label: "日本酒", Category: "好きなグルメやお酒"},
	// 価値観
	{Label: "家族第一", Category: "価値観"},
	{Label: "自由重視", Category: "価値観"},
	{Label: "成長志向", Category: "価値観"},
	{Label: "安定志向", Category: "価値観"},
}

// 都道府県・マイタグなどのマスタデータを投入する(冪等、AutoMigrateの後に呼ぶこと)
// テスト・マイグレーション両方から呼ぶ想定
func SeedDefault(db *gorm.DB) error {
	for _, p := range prefectures {
		if err := db.FirstOrCreate(&p, models.Prefecture{ID: p.ID}).Error; err != nil {
			return err
		}
	}

	for _, tag := range tags {
		t := tag
		if err := db.Where(models.Tag{Label: t.Label}).FirstOrCreate(&t).Error; err != nil {
			return err
		}
	}

	return nil
}
