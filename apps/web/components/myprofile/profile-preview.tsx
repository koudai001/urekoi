'use client'

import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { ProfileEditNav } from './profile-edit-nav'
import { PreviewDetailButton } from './preview-detail-button'
import { ProfileViewer } from './profile-viewer'
import { SwipeCard } from '@/components/recs/swipe-card'
import { CardContainer } from '@/components/ui/card-container'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'
import { cn } from '@/lib/utils'

type PreviewView = 'card' | 'detail'

export function ProfilePreview({ profile }: { profile: ProfileDetail }) {
  const [view, setView] = useState<PreviewView>('card')

  return (
    <CardContainer className="!h-full !max-w-none !aspect-auto">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-swipe-sidebar">
        <ProfileEditNav active="preview" />

        <div className="relative min-h-0 flex-1">
          {view === 'card' ? (
            <SwipeCard profile={profile} priority>
              <PreviewDetailButton onClick={() => setView('detail')} />
            </SwipeCard>
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              <ProfileViewer profile={profile} />
              <MyProfilePreviewBackButton
                onClick={() => setView('card')}
                className="absolute right-4 top-4 z-20"
              />
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  )
}

function MyProfilePreviewBackButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label="カードへ戻る"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        className,
      )}
    >
      <ArrowDown className="h-5 w-5" strokeWidth={3} />
    </button>
  )
}
