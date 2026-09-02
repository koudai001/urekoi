import Link from 'next/link'
import { cn } from '@/lib/utils'

type TabNavigationItem = {
  key: string
  label: React.ReactNode
  active: boolean
  href?: string
}

// 画面上部の候補種別を、選択中の下線付き2列タブとして表示する
export function TabNavigation({
  ariaLabel,
  items,
}: {
  ariaLabel: string
  items: [TabNavigationItem, TabNavigationItem]
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="grid h-16 shrink-0 grid-cols-2 border-b border-swipe-border bg-swipe-background"
    >
      {items.map((item) => {
        const className = cn(
          'flex items-center justify-center border-b-2 text-base font-semibold transition-colors',
          item.active
            ? 'border-swipe-accent text-swipe-accent'
            : 'border-transparent text-swipe-muted-foreground',
        )

        return item.href ? (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={cn(className, 'hover:text-swipe-foreground')}
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.key} className={className}>
            {item.label}
          </span>
        )
      })}
    </nav>
  )
}
