'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PhotoViewer } from '@/components/myprofile/photo-viewer'
import type { ProfileDetail as ProfileDetailData } from '@/generated/urekoiAPI.schemas'

// 相手プロフィールの詳細表示を、遷移元ごとの操作に依存しない形で共通化する
export function ProfileDetail({
  profile,
  returnHref,
}: {
  profile: ProfileDetailData
  returnHref: string
}) {
  const router = useRouter()

  // 一覧からの遷移では履歴を戻してRouter Cacheを優先し、履歴がなければ一覧へ戻す
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.replace(returnHref)
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col bg-swipe-background">
      {/* 遷移元へ戻る操作の隣に、表示中の相手の名前を示す */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-swipe-border px-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="一覧へ戻る"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-swipe-foreground transition hover:bg-swipe-surface"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </button>
        <p className="truncate text-lg font-bold text-swipe-foreground">
          {profile.nickname}
        </p>
      </header>

      {/* 写真から詳細情報までを一続きにし、ページ全体を縦にスクロールする */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="aspect-square w-full shrink-0">
          <PhotoViewer
            images={profile.images}
            alt={`${profile.nickname}さんの写真`}
            full
            priority
          />
        </div>

        <div className="rounded-t-3xl bg-swipe-sidebar px-5 pb-32 pt-6">
          <h1 className="text-3xl font-extrabold text-swipe-foreground">
            {profile.nickname}
          </h1>
          <p className="mt-2 text-lg font-medium text-swipe-muted-foreground">
            {profile.age}歳{profile.prefecture && ` ・ ${profile.prefecture}`}
          </p>

          {/* 自己紹介は改行を維持し、未設定の場合も空欄にしない */}
          <section className="mt-8">
            <h2 className="border-b border-swipe-border pb-2 text-xl font-bold text-swipe-foreground">
              自己紹介
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-swipe-foreground">
              {profile.bio || '未設定'}
            </p>
          </section>

          {/* タグを除いた基本属性だけを2列で表示する */}
          <section className="mt-8">
            <h2 className="border-b border-swipe-border pb-2 text-xl font-bold text-swipe-foreground">
              詳細情報
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
              <DetailItem label="職業" value={profile.occupation} />
              <DetailItem label="出身地" value={profile.hometown} />
              <DetailItem label="血液型" value={profile.blood_type} />
              <DetailItem label="MBTI" value={profile.mbti} />
              <DetailItem label="体型" value={profile.body_type} />
              <DetailItem label="学歴" value={profile.education} />
              <DetailItem label="休日" value={profile.holiday} />
              <DetailItem label="お酒" value={profile.alcohol} />
              <DetailItem label="タバコ" value={profile.smoking} />
              <DetailItem
                label="身長"
                value={profile.height_cm ? `${profile.height_cm}cm` : undefined}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

// 詳細情報の項目名と値を縦に並べ、未設定項目も同じ高さで表示する
function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-swipe-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-base font-medium text-swipe-foreground">
        {value || '未設定'}
      </p>
    </div>
  )
}
