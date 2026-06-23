export type MyTag = {
  label: string
  category: string
  image: string
}

export type Profile = {
  id: number
  name: string
  age: number
  area: string
  image: string
  isNew?: boolean
  online?: "online" | "recent"
  tags: string[]
  bio: string
}

// マイタグのカタログ（ラベル → カテゴリ・画像）
export const tagCatalog: Record<string, MyTag> = {
  甘いもの大好き: {
    label: "甘いもの大好き",
    category: "グルメ・お酒",
    image: "/tags/sweets.png",
  },
  ディズニー好き: {
    label: "ディズニー好き",
    category: "趣味全般",
    image: "/tags/themepark.png",
  },
  漫画が好き: {
    label: "漫画が好き",
    category: "本・マンガ",
    image: "/tags/manga.png",
  },
  寝るの幸せ: {
    label: "寝るの幸せ",
    category: "心と身体",
    image: "/tags/sleep.png",
  },
  ライブ・フェス好き: {
    label: "ライブ・フェス好き",
    category: "音楽",
    image: "/tags/live.png",
  },
  食べることが大好き: {
    label: "食べることが大好き",
    category: "グルメ・お酒",
    image: "/tags/food.png",
  },
  ワイン好き: {
    label: "ワイン好き",
    category: "グルメ・お酒",
    image: "/tags/wine.png",
  },
  旅行好き: {
    label: "旅行好き",
    category: "趣味全般",
    image: "/tags/travel.png",
  },
}

// 各プロフィールに表示するマイタグ（参考画面に合わせた共通セット）
export const defaultMyTags: string[] = [
  "甘いもの大好き",
  "ディズニー好き",
  "漫画が好き",
  "寝るの幸せ",
  "ライブ・フェス好き",
  "食べることが大好き",
  "ワイン好き",
  "旅行好き",
]

export const recommendedProfiles: Profile[] = [
  {
    id: 1,
    name: "美咲",
    age: 42,
    area: "東京",
    image: "/profiles/woman-1.png",
    online: "online",
    tags: ["カフェ巡り", "ワイン", "映画鑑賞"],
    bio: "落ち着いた時間を一緒に過ごせる方を探しています。",
  },
  {
    id: 2,
    name: "由香里",
    age: 38,
    area: "神奈川",
    image: "/profiles/woman-2.png",
    online: "recent",
    isNew: true,
    tags: ["旅行", "料理", "美術館"],
    bio: "年下の方とお話してみたいです。よろしくお願いします。",
  },
  {
    id: 3,
    name: "千夏",
    age: 45,
    area: "東京",
    image: "/profiles/woman-3.png",
    online: "online",
    tags: ["ディナー", "ジャズ", "読書"],
    bio: "大人の余裕を大切にしています。素敵なご縁を。",
  },
  {
    id: 4,
    name: "彩",
    age: 39,
    area: "埼玉",
    image: "/profiles/woman-4.png",
    online: "recent",
    tags: ["散歩", "ファッション", "カフェ"],
    bio: "気軽にメッセージいただけると嬉しいです。",
  },
  {
    id: 5,
    name: "麻衣",
    age: 41,
    area: "千葉",
    image: "/profiles/woman-5.png",
    isNew: true,
    tags: ["お家時間", "紅茶", "音楽"],
    bio: "ゆっくりお話できる関係が理想です。",
  },
]

export const premiumProfiles: Profile[] = [
  {
    id: 6,
    name: "玲奈",
    age: 38,
    area: "東京",
    image: "/profiles/woman-6.png",
    online: "online",
    isNew: true,
    tags: ["アート", "ワイン", "美術館"],
    bio: "感性の合う方とお会いしたいです。",
  },
  {
    id: 7,
    name: "佳子",
    age: 46,
    area: "大阪",
    image: "/profiles/woman-7.png",
    online: "recent",
    isNew: true,
    tags: ["旅行", "グルメ", "写真"],
    bio: "一緒に色々な場所へ行ける方を探しています。",
  },
  {
    id: 8,
    name: "沙織",
    age: 37,
    area: "東京",
    image: "/profiles/woman-8.png",
    online: "online",
    isNew: true,
    tags: ["夜景", "お酒", "ドライブ"],
    bio: "夜のお出かけが好きです。素敵な出会いを。",
  },
  {
    id: 9,
    name: "美咲",
    age: 43,
    area: "兵庫",
    image: "/profiles/woman-1.png",
    isNew: true,
    tags: ["カフェ", "映画", "読書"],
    bio: "穏やかな時間を共有できたら嬉しいです。",
  },
  {
    id: 10,
    name: "由香里",
    age: 40,
    area: "愛知",
    image: "/profiles/woman-2.png",
    isNew: true,
    tags: ["料理", "旅行", "ワイン"],
    bio: "美味しいものを一緒に楽しみましょう。",
  },
]

// 検索グリッド用（参考スクリーンショットに合わせた一覧）
export const searchProfiles: Profile[] = [
  {
    id: 11,
    name: "美咲",
    age: 42,
    area: "東京",
    image: "/profiles/woman-1.png",
    online: "online",
    isNew: true,
    tags: ["カフェ巡り", "ワイン"],
    bio: "落ち着いた時間を一緒に過ごせる方を探しています。",
  },
  {
    id: 12,
    name: "玲奈",
    age: 38,
    area: "東京",
    image: "/profiles/woman-6.png",
    online: "online",
    isNew: true,
    tags: ["アート", "美術館"],
    bio: "感性の合う方とお会いしたいです。",
  },
  {
    id: 13,
    name: "千夏",
    age: 45,
    area: "神奈川",
    image: "/profiles/woman-3.png",
    online: "recent",
    isNew: true,
    tags: ["ジャズ", "読書"],
    bio: "大人の余裕を大切にしています。",
  },
  {
    id: 14,
    name: "佳子",
    age: 46,
    area: "東京",
    image: "/profiles/woman-7.png",
    online: "online",
    tags: ["旅行", "写真"],
    bio: "一緒に色々な場所へ行ける方を探しています。",
  },
  {
    id: 15,
    name: "彩",
    age: 39,
    area: "埼玉",
    image: "/profiles/woman-4.png",
    online: "recent",
    isNew: true,
    tags: ["散歩", "ファッション"],
    bio: "気軽にメッセージいただけると嬉しいです。",
  },
  {
    id: 16,
    name: "麻衣",
    age: 41,
    area: "千葉",
    image: "/profiles/woman-5.png",
    online: "online",
    isNew: true,
    tags: ["紅茶", "音楽"],
    bio: "ゆっくりお話できる関係が理想です。",
  },
  {
    id: 17,
    name: "沙織",
    age: 37,
    area: "東京",
    image: "/profiles/woman-8.png",
    online: "online",
    isNew: true,
    tags: ["夜景", "ドライブ"],
    bio: "夜のお出かけが好きです。",
  },
  {
    id: 18,
    name: "由香里",
    age: 40,
    area: "神奈川",
    image: "/profiles/woman-2.png",
    online: "recent",
    tags: ["料理", "ワイン"],
    bio: "美味しいものを一緒に楽しみましょう。",
  },
  {
    id: 19,
    name: "美咲",
    age: 43,
    area: "東京",
    image: "/profiles/woman-1.png",
    online: "online",
    isNew: true,
    tags: ["映画", "読書"],
    bio: "穏やかな時間を共有できたら嬉しいです。",
  },
  {
    id: 20,
    name: "玲奈",
    age: 44,
    area: "東京",
    image: "/profiles/woman-6.png",
    online: "recent",
    tags: ["アート", "ワイン"],
    bio: "落ち着いたお相手を探しています。",
  },
  {
    id: 21,
    name: "千夏",
    age: 47,
    area: "東京",
    image: "/profiles/woman-3.png",
    online: "online",
    isNew: true,
    tags: ["ディナー", "ジャズ"],
    bio: "素敵なご縁がありますように。",
  },
  {
    id: 22,
    name: "彩",
    age: 36,
    area: "埼玉",
    image: "/profiles/woman-4.png",
    online: "online",
    tags: ["カフェ", "ファッション"],
    bio: "まずは気軽にお話できたら嬉しいです。",
  },
]
