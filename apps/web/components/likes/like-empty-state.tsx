import { ThumbsUp } from 'lucide-react'

export function LikeEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
        <ThumbsUp className="h-7 w-7 text-primary" />
      </div>
      <p className="text-xl font-bold text-foreground">すべて確認しました</p>
      <p className="text-sm text-muted-foreground">
        新しいいいね！が届くとここに表示されます
      </p>
    </div>
  )
}
