import type { MessageResponse } from '@/generated/urekoiAPI.schemas'

// メッセージのcreated_atを時刻表示(例: 14:05)に整形する
function formatTime(createdAt?: string) {
  if (!createdAt) return ''
  return new Date(createdAt).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// メッセージ1件分の吹き出し。fromが'me'なら右寄せ、'them'なら左寄せで表示する
export function ChatMessageBubble({
  message,
  from,
}: {
  message: MessageResponse
  from: 'me' | 'them'
}) {
  if (from === 'me') return <MyMessageBubble message={message} />
  return <TheirMessageBubble message={message} />
}

// 自分が送ったメッセージ。時刻はバブルの左側(画面端じゃない側)に表示する
function MyMessageBubble({ message }: { message: MessageResponse }) {
  return (
    <div className="flex items-end justify-end gap-2">
      <span className="mb-1 shrink-0 text-[11px] text-swipe-muted-foreground">
        {formatTime(message.created_at)}
      </span>
      <p className="max-w-[70%] rounded-xl bg-swipe-bubble-mine px-3 py-2 text-sm leading-relaxed text-swipe-bubble-mine-foreground">
        {message.body}
      </p>
    </div>
  )
}

// 相手が送ったメッセージ。時刻はバブルの右側(画面端じゃない側)に表示する
function TheirMessageBubble({ message }: { message: MessageResponse }) {
  return (
    <div className="flex items-end justify-start gap-2">
      <p className="max-w-[70%] rounded-xl bg-swipe-bubble-theirs px-3 py-2 text-sm leading-relaxed text-swipe-foreground">
        {message.body}
      </p>
      <span className="mb-1 shrink-0 text-[11px] text-swipe-muted-foreground">
        {formatTime(message.created_at)}
      </span>
    </div>
  )
}
