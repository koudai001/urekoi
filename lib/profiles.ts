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
