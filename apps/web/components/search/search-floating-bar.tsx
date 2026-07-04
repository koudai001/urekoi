import { SlidersHorizontal, ArrowDownUp } from 'lucide-react'

export function SearchFloatingBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur lg:pl-[16rem]">
        <button
          aria-label="絞り込み"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
        <span className="px-3 font-heading text-lg font-bold text-foreground">
          9999+
        </span>
        <button
          aria-label="並び替え"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent"
        >
          <ArrowDownUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
