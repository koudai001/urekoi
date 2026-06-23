"use client"

import Image from "next/image"
import { Pencil, Plus, Gift, Check } from "lucide-react"

const photos = ["/profiles/me-1.png", "/profiles/me-2.png"]

const tasks = [
  { label: "顔写真2枚以上", done: false },
  { label: "自撮りで写真追加", done: true },
  { label: "本音マッチに1つ以上回答", done: false },
]

export function AchievementBanner() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Gift className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">
          3つ達成で20いいね！GET
        </p>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
        {tasks.map((t) => (
          <div
            key={t.label}
            className={
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium " +
              (t.done
                ? "border-primary/40 bg-accent/60 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground")
            }
          >
            {t.done ? (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/40" />
            )}
            <span className="text-pretty">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfilePhotos() {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-lg font-bold text-foreground">
        プロフィール写真
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        写真を長押しすると、順番を入れ替えられます
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        {/* メイン写真 */}
        <div className="relative h-56 w-44 overflow-hidden rounded-2xl bg-muted">
          <Image
            src={photos[0] || "/placeholder.svg"}
            alt="メインのプロフィール写真"
            fill
            className="object-cover"
          />
          <EditBadge />
        </div>

        {/* サブ写真 + 追加 */}
        <div className="flex flex-wrap gap-3">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-muted">
            <Image
              src={photos[1] || "/placeholder.svg"}
              alt="サブのプロフィール写真"
              fill
              className="object-cover"
            />
            <EditBadge small />
          </div>

          <button className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium">追加</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function EditBadge({ small }: { small?: boolean }) {
  return (
    <button
      aria-label="写真を編集"
      className={
        "absolute right-2 top-2 flex items-center justify-center rounded-full bg-card/90 text-foreground shadow transition-colors hover:bg-card " +
        (small ? "h-7 w-7" : "h-8 w-8")
      }
    >
      <Pencil className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  )
}
