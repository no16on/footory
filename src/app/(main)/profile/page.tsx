import { NavHeader } from '@/components/ui/nav-header'

export default function ProfilePage() {
  return (
    <>
      <NavHeader
        title="내 프로필"
        rightAction={
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#F4F2EA',
              padding: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        }
      />
      <div style={{ padding: '20px', color: '#F4F2EA' }}>
        <p style={{ color: '#706B56', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '1.5px' }}>
          SPRINT 1에서 구현 예정
        </p>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '22px', marginTop: '8px' }}>
          Profile Page
        </h1>
      </div>
    </>
  )
}
