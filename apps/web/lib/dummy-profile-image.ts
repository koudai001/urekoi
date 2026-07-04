// プロフィール画像アップロード機能が未実装のため、APIが画像なし(空文字)を返した時にプロフィールIDに応じてダミー画像を割り当てる
const dummyProfileImages = [
  '/profiles/woman-1.png',
  '/profiles/woman-2.png',
  '/profiles/woman-3.png',
  '/profiles/woman-4.png',
  '/profiles/woman-5.png',
  '/profiles/woman-6.png',
  '/profiles/woman-7.png',
]

// idを元に決定的に選ぶ(Math.randomだとSSRとクライアントで結果が変わりhydrationエラーになるため)
export function dummyProfileImageFor(id: number) {
  return dummyProfileImages[id % dummyProfileImages.length]
}
