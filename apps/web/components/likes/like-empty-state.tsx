import { ThumbsUp } from 'lucide-react'

export function LikeEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-swipe-surface">
        <ThumbsUp className="h-7 w-7 text-swipe-accent" />
      </div>
      <p className="text-xl font-bold text-swipe-foreground">
        すべて確認しました
      </p>
      <p className="text-sm text-swipe-muted-foreground">
        新しいいいね！が届くとここに表示されます
      </p>
    </div>
  )
}
