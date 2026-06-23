"use client"

import {
  LayoutGrid,
  Heart,
  Search,
  Sparkles,
  CalendarDays,
  MessageCircleQuestion,
  Hash,
  ThumbsUp,
  Footprints,
  MessageCircle,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  icon: React.ElementType
  badge?: number
  active?: boolean
}

const mainNav: NavItem[] = [
  { label: "本日限定", icon: CalendarDays },
  { label: "おすすめ", icon: LayoutGrid },
  { label: "本音マッチ", icon: Heart },
  { label: "検索", icon: Search },
  { label: "イベント", icon: Sparkles },
  { label: "クエスチョン", icon: MessageCircleQuestion },
  { label: "マイタグ", icon: Hash },
]

const bottomNav: NavItem[] = [
  { label: "イイネ", icon: ThumbsUp, badge: 5 },
  { label: "足あと", icon: Footprints },
  { label: "メッセージ", icon: MessageCircle, badge: 12 },
  { label: "マイページ", icon: UserRound, badge: 79 },
]

export function Sidebar({ active = "検索" }: { active?: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-heading text-2xl font-bold tracking-tight text-primary">
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
            item={{ ...item, active: item.label === active }}
          />
        ))}

        <div className="my-3 border-t border-border" />

        {bottomNav.map((item) => (
          <NavButton
            key={item.label}
            item={{ ...item, active: item.label === active }}
          />
        ))}
      </nav>
    </aside>
  )
}

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <button
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        item.active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
      )}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {item.badge ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        ) : null}
      </span>
      {item.label}
    </button>
  )
}
