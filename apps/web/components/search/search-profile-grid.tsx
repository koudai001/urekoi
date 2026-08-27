'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import type {
  PartnerSearchResponse,
  ProfileDetail,
} from '@/generated/urekoiAPI.schemas'
import { type SearchFeed, useSearchProfiles } from '@/hooks/use-search-profiles'
import { dummyProfileImageFor } from '@/lib/dummy-profile-image'
import { cn } from '@/lib/utils'

// Server Componentが取得した1ページ目を表示し、必要な場合だけ続きを取得する
export function SearchProfileGrid({
  feed,
  initialPage,
}: {
  feed: SearchFeed
  initialPage: PartnerSearchResponse
}) {
  const { profiles, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSearchProfiles({ feed, initialPage })

  return (
    <main className="relative flex min-h-0 flex-1 flex-col bg-swipe-background">
      {/* タブ遷移後の1ページ目もServer Componentで取得する */}
      <nav
        aria-label="検索候補の並び順"
        className="grid h-16 shrink-0 grid-cols-2 border-b border-swipe-border bg-swipe-background"
      >
        <FeedTab
          href="/search?feed=recommended"
          active={feed === 'recommended'}
        >
          おすすめ
        </FeedTab>
        <FeedTab href="/search?feed=newest" active={feed === 'newest'}>
          新着順
        </FeedTab>
      </nav>

      {/* 取得済みの全ページを連続した2列グリッドとして表示する */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {profiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile, index) => (
              <ProfileGridCard
                key={profile.user_id}
                profile={profile}
                priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-swipe-muted-foreground">
            表示できるお相手がいません
          </p>
        )}

        {/* 次カーソルがある場合だけ、ユーザー操作で次ページを取得する */}
        {hasNextPage && (
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className="mx-auto mb-16 mt-6 block cursor-pointer rounded-full border border-swipe-border bg-swipe-surface px-6 py-2 text-sm font-semibold text-swipe-foreground transition hover:border-swipe-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? '読み込み中...' : 'さらに表示'}
          </button>
        )}

        {error && (
          <p className="mb-16 mt-6 text-center text-sm text-swipe-accent">
            続きを読み込めませんでした
          </p>
        )}
      </div>

      {/* 絞り込み条件は次の実装で接続する */}
      <button
        type="button"
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-swipe-accent px-6 py-3 text-base font-bold text-swipe-foreground shadow-lg transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swipe-accent"
      >
        <Filter className="size-5" aria-hidden="true" />
        絞り込む
      </button>
    </main>
  )
}

// 選択中の候補種別を下線とアクセントカラーで示す
function FeedTab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-center border-b-2 text-base font-semibold transition-colors',
        active
          ? 'border-swipe-accent text-swipe-accent'
          : 'border-transparent text-swipe-muted-foreground hover:text-swipe-foreground',
      )}
    >
      {children}
    </Link>
  )
}

// 写真と検索判断に必要なプロフィール概要をコンパクトに表示する
function ProfileGridCard({
  profile,
  priority,
}: {
  profile: ProfileDetail
  priority: boolean
}) {
  const imageUrl =
    profile.images.find((image) => image.url)?.url ??
    dummyProfileImageFor(profile.user_id)

  return (
    <Link
      href={`/search/${profile.user_id}`}
      aria-label={`${profile.nickname}さんのプロフィールを見る`}
      className="overflow-hidden rounded-2xl bg-swipe-surface shadow-sm ring-1 ring-swipe-border transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-swipe-surface">
        <Image
          src={imageUrl}
          alt={`${profile.nickname}さんの写真`}
          fill
          sizes="(max-width: 448px) 50vw, 216px"
          className="object-cover"
          priority={priority}
        />
      </div>

      <div className="space-y-1 px-3 py-2">
        <p className="flex min-w-0 items-baseline gap-1 text-swipe-foreground">
          <span className="shrink-0 text-base font-bold">{profile.age}歳</span>
          <span className="truncate text-sm font-semibold">
            {profile.prefecture}
          </span>
        </p>
        <p className="truncate text-sm text-swipe-muted-foreground">
          {profile.occupation || '職業未設定'}
        </p>
        <p className="truncate text-sm text-swipe-muted-foreground">
          {profile.bio || 'よろしくお願いします'}
        </p>
      </div>
    </Link>
  )
}
