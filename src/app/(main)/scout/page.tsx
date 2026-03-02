'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { NavHeader } from '@/components/ui/nav-header'
import { useScoutPlayers } from '@/hooks/useScout'
import { POSITIONS } from '@/types/profile'

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#706B56',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          color: '#F4F2EA',
        }}
      >
        {title}
      </p>
    </div>
  )
}

function formatDateAgo(value: string) {
  const now = Date.now()
  const target = new Date(value).getTime()

  if (Number.isNaN(target)) {
    return '-'
  }

  const diffMs = Math.max(0, now - target)
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHour < 24) {
    return `${diffHour}h ago`
  }

  const diffDay = Math.floor(diffHour / 24)

  if (diffDay < 30) {
    return `${diffDay}d ago`
  }

  const diffMonth = Math.floor(diffDay / 30)

  return `${diffMonth}mo ago`
}

export default function ScoutPage() {
  const [q, setQ] = useState('')
  const [position, setPosition] = useState('ALL')
  const [region, setRegion] = useState('')

  const { players, isLoading, error } = useScoutPlayers(q, position, region)

  const totals = useMemo(() => {
    return {
      players: players.length,
      clips: players.reduce((sum, player) => sum + player.clips_count, 0),
      highlights: players.reduce((sum, player) => sum + player.highlights_count, 0),
    }
  }, [players])

  return (
    <>
      <NavHeader title="Scout View" />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <SectionHeader label="DISCOVERY" title="선수 검색 및 필터" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="이름 또는 핸들 검색…"
            aria-label="선수 이름 또는 핸들 검색"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #2A2F22',
              background: '#12160F',
              color: '#F4F2EA',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
            }}
          />

          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="지역 필터 (예: 서울, 경기)…"
            aria-label="지역 필터"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #2A2F22',
              background: '#12160F',
              color: '#F4F2EA',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
            }}
          />

          <div style={{ display: 'flex', overflowX: 'auto', gap: '6px', paddingBottom: '2px' }}>
            {['ALL', ...POSITIONS.map((positionItem) => positionItem.value)].map((item) => {
              const active = position === item

              return (
                <button
                  key={item}
                  onClick={() => setPosition(item)}
                  style={{
                    border: `1px solid ${active ? 'rgba(212,168,67,0.45)' : '#2A2F22'}`,
                    background: active ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#F0D078' : '#A8A28A',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    whiteSpace: 'nowrap',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
          <div style={{ background: '#1A1E16', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '10px', padding: '10px' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', marginBottom: '4px' }}>PLAYERS</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 900, color: '#D4A843' }}>{totals.players}</p>
          </div>
          <div style={{ background: '#1A1E16', border: '1px solid rgba(91,191,207,0.2)', borderRadius: '10px', padding: '10px' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', marginBottom: '4px' }}>CLIPS</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 900, color: '#5BBFCF' }}>{totals.clips}</p>
          </div>
          <div style={{ background: '#1A1E16', border: '1px solid rgba(107,203,119,0.2)', borderRadius: '10px', padding: '10px' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', marginBottom: '4px' }}>HIGHLIGHTS</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 900, color: '#6BCB77' }}>{totals.highlights}</p>
          </div>
        </div>

        <SectionHeader label="RESULTS" title="선수 리스트" />

        {isLoading && (
          <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#706B56', padding: '20px 0' }}>
            LOADING SCOUT DATA…
          </div>
        )}

        {!isLoading && error && (
          <div style={{ background: 'rgba(232,93,93,0.1)', border: '1px solid rgba(232,93,93,0.22)', color: '#E85D5D', borderRadius: '10px', padding: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
            {error}
          </div>
        )}

        {!isLoading && !error && players.length === 0 && (
          <div style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#706B56', border: '1px dashed #2A2F22', borderRadius: '10px', padding: '20px 12px' }}>
            조건에 맞는 선수가 없습니다
          </div>
        )}

        {!isLoading && !error && players.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/p/${player.handle}`}
                style={{
                  textDecoration: 'none',
                  background: '#1A1E16',
                  border: '1px solid #2A2F22',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #B8922E, #D4A843)' }}>
                  {player.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={player.profile_image_url} alt={player.display_name} width={52} height={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 900, color: '#0B0E11' }}>
                      {player.display_name[0]}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F4F2EA' }}>{player.display_name}</p>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56' }}>{formatDateAgo(player.updated_at)}</span>
                  </div>

                  <p style={{ margin: '3px 0 0', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#A8A28A' }}>
                    @{player.handle} · {player.position || 'POS 미등록'} · {player.region || '지역 미등록'}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '20px', background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', color: '#F0D078', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                      🎬 {player.highlights_count}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '20px', background: 'rgba(91,191,207,0.12)', border: '1px solid rgba(91,191,207,0.25)', color: '#5BBFCF', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                      📹 {player.clips_count}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '20px', background: 'rgba(107,203,119,0.12)', border: '1px solid rgba(107,203,119,0.25)', color: '#6BCB77', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                      🏷️ {player.tags_active_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
