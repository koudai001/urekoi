'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileDetailActions } from './profile-detail-actions'
import { ProfileDetailCard } from './profile-detail-card'
import { ProfileTagList } from './profile-tag-list'
import type { ProfileDetail } from '@/generated/urekoiAPI.schemas'

export function ProfileDetailModal({
  profile,
  isDirectAccess = false,
}: {
  profile: ProfileDetail
  // 直リンク・リロード時のフォールバック表示かどうか。trueなら戻り先の履歴が無いのでpushする
  isDirectAccess?: boolean
}) {
  const router = useRouter()

  const onClose = useCallback(() => {
    // メモ化しておかないとEscキーで閉じる時に無限ループする
    if (isDirectAccess) {
      router.push('/search/all')
    } else {
      router.back()
    }
  }, [router, isDirectAccess])

  // Escキーで閉じる & 背景スクロール固定
  useEffect(() => {
    // Escキーで閉じる
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // 背景スクロールを固定する
    document.body.style.overflow = 'hidden'
    // クリーンアップ
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [router, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/50 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${profile.nickname}さんのプロフィール`}
    >
      <div
        className="flex w-full max-w-3xl flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン・お気に入り・その他 */}
        <ProfileDetailActions onClose={onClose} />

        {/* カード + マイタグ */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <ProfileDetailCard profile={profile} />
          <ProfileTagList tags={profile.tags ?? []} />
        </div>
      </div>
    </div>
  )
}
