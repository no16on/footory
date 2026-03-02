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
}

export function SeasonHistory({ seasons, isOwner }: SeasonHistoryProps) {
  const sorted = [...seasons].sort((a, b) => b.year - a.year)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Section Header */}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
