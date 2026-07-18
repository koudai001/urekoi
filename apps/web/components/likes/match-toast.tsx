import { toast } from 'sonner'

// マッチ成立時のトーストを表示する
export function showMatchToast(partnerName: string, partnerAge: number) {
  toast.custom(() => (
    <div className="w-[340px] max-w-[calc(100vw-3rem)] rounded-[20px] bg-primary p-5 shadow-xl">
      <p className="text-base font-bold text-primary-foreground">
        {partnerName}さん({partnerAge})とマッチング！
      </p>
    </div>
  ))
}
