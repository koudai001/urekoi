'use client'

import { ArrowUp } from 'lucide-react'

export function PreviewDetailButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="プロフィール詳細を見る"
      onClick={onClick}
      className="absolute bottom-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <ArrowUp className="h-6 w-6" strokeWidth={3} />
    </button>
  )
}
