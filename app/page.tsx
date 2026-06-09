import { Sidebar } from "@/components/sidebar"
import { ProfileRow } from "@/components/profile-row"
import { ThumbsUp, Search, Bell } from "lucide-react"
import { recommendedProfiles, premiumProfiles } from "@/lib/profiles"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1">
        {/* ヘッダー */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-5 py-4 backdrop-blur sm:px-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            おすすめ
          </h1>

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

            <button
              aria-label="お知らせ"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        {/* コンテンツ */}
        <div className="mx-auto max-w-6xl space-y-2 px-3 py-6 sm:px-6">
          <ProfileRow
            title="あなたのことが好みかも"
            badge={{ label: "いいね！無料 × 2", variant: "free" }}
            profiles={recommendedProfiles}
          />

          <ProfileRow
            title="あなたの好みかも"
            badge={{ label: "PREMIUM 限定", variant: "premium" }}
            profiles={premiumProfiles}
            premium
          />

          <ProfileRow
            title="新しく登録したお相手"
            profiles={[...premiumProfiles].reverse()}
          />
        </div>
      </main>
    </div>
  )
}
