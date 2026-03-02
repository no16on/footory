import { NavHeader } from '@/components/ui/nav-header'

export default function TagsPage() {
  return (
    <>
      <NavHeader title="기술 태그" />
      <div style={{ padding: '20px', color: '#F4F2EA' }}>
        <p style={{ color: '#706B56', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '1.5px' }}>
          SPRINT 3에서 구현 예정
        </p>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '22px', marginTop: '8px' }}>
          Tags Page
        </h1>
      </div>
    </>
  )
}
