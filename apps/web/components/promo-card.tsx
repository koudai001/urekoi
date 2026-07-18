import { Footprints } from 'lucide-react'

export function PromoCard() {
  return (
    <div className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
      <div>
        <p className="text-xs font-medium opacity-90">見逃していませんか？</p>
        <p className="mt-2 text-sm font-medium leading-relaxed">
          足あと経由なら
          <br />
          マッチング率
        </p>
        <p className="text-3xl font-bold leading-tight">
          3倍<span className="text-xl">UP</span>
        </p>
      </div>
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15">
          <Footprints className="h-7 w-7" />
        </div>
      </div>
    </div>
  )
}
