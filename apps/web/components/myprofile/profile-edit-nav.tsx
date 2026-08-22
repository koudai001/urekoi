import Link from 'next/link'
import { cn } from '@/lib/utils'

type ProfileEditTab = 'edit' | 'preview'

const tabs: { value: ProfileEditTab; label: string; href: string }[] = [
  { value: 'edit', label: '編集', href: '/myprofile/edit' },
  { value: 'preview', label: 'プレビュー', href: '/myprofile/preview' },
]

export function ProfileEditNav({ active }: { active: ProfileEditTab }) {
  return (
    <nav
      aria-label="プロフィール編集"
      className="flex h-[8%] shrink-0 border-b border-swipe-border"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          aria-current={active === tab.value ? 'page' : undefined}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center text-xl transition-colors',
            active === tab.value
              ? 'border-b-2 border-swipe-accent font-bold text-swipe-accent'
              : 'font-semibold text-swipe-muted-foreground hover:text-swipe-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
