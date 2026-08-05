import { MsgSidebar } from '@/components/sidebar/msg-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden bg-swipe-background md:h-screen">
      <div className="hidden md:flex">
        <MsgSidebar />
      </div>

      {children}
    </div>
  )
}
