'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, ThumbsUp, MessageCircle, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReceivedLikes } from '@/components/likes/use-received-likes'

type NavItem = {
  label: string
  icon: React.ElementType
  badge?: number
  href: string
}

const navItems: NavItem[] = [
  { label: 'ホーム', icon: House, href: '/search/all' },
  { label: 'イイネ', icon: ThumbsUp, href: '/likes/from-partner-card' },
  { label: 'メッセージ', icon: MessageCircle, badge: 12, href: '/messages' },
  { label: 'マイページ', icon: UserRound, badge: 79, href: '/myprofile' },
]

// SP用の下部固定ナビ。PC用のSidebarと出す情報は同じで、レイアウトだけ縦積みにしたもの
export function SpBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-center justify-around border-t border-border bg-sidebar lg:hidden">
      {navItems.map((item) => (
        <NavButton
          key={item.label}
          item={item}
          isActive={
            pathname === item.href || pathname.startsWith(item.href + '/')
          }
        />
      ))}
    </nav>
  )
}

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const likesBadge = useLikesBadge()
  const badge = item.label === 'イイネ' ? likesBadge : item.badge

  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center gap-1 text-[10px] font-medium',
        isActive ? 'text-accent-foreground' : 'text-muted-foreground',
      )}
    >
      <span className="relative">
        <item.icon className="h-6 w-6" />
        {badge ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      {item.label}
    </Link>
  )
}

// 「イイネ」の新着件数バッジ(Sidebarと同じuseReceivedLikesを使う)
function useLikesBadge() {
  const { data } = useReceivedLikes()
  return data?.total ?? 0
}
