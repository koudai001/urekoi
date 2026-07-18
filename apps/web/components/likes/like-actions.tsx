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
        className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground shadow-lg ring-1 ring-border transition hover:scale-105 hover:text-foreground"
      >
        <Undo2 className="h-7 w-7" />
      </button>
      <button
        aria-label="いいね！を送る"
        onClick={onLike}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105"
      >
        <ThumbsUp className="h-7 w-7" />
      </button>
    </div>
  )
}
