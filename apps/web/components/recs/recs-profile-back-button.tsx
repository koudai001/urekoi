'use client'

import { useRouter } from 'next/navigation'
import { ArrowDown } from 'lucide-react'

// Recs詳細カードを閉じて、遷移元の一覧へ戻るボタン
export function RecsProfileBackButton({ returnHref }: { returnHref: string }) {
  const router = useRouter()

  const handleClick = () => {
    // ブラウザの履歴がある場合は戻る、ない場合は一覧ページへ遷移する
    if (window.history.length > 1) router.back()
    else router.replace(returnHref)
  }

  return (
    <button
      type="button"
      aria-label="一覧へ戻る"
      onClick={handleClick}
      className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
    >
      <ArrowDown className="h-5 w-5" strokeWidth={3} />
    </button>
  )
}
