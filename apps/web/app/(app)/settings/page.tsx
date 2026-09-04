'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { LogoutDialog } from '@/components/settings/logout-dialog'

export default function SettingsPage() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const openLogoutDialog = useCallback(() => setIsLogoutDialogOpen(true), [])
  const closeLogoutDialog = useCallback(() => setIsLogoutDialogOpen(false), [])

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-border px-5">
        <h1 className="text-xl font-bold">設定</h1>
        <Link
          href="/myprofile"
          className="absolute right-5 cursor-pointer rounded-md px-2 py-1 text-base font-bold text-primary transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          完了
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-end px-4 pb-8">
        <LogoutButton onClick={openLogoutDialog} />
      </div>

      <LogoutDialog open={isLogoutDialogOpen} onClose={closeLogoutDialog} />
    </main>
  )
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-lg font-semibold transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <LogOut className="size-5" aria-hidden="true" />
      ログアウト
    </button>
  )
}
