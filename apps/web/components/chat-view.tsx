"use client"

import Image from "next/image"
import {
  ChevronLeft,
  MoreHorizontal,
  StickyNote,
  ImageIcon,
  Smile,
  MapPin,
  GraduationCap,
  Users,
  Ban,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/conversations"

const pointIcons = [MapPin, GraduationCap, Users, Ban]

export function ChatView({
  conversation,
  onBack,
}: {
  conversation: Conversation
  onBack: () => void
}) {
  return (
    <div className="flex h-screen flex-1 flex-col bg-card">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="戻る"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="h-9 w-9 overflow-hidden rounded-full">
            <Image
              src={conversation.image || "/placeholder.svg"}
              alt={`${conversation.name}さん`}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="font-bold text-foreground">{conversation.name}</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <StickyNote className="h-5 w-5" />
          <MoreHorizontal className="h-5 w-5" />
        </div>
      </div>

      {/* 本文 */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* 写真サムネ横並び */}
        <div className="flex flex-wrap justify-center gap-2">
          {conversation.photos.map((p, i) => (
            <span
              key={i}
              className="h-20 w-20 overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={p || "/placeholder.svg"}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </span>
          ))}
        </div>

        {/* 話題になりそうな共通点 */}
        <div className="rounded-2xl border border-border p-4">
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              話題になりそうな共通点
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {conversation.commonPoints.map((point, i) => {
              const Icon = pointIcons[i % pointIcons.length]
              return (
                <span
                  key={point}
                  className="flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {point}
                </span>
              )
            })}
          </div>
        </div>

        {/* メッセージ */}
        {conversation.messages.map((group) => (
          <div key={group.date} className="space-y-4">
            <p className="text-center text-xs font-medium text-muted-foreground">
              {group.date}
            </p>
            {group.items.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.from === "me" ? "justify-end" : "justify-start",
                )}
              >
                {msg.from === "me" && (
                  <span className="mb-1 shrink-0 text-[11px] text-muted-foreground">
                    {msg.time}
                  </span>
                )}
                <div className="flex max-w-[70%] flex-col gap-1">
                  <p
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.from === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    {msg.text}
                  </p>
                  {msg.from === "me" && msg.read && (
                    <span className="self-end text-[11px] text-muted-foreground">
                      既読を確認
                    </span>
                  )}
                </div>
                {msg.from === "them" && (
                  <span className="mb-1 shrink-0 text-[11px] text-muted-foreground">
                    {msg.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 入力欄 */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 shrink-0 text-muted-foreground" />
          <Smile className="h-6 w-6 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="メッセージを入力"
            className="flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button className="shrink-0 rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
            送信
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyChat() {
  return (
    <div className="hidden h-screen flex-1 flex-col items-center justify-center bg-card md:flex">
      <p className="font-heading text-xl font-bold text-foreground">
        選択中のやりとりはありません
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        選択したやりとりが表示されます
      </p>
    </div>
  )
}
