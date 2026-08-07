import { Undo2, ThumbsUp } from 'lucide-react'

export function LikeActions({
  onSkip,
  onLike,
}: {
  onSkip: () => void
  onLike: () => void
}) {
  return (
    <div className="mx-auto mt-6 flex w-fit items-center gap-6">
      <button
        aria-label="スキップ"
        onClick={onSkip}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-swipe-surface text-swipe-muted-foreground shadow-lg ring-1 ring-swipe-border transition hover:scale-105 hover:text-swipe-foreground"
      >
        <Undo2 className="h-7 w-7" />
      </button>
      <button
        aria-label="いいね！を送る"
        onClick={onLike}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-swipe-accent text-white shadow-lg shadow-swipe-accent/30 transition hover:scale-105"
      >
        <ThumbsUp className="h-7 w-7" />
      </button>
    </div>
  )
}
