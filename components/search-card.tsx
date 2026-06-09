"use client"

import { Star } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/profiles"

export function SearchCard({ profile }: { profile: Profile }) {
  const [faved, setFaved] = useState(false)

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm">
        <Image
          src={profile.image || "/placeholder.svg"}
          alt={`${profile.name}さんのプロフィール写真`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {profile.isNew && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
            NEW
          </span>
        )}

        <button
          aria-label="お気に入りに追加"
          onClick={() => setFaved((v) => !v)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <Star
            className={cn(
              "h-4 w-4 transition-colors",
              faved ? "fill-amber-300 text-amber-300" : "text-white",
            )}
          />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            profile.online === "online"
              ? "bg-green-500"
              : profile.online === "recent"
                ? "bg-amber-400"
                : "bg-muted-foreground/40",
          )}
        />
        <span className="text-sm font-medium text-foreground">
          {profile.age}歳
        </span>
        <span className="text-sm text-muted-foreground">{profile.area}</span>
      </div>
    </div>
  )
}
