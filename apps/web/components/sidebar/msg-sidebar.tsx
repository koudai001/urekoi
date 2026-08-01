'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart } from 'lucide-react'
import {
  useMessagedMatches,
  useUnmessagedMatches,
} from '@/components/messages/use-match-profiles'
import { useReceivedLikes } from '@/components/likes/use-received-likes'
import { SidebarHeader } from '@/components/sidebar/sidebar-header'
import { cn } from '@/lib/utils'

type Tab = 'matching' | 'msg'

// /swipe画面の左サイドバー。ヘッダー+マッチ一覧/メッセージの2タブ
export function MsgSidebar() {
  const [tab, setTab] = useState<Tab>('matching')

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-r border-swipe-border">
      <SidebarHeader />

      <div className="flex gap-6 border-b border-swipe-border px-5 pt-4.5">
        <TabButton
          active={tab === 'matching'}
          onClick={() => setTab('matching')}
        >
          マッチした相手
        </TabButton>
        <TabButton active={tab === 'msg'} onClick={() => setTab('msg')}>
          メッセージ
        </TabButton>
      </div>

      {tab === 'matching' ? <MatchingGrid /> : <MsgList />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer border-b-2 pb-3 text-[15px] font-bold',
        active
          ? 'border-swipe-accent text-swipe-foreground'
          : 'border-transparent font-semibold text-swipe-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}

// マッチングした相手一覧（メッセージはまだしてない相手のみ表示する）
function MatchingGrid() {
  const { data: matchProfiles } = useUnmessagedMatches()
  const matches = matchProfiles ?? []

  const { data: receivedLikes } = useReceivedLikes()
  const likeCount = receivedLikes?.total ?? 0

  return (
    <div className="grid grid-cols-2 gap-2.5 p-5">
      <div className="relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-swipe-accent bg-swipe-surface">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-swipe-accent text-sm font-bold text-swipe-foreground">
          {likeCount}
        </span>
        <span className="text-xs font-bold text-swipe-foreground">
          {likeCount}件のLike
        </span>
      </div>

      <div className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-swipe-accent bg-swipe-accent/20">
        <Heart className="h-6.5 w-6.5 text-swipe-accent" />
        <span className="text-xs font-bold text-swipe-foreground">
          Likeした人
        </span>
      </div>

      {matches.map((m) => (
        <Link
          key={m.user_id}
          href={`/messages/${m.match_id}`}
          className="relative aspect-square overflow-hidden rounded-2xl bg-swipe-surface"
        >
          {m.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.image}
              alt={m.nickname}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2">
            <span className="text-[13px] font-bold text-swipe-foreground">
              {m.nickname}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// トーク中の相手一覧(メッセージを1通でも送っているマッチのみ、最新メッセージのプレビュー付きで表示する)
function MsgList() {
  const { data: matchProfiles } = useMessagedMatches()
  const matches = matchProfiles ?? []
  const { matchId } = useParams<{ matchId?: string }>()
  const activeMatchId = Number(matchId)

  if (matches.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-5">
        <p className="text-sm text-swipe-muted-foreground">
          メッセージはまだありません
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {matches.map((m) => (
        <Link
          key={m.user_id}
          href={`/messages/${m.match_id}`}
          className={cn(
            'flex items-center gap-3.5 px-5 py-5 transition-colors hover:bg-swipe-surface',
            m.match_id === activeMatchId && 'bg-swipe-accent/15',
          )}
        >
          <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-swipe-surface">
            {m.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.image}
                alt={m.nickname}
                className="h-full w-full object-cover"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold text-swipe-foreground">
              {m.nickname} {m.age}歳 {m.prefecture}
            </span>
            <span className="block truncate text-sm text-swipe-muted-foreground">
              {m.last_message_sender_user_id !== m.user_id && '↩ '}
              {m.last_message}
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
