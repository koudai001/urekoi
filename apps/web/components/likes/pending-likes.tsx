'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LikeEmptyState } from '@/components/likes/like-empty-state'
import type { PendingLikesResponse } from '@/generated/urekoiAPI.schemas'

export function PendingLikes({
  pendingLikes,
}: {
  pendingLikes: PendingLikesResponse
}) {
  const likes = pendingLikes.profiles

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-swipe-background">
      <div className="flex shrink-0 items-center justify-center gap-7 px-5 pb-4 pt-4">
        <span className="border-b-2 border-swipe-accent pb-2 text-base font-extrabold text-swipe-foreground">
          {pendingLikes.total}個のLike
        </span>
        <span className="h-4 w-px bg-swipe-border" />
        <span className="pb-2 text-base font-semibold text-swipe-muted-foreground">
          Likeした人
        </span>
      </div>

      {likes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 pb-5">
          <LikeEmptyState />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {likes.map((like, index) => (
              <Link
                key={like.user_id}
                href={`/likes/pending/${like.user_id}`}
                aria-label={`${like.nickname ?? ''}さんのプロフィールを見る`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-swipe-surface"
              >
                <Image
                  src={like.photos?.[0] || '/placeholder.svg'}
                  alt={`${like.nickname ?? ''}さんのプロフィール画像`}
                  fill
                  sizes="(max-width: 448px) 50vw, 204px"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  className="object-cover transition-transform duration-300 group-active:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
                  <span className="flex items-baseline gap-1.5 text-white">
                    <span className="truncate text-[15px] font-extrabold">
                      {like.nickname}
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold">
                      {like.age}
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
