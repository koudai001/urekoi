import { BottomBar } from '@/components/sidebar/bottom-bar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-x-none md:contents">
      <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
      <div className="shrink-0 md:hidden">
        <BottomBar />
      </div>
    </div>
  )
}
