import { BottomNav } from '@/components/ui/bottom-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        maxWidth: '390px',
        margin: '0 auto',
        minHeight: '100dvh',
        backgroundColor: '#0B0E11',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <main style={{ paddingBottom: '72px' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
