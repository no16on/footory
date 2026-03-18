import Link from 'next/link'
import { isBetterRecord, formatMeasurementValue, MEASUREMENT_TYPE_META } from '@/types/measurement'

interface MeasurementTypeLike {
  id: string
  display_name: string
  unit: string
  condition_operator: string
  sort_order: number
}

interface MeasurementRecordLike {
  id: string
  type_id: string
  value_display: string
  value_normalized: number
  verification_status: string | null
  recorded_at: string
}

interface MedalLike {
  id: string
  is_featured: boolean
  medal_rules: {
    id: string
    type_id: string
    display_name: string
    threshold_value: number
    sort_order: number
  } | null
}

interface MeasuredStatsProps {
  types: MeasurementTypeLike[]
  records: MeasurementRecordLike[]
  medals: MedalLike[]
  isOwner?: boolean
}

function computeBestRecords(types: MeasurementTypeLike[], records: MeasurementRecordLike[]) {
  const bestByType: Record<string, MeasurementRecordLike | undefined> = {}

  for (const type of types) {
    const ownRecords = records.filter((record) => record.type_id === type.id)

    if (ownRecords.length === 0) {
      bestByType[type.id] = undefined
      continue
    }

    let best = ownRecords[0]

    for (let index = 1; index < ownRecords.length; index += 1) {
      const current = ownRecords[index]

      if (isBetterRecord(type.condition_operator, current.value_normalized, best.value_normalized)) {
        best = current
      }
    }

    bestByType[type.id] = best
  }

  return bestByType
}

export function MeasuredStats({ types, records, medals, isOwner }: MeasuredStatsProps) {
  const sortedTypes = [...types].sort((a, b) => a.sort_order - b.sort_order)
  const bestByType = computeBestRecords(sortedTypes, records)
  const featuredMedals = medals.filter((medal) => medal.is_featured).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            MEASURED STATS
          </div>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F2EA',
            }}
          >
            객관 측정치 & 메달
          </div>
        </div>

        {isOwner && (
          <Link
            href="/measurements"
            style={{
              fontSize: '12px',
              color: '#D4A843',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
          >
            기록 관리
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <div
          style={{
            background: '#12160F',
            borderRadius: '12px',
            border: '1px dashed rgba(212,168,67,0.15)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📏</div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#706B56',
              margin: 0,
            }}
          >
            {isOwner ? '첫 측정 기록을 추가해보세요' : '아직 측정 기록이 없습니다'}
          </p>
          {isOwner && (
            <Link
              href="/measurements"
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
                textDecoration: 'none',
              }}
            >
              측정 기록 추가
            </Link>
          )}
        </div>
      ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {sortedTypes.map((type) => {
          const best = bestByType[type.id]
          const count = records.filter((record) => record.type_id === type.id).length
          const color = MEASUREMENT_TYPE_META[type.id as keyof typeof MEASUREMENT_TYPE_META]?.color ?? '#D4A843'

          return (
            <div
              key={type.id}
              style={{
                background: '#1A1E16',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#706B56',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                }}
              >
                {type.display_name}
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '24px',
                      fontWeight: 900,
                      color: best ? color : '#706B56',
                      lineHeight: 1,
                    }}
                  >
                    {best ? formatMeasurementValue(type.id, best) : '-'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9px',
                      color: '#706B56',
                    }}
                  >
                    {type.unit}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '9px',
                    color: '#706B56',
                  }}
                >
                  BEST / {count} RECORD{count === 1 ? '' : 'S'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      <div
        style={{
          background: '#12160F',
          borderRadius: '10px',
          border: '1px solid rgba(212,168,67,0.12)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#706B56',
            letterSpacing: '1px',
          }}
        >
          MEDAL SHOWCASE
        </div>

        {featuredMedals.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {featuredMedals.map((medal) => {
              const typeId = medal.medal_rules?.type_id
              const color = typeId
                ? (MEASUREMENT_TYPE_META[typeId as keyof typeof MEASUREMENT_TYPE_META]?.color ?? '#D4A843')
                : '#D4A843'

              return (
                <div
                  key={medal.id}
                  style={{
                    borderRadius: '20px',
                    border: `1px solid ${color}44`,
                    background: `${color}18`,
                    padding: '5px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>🏅</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color,
                      fontWeight: 700,
                    }}
                  >
                    {medal.medal_rules?.display_name ?? 'Medal'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: '#706B56',
            }}
          >
            {isOwner ? '측정 기록을 추가하면 메달이 자동으로 생성됩니다' : '아직 대표 메달이 없습니다'}
          </div>
        )}
      </div>
    </div>
  )
}
