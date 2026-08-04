import { cn } from '@/lib/utils'

// 親の残り高さいっぱいに広がり、はみ出た分だけ縦スクロールする領域
export function ScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
    >
      {children}
    </div>
  )
}
