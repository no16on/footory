import { MEASUREMENT_TYPE_META } from '@/types/measurement'

type MedalItem = {
  id: string
  is_featured: boolean
  earned_at: string
  medal_rules: {
    id: string
    type_id: string
    display_name: string
    threshold_value: number
    sort_order: number
  } | null
  measurement_records?: {
    id: string
    type_id: string
    value_display: string
    value_normalized: number
    recorded_at: string
  } | null
}

interface MedalShowcaseProps {
  medals: MedalItem[]
  isOwner?: boolean
  allowManage?: boolean
  onToggleFeatured?: (id: string, next: boolean) => Promise<void> | void
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export function MedalShowcase({
  medals,
  isOwner,
  allowManage = false,
  onToggleFeatured,
}: MedalShowcaseProps) {
  if (medals.length === 0) {
    return (
      <div
        style={{
          background: '#12160F',
          borderRadius: '10px',
          border: '1px dashed rgba(212,168,67,0.15)',
          padding: '18px',
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
          {isOwner ? '측정 기록을 입력하면 자동으로 메달을 획득해요' : '획득한 메달이 없습니다'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {medals.map((medal) => {
        const rule = medal.medal_rules
        const color = rule ? (MEASUREMENT_TYPE_META[rule.type_id as keyof typeof MEASUREMENT_TYPE_META]?.color ?? '#D4A843') : '#D4A843'

        return (
          <div
            key={medal.id}
            style={{
              background: '#1A1E16',
              borderRadius: '10px',
              border: medal.is_featured
                ? '1px solid rgba(212,168,67,0.35)'
                : '1px solid rgba(255,255,255,0.05)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${color}20`,
                border: `1px solid ${color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '16px' }}>🏅</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#F4F2EA',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {rule?.display_name ?? 'Medal'}
              </div>
              <div
                style={{
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    color: '#706B56',
                  }}
                >
                  {formatDate(medal.earned_at)}
                </span>
                {medal.measurement_records?.value_display && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: color,
                    }}
                  >
                    RECORD {medal.measurement_records.value_display}
                  </span>
                )}
              </div>
            </div>

            {allowManage && onToggleFeatured && (
              <button
                onClick={() => onToggleFeatured(medal.id, !medal.is_featured)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: medal.is_featured ? 'rgba(212,168,67,0.18)' : 'rgba(255,255,255,0.04)',
                  padding: '6px 8px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: medal.is_featured ? '#F0D078' : '#706B56',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                }}
              >
                {medal.is_featured ? 'FEATURED' : 'PIN'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
