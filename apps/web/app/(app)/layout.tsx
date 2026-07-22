import { Sidebar } from '@/components/sidebar'
import { SpBottomNav } from '@/components/sp-bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl bg-background">
      <Sidebar />
      {children}
      <SpBottomNav />
    </div>
  )
}
