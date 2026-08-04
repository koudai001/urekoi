import { MsgSidebar } from '@/components/sidebar/msg-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-swipe-background">
      <MsgSidebar />

      {children}
    </div>
  )
}
