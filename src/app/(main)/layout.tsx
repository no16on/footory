import { BottomNav } from '@/components/ui/bottom-nav'
import { ToastProvider } from '@/components/ui/toast'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="w-full max-w-[430px] mx-auto min-h-dvh bg-bg relative overflow-x-hidden">
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
