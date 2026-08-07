import { BottomBar } from '@/components/bottombar/bottombar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh justify-center overflow-hidden overscroll-x-none bg-swipe-sidebar">
      <div className="flex w-full max-w-md flex-col overflow-hidden bg-swipe-background md:border-x md:border-swipe-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
        <div className="shrink-0">
          <BottomBar />
        </div>
      </div>
    </div>
  )
}
