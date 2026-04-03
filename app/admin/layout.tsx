import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#EFEFEA]">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
