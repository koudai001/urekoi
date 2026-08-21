'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Heart, MessageCircle, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    href: '/recs',
    label: '探す',
    icon: Flame,
    matches: (path: string) => path.startsWith('/recs'),
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

  return (
    <nav
      aria-label="メインナビゲーション"
      className="bg-swipe-background px-3 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
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
