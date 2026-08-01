// スワイプカード・プロフィール写真編集カードなど、幅380px×9:16のサイズを固定で持つだけの汎用コンテナ
export function CardContainer({ children }: { children: React.ReactNode }) {
  return <div className="aspect-[9/16] w-full max-w-[380px]">{children}</div>
}
