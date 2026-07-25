'use client'

import { useState } from 'react'
import { SwipeCard } from './swipe-card-wrapper'
import { showMatchToast } from '@/components/likes/match-toast'
import { showSkipToast } from '@/components/likes/skip-toast'
import { showLikeToast } from '@/components/likes/like-toast'
import { sendLike } from '@/actions/likes'
import { sendSkip } from '@/actions/skips'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

// スワイプ候補一覧をindexで管理し、いいね/スキップの度に次の候補へ進める
export function RecsDeck({ profiles }: { profiles: ProfileDetail[] }) {
  // 現在表示中のカードのindex
  const [index, setIndex] = useState(0)
  const current = profiles[index]
  const done = index >= profiles.length

  const handleSwipe = async (dir: 'like' | 'skip') => {
    if (dir === 'like') {
      const result = await sendLike(current.user_id ?? 0)
      if (result.success) {
        if (result.matched) {
          showMatchToast(current.nickname ?? '', current.age ?? 0)
        } else {
          showLikeToast(current.nickname ?? '')
        }
      }
    } else {
      await sendSkip(current.user_id ?? 0)
      showSkipToast(current.nickname ?? '')
    }
    setIndex((i) => i + 1)
  }

  if (done) {
    return <p className="text-sm text-swipe-muted-foreground">候補がいません</p>
  }

  return (
    <SwipeCard
      key={current.user_id}
      profile={current}
      nextProfile={profiles[index + 1]}
      onSwipe={handleSwipe}
    />
  )
}
