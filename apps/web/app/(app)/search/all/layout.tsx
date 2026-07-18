import { Sidebar } from '@/components/sidebar'
import { SearchHeader } from '@/components/search/search-header'
import { SearchFloatingBar } from '@/components/search/search-floating-bar'

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="relative flex-1">
        <SearchHeader />

        {children}

        <SearchFloatingBar />
      </main>

      {modal}
    </div>
  )
}
