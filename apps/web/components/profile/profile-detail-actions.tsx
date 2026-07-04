import { MoreHorizontal } from 'lucide-react'
import { CloseButton } from '@/components/ui/close-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

export function ProfileDetailActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between">
      <CloseButton onClick={onClose} />
      <div className="flex gap-2">
        <FavoriteButton
          className="h-9 w-9 bg-card/90 shadow hover:bg-secondary"
          iconClassName="h-5 w-5"
          inactiveIconClassName="text-muted-foreground"
        />
        <button
          aria-label="その他"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow transition-colors hover:bg-secondary"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
