import { NavHeader } from '@/components/ui/nav-header'

export default function UploadPage() {
  return (
    <>
      <NavHeader title="영상 업로드" showBack />
      <div style={{ padding: '20px', color: '#F4F2EA' }}>
        <p style={{ color: '#706B56', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '1.5px' }}>
          SPRINT 2에서 구현 예정
        </p>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '22px', marginTop: '8px' }}>
          Upload Page
        </h1>
      </div>
    </>
  )
}
