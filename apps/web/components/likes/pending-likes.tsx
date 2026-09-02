'use client'

import { LikeEmptyState } from '@/components/likes/like-empty-state'
import { ReturnLikeFromList } from '@/components/likes/return-like-from-list'
import { UserListItem } from '@/components/likes/user-list-item'
import { RouteLoading } from '@/components/ui/route-loading'
import { useReceivedLikes } from '@/hooks/use-received-likes'

export function PendingLikes() {
  const { data: currentLikes, isPending } = useReceivedLikes()

  if (isPending || !currentLikes) return <RouteLoading />

  const likes = currentLikes.profiles

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-swipe-background">
      {likes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 pb-5">
          <LikeEmptyState />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {likes.map((profile, index) => (
            <UserListItem
              key={profile.user_id}
              profile={profile}
              href={`/likes/pending/${profile.user_id}`}
              priority={index < 3}
              actions={
                <ReturnLikeFromList
                  userId={profile.user_id}
                  nickname={profile.nickname}
                  age={profile.age}
                />
              }
            />
          ))}
        </div>
      )}
    </main>
  )
}
