"use client"

import Image from "next/image"
import { ChevronRight, ShieldCheck, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { matches, conversations, type Conversation } from "@/lib/conversations"

export function MessageList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null
  onSelect: (c: Conversation) => void
}) {
  return (
    <div className="flex h-screen w-full shrink-0 flex-col border-r border-border bg-card md:w-[360px]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          メッセージ
        </h1>
        <div className="flex items-center gap-3 text-muted-foreground">
          <ShieldCheck className="h-5 w-5" />
          <MoreHorizontal className="h-5 w-5" />
        </div>
      </div>

      {/* マッチング（横スクロール） */}
      <div className="px-5 pb-4">
        <p className="mb-3 text-sm font-bold text-foreground">マッチング</p>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {matches.map((m) => (
              <button key={m.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
                <span className="relative">
                  <span className="block h-16 w-16 overflow-hidden rounded-full ring-2 ring-border">
                    <Image
                      src={m.image || "/placeholder.svg"}
                      alt={`${m.name}さん`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  {m.unread ? (
                    <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-destructive" />
                  ) : null}
                  {m.online ? (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-chart-2" />
                  ) : null}
                </span>
                <span className="w-full truncate text-center text-[11px] text-muted-foreground">
                  {m.age}歳 {m.area}
                </span>
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-card/80 shadow-md">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* トーク一覧 */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={cn(
              "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40",
              selectedId === c.id && "bg-accent/60",
            )}
          >
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
              <Image
                src={c.image || "/placeholder.svg"}
                alt={`${c.name}さん`}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-foreground">
                  {c.name} {c.age}歳 {c.area}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {c.date}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    "shrink-0 text-xs font-bold",
                    c.status === "NEW" ? "text-primary" : "text-destructive",
                  )}
                >
                  {c.status}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {c.preview}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
