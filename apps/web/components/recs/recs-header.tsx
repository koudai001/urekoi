export function RecsHeader() {
  return (
    <header className="shrink-0 border-b border-border bg-background px-4">
      <div className="grid h-14 grid-cols-2" aria-label="探すメニュー">
        <span className="flex items-center justify-center border-b-2 border-primary text-base font-bold text-primary">
          おすすめ
        </span>
        <span className="flex items-center justify-center text-base font-semibold text-muted-foreground">
          検索
        </span>
      </div>
    </header>
  )
}
