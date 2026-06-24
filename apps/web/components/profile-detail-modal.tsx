"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  X,
  Star,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  ShieldCheck,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Profile, tagCatalog, defaultMyTags } from "@/lib/profiles"

export function ProfileDetailModal({
  profile,
  onClose,
}: {
  profile: Profile | null
  onClose: () => void
}) {
  const [faved, setFaved] = useState(false)
  const [likedTags, setLikedTags] = useState<Record<string, boolean>>({})

  // Escキーで閉じる & 背景スクロール固定
  useEffect(() => {
    if (!profile) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [profile, onClose])

  if (!profile) return null

  const myTags = defaultMyTags
    .map((t) => tagCatalog[t])
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/50 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${profile.name}さんのプロフィール`}
    >
      {/* 閉じる（左上） */}
      <button
        onClick={onClose}
        aria-label="閉じる"
        className="fixed left-[calc(50%-21rem)] top-6 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition-colors hover:bg-secondary lg:flex"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="flex w-full max-w-3xl flex-col gap-4 lg:flex-row lg:items-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左：プロフィールカード */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-card shadow-xl lg:w-80 lg:shrink-0">
          {/* モバイル用の操作ボタン */}
          <div className="absolute left-3 top-3 z-10 flex lg:hidden">
            <button
              onClick={onClose}
              aria-label="閉じる"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute right-3 top-3 z-10 flex gap-2">
            <button
              onClick={() => setFaved((v) => !v)}
              aria-label="お気に入り"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow transition-colors hover:bg-secondary"
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  faved
                    ? "fill-amber-300 text-amber-300"
                    : "text-muted-foreground",
                )}
              />
            </button>
            <button
              aria-label="その他"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow transition-colors hover:bg-secondary"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="relative aspect-[3/4] w-full bg-muted">
            <Image
              src={profile.image || "/placeholder.svg"}
              alt={`${profile.name}さんのプロフィール写真`}
              fill
              sizes="320px"
              className="object-cover"
            />
            {/* いいねボタン（写真下端に重ねる） */}
            <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 gap-4">
              <button
                aria-label="メッセージ付きいいね"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-1 ring-border transition-transform hover:scale-105"
              >
                <MessageCircle className="h-6 w-6" />
              </button>
              <button
                aria-label="いいね"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
              >
                <ThumbsUp className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-5 pb-6 pt-10">
            {profile.isNew && (
              <p className="text-sm font-bold text-primary">新着のお相手</p>
            )}
            <h2 className="mt-1 font-heading text-3xl font-bold text-foreground">
              {profile.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.age}歳 {profile.area}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {profile.online === "online" ? "オンライン" : "24時間以内"}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5 text-primary" />? いいね！
              </span>
              <span className="inline-flex items-center gap-1 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                本人確認済み
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* 右：マイタグ */}
        <div className="w-full overflow-hidden rounded-3xl bg-card shadow-xl">
          <div className="px-6 pt-6">
            <h3 className="font-heading text-xl font-bold text-foreground">
              マイタグ
            </h3>
          </div>
          <ul className="flex flex-col px-4 py-3">
            {myTags.map((tag) => {
              const liked = likedTags[tag.label]
              return (
                <li
                  key={tag.label}
                  className="flex items-center gap-4 rounded-2xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={tag.image || "/placeholder.svg"}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {tag.label}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {tag.category}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLikedTags((prev) => ({
                        ...prev,
                        [tag.label]: !prev[tag.label],
                      }))
                    }
                    aria-label={`${tag.label}にいいね`}
                    aria-pressed={liked}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      liked
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary hover:bg-accent",
                    )}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
