// スワイプカード・プロフィール写真編集カードなど、カードの表示領域を整える汎用コンテナ
export function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full max-w-none aspect-auto md:h-auto md:max-w-96 md:aspect-[9/16]">
      {children}
    </div>
  )
}
