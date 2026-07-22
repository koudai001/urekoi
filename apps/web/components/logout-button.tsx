import { LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
      >
        <LogOut className="h-5 w-5" />
        ログアウト
      </button>
    </form>
  )
}
