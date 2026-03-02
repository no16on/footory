'use client'

import { useState, type ReactNode } from 'react'

interface Season {
  id: string
  year: number
  team_name_snapshot: string | null
  competitions: string | null
  notes: string | null
}

interface SeasonHistoryProps {
  seasons: Season[]
  isOwner?: boolean
  onAdd?: (data: { year: number; team_name_snapshot?: string; competitions?: string }) => Promise<{ error?: string }>
  onDelete?: (id: string) => Promise<{ error?: string }>
}

export function SeasonHistory({ seasons, isOwner, onAdd, onDelete }: SeasonHistoryProps) {
  const sorted = [...seasons].sort((a, b) => b.year - a.year)
  const [showForm, setShowForm] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [teamName, setTeamName] = useState('')
  const [competitions, setCompetitions] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!onAdd || !year) return
    setSaving(true)
    const result = await onAdd({
      year: Number(year),
      team_name_snapshot: teamName || undefined,
      competitions: competitions || undefined,
    })
    setSaving(false)
    if (!result.error) {
      setYear(new Date().getFullYear().toString())
      setTeamName('')
      setCompetitions('')
      setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    if (!onDelete) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#706B56',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            CAREER
          </div>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F2EA',
            }}
          >
            시즌 히스토리
          </div>
        </div>

        {isOwner && onAdd && (
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(212,168,67,0.3)',
              background: 'rgba(212,168,67,0.1)',
              color: '#F0D078',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '2px',
            }}
          >
            {showForm ? '취소' : '+ 시즌 추가'}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            background: '#12160F',
            border: '1px solid rgba(212,168,67,0.2)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  color: '#706B56',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                연도
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={2010}
                max={2035}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#1A1E16',
                  border: '1px solid #2A2F22',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#F4F2EA',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  color: '#706B56',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                팀 이름
              </label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="예: FC 서울 U-15"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#1A1E16',
                  border: '1px solid #2A2F22',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#F4F2EA',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                color: '#706B56',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              대회/리그 (선택)
            </label>
            <input
              value={competitions}
              onChange={(e) => setCompetitions(e.target.value)}
              placeholder="예: 금석배, 화랑대기, 전국유소년"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#1A1E16',
                border: '1px solid #2A2F22',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#F4F2EA',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
              }}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !year}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: saving ? 'rgba(212,168,67,0.3)' : 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
              color: '#0B0E11',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div
          style={{
            background: '#12160F',
            borderRadius: '10px',
            border: '1px dashed rgba(212,168,67,0.15)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#706B56',
              margin: 0,
            }}
          >
            {isOwner ? '시즌 기록을 추가해보세요' : '시즌 기록이 없습니다'}
          </p>
          {isOwner && onAdd && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 16px',
                background: 'rgba(212,168,67,0.12)',
                border: '1px solid rgba(212,168,67,0.3)',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: '#D4A843',
                cursor: 'pointer',
              }}
            >
              + 시즌 추가
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sorted.map((season, idx) => (
            <div
              key={season.id}
              style={{
                display: 'flex',
                gap: '12px',
                paddingBottom: idx < sorted.length - 1 ? '16px' : '0',
              }}
            >
              {/* Timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flexShrink: 0 }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#D4A843',
                    border: '2px solid #0B0E11',
                    zIndex: 1,
                  }}
                />
                {idx < sorted.length - 1 && (
                  <div
                    style={{
                      width: '1px',
                      flex: 1,
                      background: 'rgba(212,168,67,0.2)',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>

              {/* Season content */}
              <div style={{ flex: 1, paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#D4A843',
                        marginBottom: '2px',
                      }}
                    >
                      {season.year}
                    </div>
                    {season.team_name_snapshot && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#F4F2EA',
                          marginBottom: '4px',
                        }}
                      >
                        {season.team_name_snapshot}
                      </div>
                    )}
                    {season.competitions && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: '#A8A28A',
                        }}
                      >
                        {season.competitions}
                      </div>
                    )}
                  </div>

                  {isOwner && onDelete && (
                    <button
                      onClick={() => handleDelete(season.id)}
                      disabled={deletingId === season.id}
                      aria-label="시즌 삭제"
                      style={{
                        flexShrink: 0,
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: '1px solid rgba(232,93,93,0.2)',
                        background: 'rgba(232,93,93,0.08)',
                        color: '#E85D5D',
                        fontSize: '14px',
                        lineHeight: '22px',
                        cursor: 'pointer',
                        padding: 0,
                        opacity: deletingId === season.id ? 0.5 : 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
