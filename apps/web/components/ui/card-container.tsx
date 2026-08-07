import { cn } from '@/lib/utils'

// スワイプカード・プロフィール写真編集カードなど、カードの表示領域を整える汎用コンテナ
export function CardContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'h-full w-full max-w-none aspect-auto md:h-auto md:max-w-96 md:aspect-[9/16]',
        className,
      )}
    >
      {children}
    </div>
  )
}
