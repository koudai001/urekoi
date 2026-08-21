import { SwipeCardDeck } from '@/components/recs/swipe-card-deck'

export default function RecsPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 justify-center pt-2">
        <SwipeCardDeck />
      </div>
    </main>
  )
}
