'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { SearchCard } from '@/components/search-card'
import { PromoCard } from '@/components/promo-card'
import { ProfileDetailModal } from '@/components/profile-detail-modal'
import { searchProfiles, type Profile } from '@/lib/profiles'
import { ThumbsUp, Search, SlidersHorizontal, ArrowDownUp } from 'lucide-react'
import { logout } from '@/actions/auth'

export default function Page() {
  // 参考レイアウト：1行目の5枚目にプロモカードを差し込む
  const promoIndex = 4
  const [selected, setSelected] = useState<Profile | null>(null)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="relative flex-1">
        {/* ヘッダー */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-5 py-4 backdrop-blur sm:px-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            検索
          </h1>

          <div className="flex items-center gap-3">
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ログアウト
              </button>
            </form>
            <div className="relative hidden items-center sm:flex">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="お相手を検索"
                className="h-10 w-56 rounded-full border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none ring-ring/30 placeholder:text-muted-foreground focus:ring-2"
              />
            </div>

            <button className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <ThumbsUp className="h-4 w-4" />
              無料 × 8
            </button>
          </div>
        </header>

        {/* グリッド */}
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {searchProfiles.flatMap((profile, i) =>
              i === promoIndex
                ? [
                    <PromoCard key="promo" />,
                    <SearchCard
                      key={profile.id}
                      profile={profile}
                      onSelect={setSelected}
                    />,
                  ]
                : [
                    <SearchCard
                      key={profile.id}
                      profile={profile}
                      onSelect={setSelected}
                    />,
                  ],
            )}
          </div>
        </div>

        {/* フローティングバー */}
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur lg:pl-[16rem]">
            <button
              aria-label="絞り込み"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <span className="px-3 font-heading text-lg font-bold text-foreground">
              9999+
            </span>
            <button
              aria-label="並び替え"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent"
            >
              <ArrowDownUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      <ProfileDetailModal
        profile={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
