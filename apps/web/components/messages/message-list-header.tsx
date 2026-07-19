import { ShieldCheck, MoreHorizontal } from 'lucide-react'

export function MessageListHeader() {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <h1 className="text-2xl font-bold text-foreground">メッセージ</h1>
      <div className="flex items-center gap-3 text-muted-foreground">
        <ShieldCheck className="h-5 w-5" />
        <MoreHorizontal className="h-5 w-5" />
      </div>
    </div>
  )
}
