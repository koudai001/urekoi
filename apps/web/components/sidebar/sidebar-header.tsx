'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMyProfile } from '@/hooks/use-my-profile'

// サイドバー上部の自分用ヘッダー。プロフィール画像は自分のプロフィールキャッシュから表示する。
export function SidebarHeader() {
  const { data } = useMyProfile()
  const pathname = usePathname()
  const profileImage = data?.images?.[0]?.url
  const href = pathname?.startsWith('/myprofile') ? '/recs' : '/myprofile'
  const label = pathname?.startsWith('/myprofile') ? '探す' : 'マイページ'
  const ariaLabel = href === '/recs' ? '探すを開く' : 'マイページを開く'

  return (
    <div
      className="flex items-center gap-4 px-5 py-5"
      style={{
        background:
          'linear-gradient(135deg, oklch(0.3 0.14 338), oklch(0.2 0.1 330))',
      }}
    >
      <Link
        href={href}
        aria-label={ariaLabel}
        className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-swipe-surface ring-1 ring-white/15 transition-all duration-200 ease-out hover:scale-[1.03] hover:opacity-90 active:scale-[0.98] active:opacity-80"
      >
        <Image
          src={profileImage || '/placeholder.svg'}
          alt="自分のプロフィール画像"
          fill
          loading="eager"
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
          sizes="56px"
        />
      </Link>
      <span className="flex-1 text-lg font-bold text-swipe-foreground">
        {label}
      </span>
    </div>
  )
}
