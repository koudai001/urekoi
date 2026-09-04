const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// aとbが別の日(年月日)かどうかを判定する。片方が無ければ別日とみなす
export function isDifferentDay(a?: string, b?: string) {
  if (!a || !b) return true
  return new Date(a).toDateString() !== new Date(b).toDateString()
}

// created_atを日付表示(例: 7/17(金))に整形する
function formatDate(createdAt?: string) {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`
}

// チャット内で日付が変わったことを示す区切り
export function ChatDateDivider({ createdAt }: { createdAt?: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="text-xs text-muted-foreground">
        {formatDate(createdAt)}
      </span>
    </div>
  )
}
