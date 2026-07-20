'use client'

import { useState } from 'react'
import { ImageIcon, Smile } from 'lucide-react'

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
    <div className="border-t border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <ImageIcon className="h-6 w-6 shrink-0 text-muted-foreground" />
        <Smile className="h-6 w-6 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // IME変換確定のEnterでは送信しない
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit()
          }}
          placeholder="メッセージを入力"
          className="flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="shrink-0 rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          送信
        </button>
      </div>
    </div>
  )
}
