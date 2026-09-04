'use client'

import { Filter } from 'lucide-react'
import { type SearchFeed, useSearchProfiles } from '@/hooks/use-search-profiles'
import { ProfileGrid } from './profile-grid'
import { TabNavigation } from './tab-navigation'
import { RouteLoading } from '../ui/route-loading'

// 検索候補を表示し、必要な場合だけ続きを取得する
export function SearchProfileGrid({ feed }: { feed: SearchFeed }) {
  const {
    profiles,
    error,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    fetchNextPage,
  } = useSearchProfiles({ feed })

  if (isPending) return <RouteLoading />

  return (
    <main className="relative flex min-h-0 flex-1 flex-col bg-background">
      <TabNavigation
        ariaLabel="検索候補の並び順"
        items={[
          {
            key: 'recommended',
            label: 'おすすめ',
            href: '/search?feed=recommended',
            active: feed === 'recommended',
          },
          {
            key: 'newest',
            label: '新着順',
            href: '/search?feed=newest',
            active: feed === 'newest',
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {profiles.length > 0 ? (
          <ProfileGrid profiles={profiles} hrefPrefix="/search" />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            表示できるお相手がいません
          </p>
        )}

        {/* 次カーソルがある場合だけ、ユーザー操作で次ページを取得する */}
        {hasNextPage && (
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className="mx-auto mb-16 mt-6 block cursor-pointer rounded-full border border-border bg-card px-6 py-2 text-sm font-semibold text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? '読み込み中...' : 'さらに表示'}
          </button>
        )}

        {error && (
          <p className="mb-16 mt-6 text-center text-sm text-primary">
            続きを読み込めませんでした
          </p>
        )}
      </div>

      {/* 絞り込み条件 */}
      <button
        type="button"
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-foreground shadow-lg transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Filter className="size-5" aria-hidden="true" />
        絞り込む
      </button>
    </main>
  )
}
