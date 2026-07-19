import { toast } from 'sonner'

// スキップ時のトーストを表示する
export function showSkipToast(partnerName: string) {
  toast.custom(() => (
    <div className="w-[340px] max-w-[calc(100vw-3rem)] rounded-[20px] bg-secondary p-5 shadow-xl">
      <p className="text-base font-bold text-secondary-foreground">
        {partnerName}さんをスキップしました 👋
      </p>
    </div>
  ))
}
