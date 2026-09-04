'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { logout } from '@/actions/auth'

type LogoutDialogProps = {
  open: boolean
  onClose: () => void
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    // キャンセルボタンに自動フォーカスを当てる
    cancelButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)

    // 閉じたらEscキーの監視を終了する
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="relative w-full max-w-sm rounded-2xl bg-card px-6 py-8 text-center shadow-2xl"
      >
        <button
          type="button"
          aria-label="閉じる"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-5" />
        </button>

        <h2 id="logout-dialog-title" className="text-2xl font-bold">
          ログアウトしますか？
        </h2>
        <p
          id="logout-dialog-description"
          className="mt-4 text-sm leading-6 text-muted-foreground"
        >
          再度ご利用いただくには、ログインが必要です
        </p>

        <form action={logout} className="mt-6">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-foreground px-5 py-3.5 text-lg font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ログアウト
          </button>
        </form>

        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          className="mt-3 w-full cursor-pointer rounded-full px-5 py-3 text-lg font-bold transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-primary"
        >
          キャンセル
        </button>
      </section>
    </div>
  )
}
