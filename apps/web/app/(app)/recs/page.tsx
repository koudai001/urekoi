import { SwipeCardDeck } from '@/components/recs/swipe-card-deck'
import { SpHeader } from '@/components/ui/sp-header'

export default function RecsPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <SpHeader />

      <div className="flex min-h-0 flex-1 justify-center px-2 pb-2">
        <SwipeCardDeck />
      </div>
    </main>
  )
}
