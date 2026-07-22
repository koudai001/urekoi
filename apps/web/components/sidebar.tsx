'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Heart,
  Search,
  Sparkles,
  CalendarDays,
  Hash,
  ThumbsUp,
  Footprints,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LikeNavItem } from '@/components/likes/like-nav-item'
import { LogoutButton } from '@/components/logout-button'

type NavItem = {
  label: string
  icon: React.ElementType
  badge?: number
  href?: string
}

const mainNav: NavItem[] = [
  { label: '本日限定', icon: CalendarDays },
  { label: 'おすすめ', icon: LayoutGrid },
  { label: '検索', icon: Search, href: '/search/all' },
  { label: '新着', icon: Sparkles },
  { label: 'マイタグ', icon: Hash },
]

const bottomNav: NavItem[] = [
  { label: 'イイネ', icon: ThumbsUp, href: '/likes/from-partner-card' },
  { label: '足あと', icon: Footprints },
  { label: 'メッセージ', icon: MessageCircle, badge: 12, href: '/messages' },
  { label: 'マイページ', icon: UserRound, badge: 79, href: '/myprofile' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold tracking-tight text-primary">
            熟恋
          </span>
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground">
            UREKOI
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {mainNav.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            active={isActive(pathname, item.href)}
          />
        ))}

        <div className="my-3 border-t border-border" />

        {bottomNav.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            active={isActive(pathname, item.href)}
          />
        ))}
      </nav>

      <div className="px-3 pb-6">
        <LogoutButton />
      </div>
    </aside>
  )
}

// hrefが現在のパスと一致(ネストしたパス含む)しているかを判定する
function isActive(pathname: string, href?: string) {
  if (!href) return false
  return pathname === href || pathname.startsWith(href + '/')
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  const className = cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
  )

  const content =
    item.label === 'イイネ' ? (
      <LikeNavItem />
    ) : (
      <>
        <span className="relative">
          <Icon className="h-5 w-5" />
          {item.badge ? (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          ) : null}
        </span>
        {item.label}
      </>
    )

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return <button className={className}>{content}</button>
}
