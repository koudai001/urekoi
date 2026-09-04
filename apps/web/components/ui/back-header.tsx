import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackHeader({
  href,
  onBack,
  title,
}: {
  href?: string
  onBack?: () => void
  title?: string
}) {
  return (
    <header className="flex h-16 items-center gap-3 px-6">
      {href ? (
        <Link
          href={href}
          aria-label="前の画面へ戻る"
          className="flex size-10 items-center justify-center"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          aria-label="前の画面へ戻る"
          onClick={onBack}
          className="flex size-10 items-center justify-center"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </button>
      )}
      {title && <h1 className="text-lg font-semibold">{title}</h1>}
    </header>
  )
}
