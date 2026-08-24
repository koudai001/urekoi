import { RecsHeader } from '@/components/recs/recs-header'
import { SwipeCardDeck } from '@/components/recs/swipe-card-deck'

export default function RecsPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <RecsHeader />
      <div className="flex min-h-0 flex-1 justify-center pt-2">
        <SwipeCardDeck />
      </div>
    </main>
  )
}
