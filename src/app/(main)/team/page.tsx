import { NavHeader } from '@/components/ui/nav-header'

export default function TeamPage() {
  return (
    <>
      <NavHeader title="팀 허브" />
      <div style={{ padding: '20px', color: '#F4F2EA' }}>
        <p style={{ color: '#706B56', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '1.5px' }}>
          SPRINT 5에서 구현 예정
        </p>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '22px', marginTop: '8px' }}>
          Team Page
        </h1>
      </div>
    </>
  )
}
