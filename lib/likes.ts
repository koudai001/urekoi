export type LikeProfile = {
  id: number
  name: string
  age: number
  area: string
  online?: "online" | "recent"
  photos: string[]
}

// 相手から受け取った「いいね」一覧（各相手は複数枚の写真を持つ）
export const receivedLikes: LikeProfile[] = [
  {
    id: 101,
    name: "A",
    age: 24,
    area: "東京",
    online: "recent",
    photos: [
      "/profiles/woman-1.png",
      "/profiles/woman-3.png",
      "/profiles/woman-5.png",
      "/profiles/woman-7.png",
    ],
  },
  {
    id: 102,
    name: "M",
    age: 27,
    area: "神奈川",
    online: "online",
    photos: ["/profiles/woman-2.png", "/profiles/woman-4.png", "/profiles/woman-6.png"],
  },
  {
    id: 103,
    name: "Y",
    age: 23,
    area: "千葉",
    online: "recent",
    photos: ["/profiles/woman-8.png", "/profiles/woman-5.png"],
  },
  {
    id: 104,
    name: "S",
    age: 29,
    area: "埼玉",
    online: "online",
    photos: [
      "/profiles/woman-6.png",
      "/profiles/woman-2.png",
      "/profiles/woman-7.png",
      "/profiles/woman-1.png",
    ],
  },
  {
    id: 105,
    name: "K",
    age: 26,
    area: "東京",
    online: "recent",
    photos: ["/profiles/woman-4.png", "/profiles/woman-3.png", "/profiles/woman-8.png"],
  },
]
