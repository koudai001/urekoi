export type ChatMessage = {
  id: number
  from: "me" | "them"
  text: string
  time: string
  read?: boolean
}

export type Conversation = {
  id: number
  name: string
  age: number
  area: string
  image: string
  date: string
  preview: string
  status?: "未返信" | "NEW"
  // 「話題になりそうな共通点」チップ
  commonPoints: string[]
  // チャット内に並ぶ写真サムネ
  photos: string[]
  messages: { date: string; items: ChatMessage[] }[]
}

// マッチング済みでまだメッセージのやり取りがない相手（上部の横スクロール）
export type Match = {
  id: number
  name: string
  age: number
  area: string
  image: string
  online?: boolean
  unread?: boolean
}

export const matches: Match[] = [
  { id: 101, name: "りな", age: 28, area: "埼玉", image: "/profiles/woman-5.png", online: true },
  { id: 102, name: "あや", age: 24, area: "東京", image: "/profiles/woman-3.png" },
  { id: 103, name: "みく", age: 20, area: "千葉", image: "/profiles/woman-8.png", unread: true },
  { id: 104, name: "ゆい", age: 26, area: "東京", image: "/profiles/woman-6.png" },
  { id: 105, name: "さき", age: 30, area: "神奈川", image: "/profiles/woman-2.png" },
  { id: 106, name: "なな", age: 27, area: "東京", image: "/profiles/woman-4.png", online: true },
]

export const conversations: Conversation[] = [
  {
    id: 1,
    name: "ひ",
    age: 24,
    area: "東京",
    image: "/profiles/woman-1.png",
    date: "11 時間前",
    preview: "返事遅くなってすみま...",
    status: "未返信",
    commonPoints: ["東京", "大学卒", "一人暮らし", "吸わない"],
    photos: [
      "/profiles/woman-1.png",
      "/profiles/woman-3.png",
      "/tags/food.png",
      "/tags/wine.png",
      "/tags/travel.png",
      "/tags/food.png",
    ],
    messages: [
      {
        date: "6/12(金)",
        items: [
          {
            id: 1,
            from: "me",
            text: "マッチ嬉しいです😊 めっちゃ写真の雰囲気好きですよろしくお願いします〜！",
            time: "21:52",
            read: true,
          },
        ],
      },
      {
        date: "6/22(月)",
        items: [
          {
            id: 2,
            from: "them",
            text: "返事遅くなってすみません！もしまだ大丈夫ならお話したいです、、！",
            time: "23:05",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "り",
    age: 26,
    area: "埼玉",
    image: "/profiles/woman-2.png",
    date: "2026年6月21日",
    preview: "行きたいカフェとかイ...",
    status: "未返信",
    commonPoints: ["埼玉", "カフェ巡り", "猫好き", "お酒好き"],
    photos: [
      "/profiles/woman-2.png",
      "/tags/sweets.png",
      "/tags/wine.png",
      "/tags/food.png",
    ],
    messages: [
      {
        date: "6/20(土)",
        items: [
          {
            id: 1,
            from: "me",
            text: "はじめまして！プロフィール拝見しました、カフェ巡り好きなんですね☕️",
            time: "19:30",
            read: true,
          },
        ],
      },
      {
        date: "6/21(日)",
        items: [
          {
            id: 2,
            from: "them",
            text: "ありがとうございます！行きたいカフェとかいっぱいあるので一緒に行けたら嬉しいです🍰",
            time: "12:10",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "な",
    age: 25,
    area: "埼玉",
    image: "/profiles/woman-4.png",
    date: "2026年6月17日",
    preview: "遅くなりました（;;）...",
    status: "未返信",
    commonPoints: ["埼玉", "映画好き", "インドア", "甘党"],
    photos: ["/profiles/woman-4.png", "/tags/sweets.png", "/tags/manga.png"],
    messages: [
      {
        date: "6/15(月)",
        items: [
          {
            id: 1,
            from: "me",
            text: "マッチありがとうございます！映画よく見られるんですか？",
            time: "20:00",
            read: true,
          },
        ],
      },
      {
        date: "6/17(水)",
        items: [
          {
            id: 2,
            from: "them",
            text: "遅くなりました（;;）家でよく映画見てます！おすすめあったら教えてください〜",
            time: "22:40",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "N",
    age: 25,
    area: "東京",
    image: "/profiles/woman-6.png",
    date: "2026年6月16日",
    preview: "私もある程度やり取り...",
    status: "未返信",
    commonPoints: ["東京", "アート好き", "ワイン", "夜型"],
    photos: ["/profiles/woman-6.png", "/tags/wine.png", "/tags/live.png"],
    messages: [
      {
        date: "6/16(火)",
        items: [
          {
            id: 1,
            from: "me",
            text: "こんばんは！美術館巡り好きなの素敵ですね🎨",
            time: "21:15",
            read: true,
          },
          {
            id: 2,
            from: "them",
            text: "私もある程度やり取りしてから会えたら安心なタイプです😌 ゆっくりお話しましょう！",
            time: "23:48",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "ぴ",
    age: 24,
    area: "埼玉",
    image: "/profiles/woman-8.png",
    date: "2026年6月15日",
    preview: "東京ですかねー！",
    status: "NEW",
    commonPoints: ["埼玉", "ライブ好き", "お酒好き", "アクティブ"],
    photos: ["/profiles/woman-8.png", "/tags/live.png", "/tags/travel.png"],
    messages: [
      {
        date: "6/15(月)",
        items: [
          {
            id: 1,
            from: "me",
            text: "はじめまして！ライブよく行かれるんですね🎤 どの辺に住んでるんですか？",
            time: "18:20",
            read: true,
          },
          {
            id: 2,
            from: "them",
            text: "東京ですかねー！フェスとかもよく行きます〜",
            time: "18:45",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    name: "あ",
    age: 28,
    area: "東京",
    image: "/profiles/woman-7.png",
    date: "2026年6月15日",
    preview: "週末は空いてますか？",
    status: "未返信",
    commonPoints: ["東京", "旅行好き", "グルメ", "写真"],
    photos: ["/profiles/woman-7.png", "/tags/travel.png", "/tags/food.png"],
    messages: [
      {
        date: "6/15(月)",
        items: [
          {
            id: 1,
            from: "me",
            text: "旅行の写真どれも素敵ですね✈️ どこが一番よかったですか？",
            time: "13:00",
            read: true,
          },
          {
            id: 2,
            from: "them",
            text: "ありがとうございます！週末は空いてますか？もしよければお茶でも☕️",
            time: "15:30",
          },
        ],
      },
    ],
  },
]
