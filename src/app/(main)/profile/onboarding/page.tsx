'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { POSITIONS } from '@/types/profile'

type Step = 'handle' | 'info'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('handle')
  const [handle, setHandle] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [position, setPosition] = useState('')
  const [region, setRegion] = useState('')
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkHandle(value: string) {
    if (!value) { setHandleStatus('idle'); return }
    setHandleStatus('checking')
    const res = await fetch('/api/profile/handle-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: value }),
    })
    const json = await res.json()
    if (json.error && json.error !== 'Invalid handle') {
      setHandleStatus('invalid')
    } else if (!json.available) {
      setHandleStatus(json.error ? 'invalid' : 'taken')
    } else {
      setHandleStatus('available')
    }
  }

  async function handleSubmit() {
    if (handleStatus !== 'available') return
    if (!displayName.trim()) { setError('이름을 입력해주세요'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('로그인이 필요합니다'); return }

      const { error: insertError } = await supabase.from('players').insert({
        user_id: user.id,
        handle: handle.toLowerCase(),
        display_name: displayName.trim(),
        birth_year: birthYear ? parseInt(birthYear) : null,
        position: position || null,
        region: region.trim() || null,
      })

      if (insertError) {
        setError(insertError.message)
      } else {
        router.replace('/profile')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#12160F',
    border: '1px solid rgba(212,168,67,0.2)',
    borderRadius: '10px',
    color: '#F4F2EA',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#706B56',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0B0E11',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#D4A843',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          STEP {step === 'handle' ? '1' : '2'} / 2
        </div>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 900,
            fontSize: '24px',
            color: '#F4F2EA',
            margin: 0,
          }}
        >
          {step === 'handle' ? '나만의 핸들 만들기' : '기본 정보 입력'}
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#706B56',
            marginTop: '8px',
          }}
        >
          {step === 'handle'
            ? '프로필 URL이 됩니다 (예: footory.com/p/heungmin)'
            : '나중에 언제든지 수정할 수 있어요'}
        </p>
      </div>

      {step === 'handle' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>핸들 (Handle)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="heungmin"
                value={handle}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                  setHandle(v)
                  if (v.length >= 3) checkHandle(v)
                  else setHandleStatus('idle')
                }}
                style={{
                  ...inputStyle,
                  borderColor:
                    handleStatus === 'available' ? 'rgba(107,203,119,0.5)' :
                    handleStatus === 'taken' || handleStatus === 'invalid' ? 'rgba(232,93,93,0.5)' :
                    'rgba(212,168,67,0.2)',
                  paddingLeft: '44px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px',
                  color: '#706B56',
                }}
              >
                @
              </span>
            </div>
            {handleStatus === 'available' && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#6BCB77', marginTop: '6px' }}>
                ✓ 사용 가능한 핸들입니다
              </p>
            )}
            {handleStatus === 'taken' && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#E85D5D', marginTop: '6px' }}>
                이미 사용 중인 핸들입니다
              </p>
            )}
            {handleStatus === 'invalid' && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#E85D5D', marginTop: '6px' }}>
                3~30자의 영소문자, 숫자, _ 만 사용 가능합니다
              </p>
            )}
          </div>

          <button
            onClick={() => setStep('info')}
            disabled={handleStatus !== 'available'}
            style={{
              width: '100%',
              padding: '15px',
              background: handleStatus === 'available'
                ? 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)'
                : 'rgba(212,168,67,0.15)',
              border: 'none',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              fontWeight: 800,
              color: handleStatus === 'available' ? '#0B0E11' : '#706B56',
              cursor: handleStatus === 'available' ? 'pointer' : 'not-allowed',
              marginTop: '8px',
            }}
          >
            다음 →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>이름 *</label>
            <input
              type="text"
              placeholder="손흥민"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>출생 연도</label>
            <input
              type="number"
              placeholder="2010"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min={1990}
              max={new Date().getFullYear()}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>포지션</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
              }}
            >
              <option value="">포지션 선택</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.value} — {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>지역</label>
            <input
              type="text"
              placeholder="서울, 경기 등"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#E85D5D' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => setStep('handle')}
              style={{
                flex: 1,
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: '#A8A28A',
                cursor: 'pointer',
              }}
            >
              ← 이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !displayName.trim()}
              style={{
                flex: 2,
                padding: '15px',
                background: displayName.trim()
                  ? 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)'
                  : 'rgba(212,168,67,0.15)',
                border: 'none',
                borderRadius: '12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 800,
                color: displayName.trim() ? '#0B0E11' : '#706B56',
                cursor: displayName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting ? '생성 중...' : '프로필 만들기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
