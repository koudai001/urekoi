import { ThumbsUp, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export function SearchHeader() {
  return (
    <PageHeader>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">検索</h1>

      <div className="flex items-center gap-3">
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
    </PageHeader>
  )
}
