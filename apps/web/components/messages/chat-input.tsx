'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

// メッセージ入力欄。送信成功時のみ入力内容をクリアする
export function ChatInput({
  onSubmit,
}: {
  onSubmit: (body: string) => Promise<boolean>
}) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    const body = input.trim()
    if (!body || sending) return

    setSending(true)
    const success = await onSubmit(body)
    if (success) setInput('')
    setSending(false)
  }

  return (
    <div className="border-t border-swipe-border px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // IME変換確定のEnterでは送信しない
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit()
          }}
          placeholder="メッセージを入力"
          className="min-w-0 flex-1 rounded-md border border-swipe-border bg-swipe-surface px-4 py-2.5 text-base text-swipe-foreground outline-none placeholder:text-swipe-muted-foreground focus:border-swipe-accent"
        />
        <button
          type="button"
          aria-label="送信"
          onClick={handleSubmit}
          disabled={sending || !input.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-swipe-accent text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
