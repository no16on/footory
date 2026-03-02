'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { MedalShowcase } from '@/components/profile/MedalShowcase'
import { useMeasurements } from '@/hooks/useMeasurements'
import {
  ATTEMPT_CONTEXT_LABELS,
  formatMeasurementValue,
  isBetterRecord,
  MEASUREMENT_TYPE_META,
  type AttemptContext,
} from '@/types/measurement'

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export default function MeasurementsPage() {
  const router = useRouter()
  const { types, records, medals, isLoading, error, refetch, toggleMedalFeatured } = useMeasurements()
  const [notice, setNotice] = useState<string | null>(null)

  const totals = useMemo(() => {
    const featuredCount = medals.filter((medal) => medal.is_featured).length

    return {
      records: records.length,
      medals: medals.length,
      featuredMedals: featuredCount,
    }
  }, [records.length, medals])

  const perType = useMemo(() => {
    return types
      .map((type) => {
        const ownRecords = records.filter((record) => record.type_id === type.id)
        const latest = ownRecords[0] ?? null

        let best = ownRecords[0] ?? null

        for (let index = 1; index < ownRecords.length; index += 1) {
          const current = ownRecords[index]

          if (best && isBetterRecord(type.condition_operator, current.value_normalized, best.value_normalized)) {
            best = current
          }
        }

        return {
          type,
          count: ownRecords.length,
          latest,
          best,
        }
      })
      .sort((a, b) => a.type.sort_order - b.type.sort_order)
  }, [types, records])

  async function handleToggleFeatured(id: string, next: boolean) {
    const result = await toggleMedalFeatured(id, next)

    if (result.error) {
      setNotice(result.error)
      return
    }

    setNotice(next ? '대표 메달로 설정했습니다' : '대표 메달에서 해제했습니다')
    window.setTimeout(() => setNotice(null), 1800)
  }

  return (
    <>
      <NavHeader
        title="측정 기록"
        rightAction={
          <button
            onClick={() => router.push('/measurements/add')}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: '1px solid rgba(212,168,67,0.35)',
              background: 'rgba(212,168,67,0.12)',
              color: '#F0D078',
              fontSize: '15px',
              fontWeight: 800,
              lineHeight: '18px',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="측정 기록 추가"
          >
            +
          </button>
        }
      />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {notice && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(212,168,67,0.2)',
              background: 'rgba(212,168,67,0.08)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: '#F0D078',
            }}
          >
            {notice}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              padding: '28px 0',
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              color: '#706B56',
            }}
          >
            LOADING...
          </div>
        )}

        {!isLoading && error && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid rgba(232,93,93,0.25)',
              background: 'rgba(232,93,93,0.1)',
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#E85D5D',
                marginBottom: '10px',
              }}
            >
              {error}
            </p>
            <button
              onClick={refetch}
              style={{
                border: '1px solid rgba(232,93,93,0.3)',
                background: 'rgba(232,93,93,0.16)',
                color: '#F4F2EA',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              <div style={{ background: '#1A1E16', border: '1px solid rgba(212,168,67,0.12)', borderRadius: '10px', padding: '10px' }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Records</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '22px', fontWeight: 900, color: '#D4A843' }}>{totals.records}</p>
              </div>
              <div style={{ background: '#1A1E16', border: '1px solid rgba(107,203,119,0.14)', borderRadius: '10px', padding: '10px' }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Medals</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '22px', fontWeight: 900, color: '#6BCB77' }}>{totals.medals}</p>
              </div>
              <div style={{ background: '#1A1E16', border: '1px solid rgba(232,148,58,0.14)', borderRadius: '10px', padding: '10px' }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Featured</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '22px', fontWeight: 900, color: '#E8943A' }}>{totals.featuredMedals}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>MEDALS</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F4F2EA' }}>획득 메달 관리</p>
              </div>
              <MedalShowcase
                medals={medals}
                isOwner
                allowManage
                onToggleFeatured={handleToggleFeatured}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>MEASUREMENTS</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F4F2EA' }}>종목별 기록</p>
              </div>

              {perType.map((entry) => {
                const color = MEASUREMENT_TYPE_META[entry.type.id as keyof typeof MEASUREMENT_TYPE_META]?.color ?? '#D4A843'

                return (
                  <div
                    key={entry.type.id}
                    style={{
                      background: '#1A1E16',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#F4F2EA',
                          }}
                        >
                          {entry.type.display_name}
                        </p>
                        <p
                          style={{
                            marginTop: '2px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '10px',
                            color: '#706B56',
                          }}
                        >
                          {entry.count} RECORDS
                        </p>
                      </div>

                      <div
                        style={{
                          padding: '4px 9px',
                          borderRadius: '20px',
                          border: `1px solid ${color}40`,
                          background: `${color}18`,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 700,
                          color,
                        }}
                      >
                        {entry.type.condition_operator === 'GTE' ? 'HIGHER BETTER' : 'LOWER BETTER'}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '8px',
                      }}
                    >
                      <div style={{ background: '#12160F', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Best</p>
                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 900, color: entry.best ? color : '#706B56' }}>
                          {entry.best ? formatMeasurementValue(entry.type.id, entry.best) : '-'}
                        </p>
                      </div>

                      <div style={{ background: '#12160F', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Latest</p>
                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 900, color: entry.latest ? '#F4F2EA' : '#706B56' }}>
                          {entry.latest ? formatMeasurementValue(entry.type.id, entry.latest) : '-'}
                        </p>
                        {entry.latest && (
                          <p style={{ marginTop: '2px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56' }}>
                            {formatDate(entry.latest.recorded_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {entry.latest?.attempt_context && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56' }}>
                        CONTEXT {ATTEMPT_CONTEXT_LABELS[entry.latest.attempt_context as AttemptContext] ?? entry.latest.attempt_context}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => router.push('/measurements/add')}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 16px',
                background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                color: '#0B0E11',
                cursor: 'pointer',
              }}
            >
              + 새 측정 기록 추가
            </button>
          </>
        )}
      </div>
    </>
  )
}
