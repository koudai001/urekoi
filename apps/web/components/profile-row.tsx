"use client"

import { useRef } from "react"
import { ChevronRight, ChevronLeft, Lock, Heart } from "lucide-react"
import { ProfileCard } from "@/components/profile-card"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/profiles"

type Props = {
  title: string
  badge?: {
    label: string
    variant: "free" | "premium"
  }
  profiles: Profile[]
  premium?: boolean
}

export function ProfileRow({ title, badge, profiles, premium }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    })
  }

  return (
    <section
      className={cn(
        "rounded-2xl p-5 sm:p-6",
        premium ? "bg-accent/50" : "bg-transparent",
      )}
    >
      {badge && (
        <span
          className={cn(
            "mb-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold",
            badge.variant === "premium"
              ? "bg-amber-400 text-amber-950"
              : "bg-primary/15 text-primary",
          )}
        >
          {badge.variant === "premium" ? (
            <Lock className="h-3 w-3" />
          ) : (
            <Heart className="h-3 w-3 fill-primary" />
          )}
          {badge.label}
        </span>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          {title}
        </h2>
        <div className="hidden gap-2 sm:flex">
          <button
            aria-label="前へ"
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="次へ"
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  )
}
