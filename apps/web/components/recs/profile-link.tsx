import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

// カード上からプロフィール詳細へ移動する導線
export function ProfileLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="プロフィールを見る"
      className="absolute bottom-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <ArrowUp className="h-6 w-6" strokeWidth={3} />
    </Link>
  )
}
