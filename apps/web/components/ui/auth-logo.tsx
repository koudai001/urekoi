export function AuthLogo({ align = 'center' }: { align?: 'center' | 'left' }) {
  return (
    <div
      className={`mb-8 flex flex-col leading-none ${align === 'center' ? 'items-center' : 'items-start'}`}
    >
      <span className="text-5xl font-bold tracking-tight text-primary">
        熟恋
      </span>
      <span className="mt-2 text-xs font-medium tracking-[0.3em] text-muted-foreground">
        UREKOI
      </span>
    </div>
  )
}
