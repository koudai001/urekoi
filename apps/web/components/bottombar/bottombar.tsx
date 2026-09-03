'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, MessageCircle, Search, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const DISPLAY_PATHS = new Set([
  '/search',
  '/likes/pending',
  '/messages',
  '/myprofile',
])

const navigationItems = [
  {
    href: '/search',
    label: '探す',
    icon: Search,
    matches: (path: string) => path.startsWith('/search'),
  },
  {
    href: '/likes/pending',
    label: 'いいね',
    icon: Heart,
    matches: (path: string) => path.startsWith('/likes'),
  },
  {
    href: '/messages',
    label: 'メッセージ',
    icon: MessageCircle,
    matches: (path: string) => path.startsWith('/messages'),
  },
  {
    href: '/myprofile',
    label: 'マイページ',
    icon: UserRound,
    matches: (path: string) => path.startsWith('/myprofile'),
  },
]

export function BottomBar() {
  const pathname = usePathname()

  // 一覧・ホーム画面だけにナビゲーションを表示し、詳細画面ではコンテンツへ集中させる
  if (!DISPLAY_PATHS.has(pathname)) return null

  return (
    <nav
      aria-label="メインナビゲーション"
      className="bg-swipe-background px-3 pb-3 pt-2"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around rounded-2xl border border-swipe-border bg-swipe-sidebar shadow-lg">
        {navigationItems.map(({ href, label, icon: Icon, matches }) => {
          const active = matches(pathname)

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'text-swipe-accent'
                  : 'text-swipe-muted-foreground hover:text-swipe-foreground',
              )}
            >
              <Icon className="size-6" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
