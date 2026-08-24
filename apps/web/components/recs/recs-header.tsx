export function RecsHeader() {
  return (
    <header className="shrink-0 border-b border-swipe-border bg-swipe-background px-4">
      <div className="grid h-14 grid-cols-2" aria-label="探すメニュー">
        <span className="flex items-center justify-center border-b-2 border-swipe-accent text-base font-bold text-swipe-accent">
          おすすめ
        </span>
        <span className="flex items-center justify-center text-base font-semibold text-swipe-muted-foreground">
          検索
        </span>
      </div>
    </header>
  )
}
