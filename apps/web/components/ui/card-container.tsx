import { cn } from '@/lib/utils'

// スワイプカード・プロフィール写真編集カードなど、カードの表示領域を整える汎用コンテナ
export function CardContainer({
  children,
  fullBleed = false,
}: {
  children: React.ReactNode
  fullBleed?: boolean
}) {
  return (
    <div
      className={cn(
        'w-full',
        fullBleed
          ? 'h-full max-w-none aspect-auto md:h-auto md:max-w-96 md:aspect-[9/16]'
          : 'aspect-[9/16] max-w-96',
      )}
    >
      {children}
    </div>
  )
}
