'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  async function handleKakaoLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0B0E11',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      {/* Logo / Brand */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 900,
            fontFamily: "'Sora', sans-serif",
            background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}
        >
          FOOTORY
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#706B56',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '2px',
            marginTop: '6px',
          }}
        >
          YOUR CAREER OS
        </div>
      </div>

      {/* Tagline */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: "'Sora', sans-serif",
            color: '#F4F2EA',
            lineHeight: 1.4,
            marginBottom: '8px',
          }}
        >
          나의 축구 커리어를<br />증거로 보여줘
        </p>
        <p
          style={{
            fontSize: '13px',
            color: '#A8A28A',
            lineHeight: 1.6,
          }}
        >
          하이라이트 영상 · 기술 태그 · 측정 기록<br />모든 커리어를 하나의 프로필에
        </p>
      </div>

      {/* Kakao Login Button */}
      <button
        onClick={handleKakaoLogin}
        style={{
          width: '100%',
          padding: '14px 20px',
          backgroundColor: '#FEE500',
          color: '#191919',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 2C5.582 2 2 4.898 2 8.45c0 2.215 1.454 4.16 3.655 5.295L4.9 17l4.126-2.727c.32.044.646.067.974.067 4.418 0 8-2.898 8-6.45S14.418 2 10 2z"
            fill="#191919"
          />
        </svg>
        카카오로 시작하기
      </button>

      <p
        style={{
          marginTop: '20px',
          fontSize: '11px',
          color: '#706B56',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        계속 진행하면 서비스 이용약관 및<br />개인정보 처리방침에 동의하는 것입니다.
      </p>
    </div>
  )
}
