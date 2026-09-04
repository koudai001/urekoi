import { BottomBar } from '@/components/bottombar/bottombar'
import { WebSocketProvider } from '@/providers/websocket-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <div className="flex h-dvh justify-center overflow-hidden overscroll-x-none bg-background">
        <div className="flex w-full max-w-md flex-col overflow-hidden bg-background md:border-x md:border-border">
          <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
            {children}
          </div>
          <div className="shrink-0">
            <BottomBar />
          </div>
        </div>
      </div>
    </WebSocketProvider>
  )
}
