import { toast } from 'sonner'

// いいね送信時(マッチには至らない)のトーストを表示する
export function showLikeToast(partnerName: string) {
  toast.custom(() => (
    <div className="w-[340px] max-w-[calc(100vw-3rem)] rounded-[20px] bg-primary p-5 shadow-xl">
      <p className="text-base font-bold text-primary-foreground">
        {partnerName}さんにいいねしました！
      </p>
    </div>
  ))
}
