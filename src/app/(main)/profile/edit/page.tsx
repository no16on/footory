'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { useProfile } from '@/hooks/useProfile'
import { POSITIONS } from '@/types/profile'

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, isLoading } = useProfile()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [position, setPosition] = useState('')
  const [secondaryPosition, setSecondaryPosition] = useState('')
  const [region, setRegion] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setBio(profile.bio ?? '')
      setBirthYear(profile.birth_year ? String(profile.birth_year) : '')
      setPosition(profile.position ?? '')
      setSecondaryPosition(profile.secondary_position ?? '')
      setRegion(profile.region ?? '')
    }
  }, [profile])

  async function handleSave() {
    if (!displayName.trim()) { setError('이름을 입력해주세요'); return }
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          birth_year: birthYear ? parseInt(birthYear) : null,
          position: position || null,
          secondary_position: secondaryPosition || null,
          region: region.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        router.replace('/profile')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#12160F',
    border: '1px solid rgba(212,168,67,0.15)',
    borderRadius: '10px',
    color: '#F4F2EA',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
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

  if (isLoading) {
    return (
      <>
        <NavHeader title="프로필 편집" showBack />
        <div style={{ padding: '20px', color: '#706B56', fontFamily: "'DM Sans', sans-serif" }}>
          로딩 중...
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader
        title="프로필 편집"
        showBack
        rightAction={
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: 'none',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: isSaving ? '#706B56' : '#D4A843',
              padding: 0,
            }}
          >
            {isSaving ? '저장 중…' : '저장'}
          </button>
        }
      />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(232,93,93,0.1)',
              border: '1px solid rgba(232,93,93,0.3)',
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#E85D5D',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="edit-display-name" style={labelStyle}>이름 *</label>
          <input
            id="edit-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="edit-bio" style={labelStyle}>한 줄 소개</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            style={{
              ...inputStyle,
              resize: 'none',
              lineHeight: 1.6,
            }}
            placeholder="나를 표현하는 한 마디 (최대 200자)…"
          />
          <div
            style={{
              textAlign: 'right',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#706B56',
              marginTop: '4px',
            }}
          >
            {bio.length}/200
          </div>
        </div>

        <div>
          <label htmlFor="edit-birth-year" style={labelStyle}>출생 연도</label>
          <input
            id="edit-birth-year"
            type="number"
            inputMode="numeric"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            min={1990}
            max={new Date().getFullYear()}
            style={inputStyle}
            placeholder="예: 2010"
          />
        </div>

        <div>
          <label htmlFor="edit-position" style={labelStyle}>주 포지션</label>
          <select
            id="edit-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}
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
          <label htmlFor="edit-secondary-position" style={labelStyle}>서브 포지션</label>
          <select
            id="edit-secondary-position"
            value={secondaryPosition}
            onChange={(e) => setSecondaryPosition(e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            <option value="">선택 안 함</option>
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.value} — {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-region" style={labelStyle}>지역</label>
          <input
            id="edit-region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={inputStyle}
            placeholder="서울, 경기 등"
            autoComplete="address-level1"
          />
        </div>
      </div>
    </>
  )
}
