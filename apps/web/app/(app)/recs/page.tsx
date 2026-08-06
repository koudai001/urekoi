import { SwipeCardDeck } from '@/components/recs/swipe-card-deck'
import { SpHeader } from '@/components/ui/sp-header'

export default function RecsPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="md:hidden">
        <SpHeader />
      </div>

      <div className="flex min-h-0 flex-1 justify-center px-2 pb-2 pt-0 md:items-center md:px-8 md:py-10">
        <SwipeCardDeck />
      </div>
    </main>
  )
}
