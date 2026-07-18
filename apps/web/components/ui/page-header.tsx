export function PageHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background/90 px-5 pb-4 pt-10 backdrop-blur sm:px-8 sm:pt-12">
      {children}
    </header>
  )
}
