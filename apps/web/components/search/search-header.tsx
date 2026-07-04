import { ThumbsUp, Search } from 'lucide-react'
import { logout } from '@/actions/auth'

export function SearchHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-5 py-4 backdrop-blur sm:px-8">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        検索
      </h1>

      <div className="flex items-center gap-3">
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ログアウト
          </button>
        </form>
        <div className="relative hidden items-center sm:flex">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="お相手を検索"
            className="h-10 w-56 rounded-full border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none ring-ring/30 placeholder:text-muted-foreground focus:ring-2"
          />
        </div>

        <button className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          <ThumbsUp className="h-4 w-4" />
          無料 × 8
        </button>
      </div>
    </header>
  )
}
