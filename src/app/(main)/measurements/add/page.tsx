'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { useMeasurements } from '@/hooks/useMeasurements'
import { ATTEMPT_CONTEXT_LABELS, MEASUREMENT_TYPE_META, type AttemptContext } from '@/types/measurement'

const CONTEXT_OPTIONS: AttemptContext[] = ['TRAINING', 'MATCH', 'TEST']

function todayISO() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AddMeasurementPage() {
  const router = useRouter()
  const { types, isLoading, error, createMeasurement } = useMeasurements()

  const [typeId, setTypeId] = useState('')
  const [valueDisplay, setValueDisplay] = useState('')
  const [attemptContext, setAttemptContext] = useState<AttemptContext>('TRAINING')
  const [recordedAt, setRecordedAt] = useState(todayISO())
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successState, setSuccessState] = useState<{
    medalNames: string[]
    warning: string | null
  } | null>(null)

  useEffect(() => {
    if (!typeId && types.length > 0) {
      setTypeId(types[0].id)
    }
  }, [types, typeId])

  const selectedType = useMemo(() => {
    return types.find((type) => type.id === typeId) ?? null
  }, [types, typeId])

  async function handleSubmit() {
    if (!typeId) {
      setSubmitError('종목을 선택해주세요')
      return
    }

    if (!valueDisplay.trim()) {
      setSubmitError('기록 값을 입력해주세요')
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const result = await createMeasurement({
        typeId,
        valueDisplay,
        attemptContext,
        recordedAt,
        location: location.trim() || null,
        note: note.trim() || null,
      })

      if (result.error || !result.data) {
        setSubmitError(result.error ?? '측정 기록 저장에 실패했습니다')
        return
      }

      const medalNames = (result.data.newMedals ?? [])
        .map((medal) => medal.medal_rules?.display_name)
        .filter((name): name is string => Boolean(name))

      setSuccessState({
        medalNames,
        warning: result.data.warning,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <NavHeader title="측정 기록 추가" showBack onBack={() => router.back()} />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {isLoading && (
          <div
            style={{
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#706B56',
              letterSpacing: '1px',
              padding: '30px 0',
            }}
          >
            LOADING...
          </div>
        )}

        {!isLoading && error && (
          <div
            style={{
              padding: '14px',
              background: 'rgba(232,93,93,0.1)',
              border: '1px solid rgba(232,93,93,0.24)',
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#E85D5D',
            }}
          >
            {error}
          </div>
        )}

        {!isLoading && !error && successState && (
          <div
            style={{
              background: '#1A1E16',
              border: '1px solid rgba(107,203,119,0.22)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 800, color: '#F4F2EA' }}>
              기록이 저장되었습니다
            </p>

            {successState.medalNames.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {successState.medalNames.map((name) => (
                  <span
                    key={name}
                    style={{
                      borderRadius: '20px',
                      border: '1px solid rgba(212,168,67,0.38)',
                      background: 'rgba(212,168,67,0.14)',
                      padding: '5px 10px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#F0D078',
                    }}
                  >
                    🏅 {name}
                  </span>
                ))}
              </div>
            )}

            {successState.warning && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#A8A28A' }}>
                {successState.warning}
              </p>
            )}

            <button
              onClick={() => router.replace('/measurements')}
              style={{
                marginTop: '4px',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 800,
                color: '#0B0E11',
                cursor: 'pointer',
              }}
            >
              측정 기록 화면으로 이동
            </button>
          </div>
        )}

        {!isLoading && !error && !successState && (
          <>
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>NEW RECORD</p>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 800, color: '#F4F2EA' }}>
                새로운 측정 결과를 추가하세요
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#1A1E16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>종목</label>
                <select
                  value={typeId}
                  onChange={(event) => {
                    setTypeId(event.target.value)
                    setValueDisplay('')
                  }}
                  style={{
                    width: '100%',
                    background: '#12160F',
                    border: '1px solid #2A2F22',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#F4F2EA',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    outline: 'none',
                    appearance: 'none',
                  }}
                >
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>기록 값</label>
                <input
                  value={valueDisplay}
                  onChange={(event) => setValueDisplay(event.target.value)}
                  placeholder={selectedType ? (MEASUREMENT_TYPE_META[selectedType.id as keyof typeof MEASUREMENT_TYPE_META]?.inputPlaceholder ?? '') : ''}
                  style={{
                    width: '100%',
                    background: '#12160F',
                    border: '1px solid #2A2F22',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#F4F2EA',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {selectedType && (
                  <p style={{ marginTop: '5px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56' }}>
                    UNIT {selectedType.unit}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>상황</label>
                  <select
                    value={attemptContext}
                    onChange={(event) => setAttemptContext(event.target.value as AttemptContext)}
                    style={{
                      width: '100%',
                      background: '#12160F',
                      border: '1px solid #2A2F22',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#F4F2EA',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      outline: 'none',
                      appearance: 'none',
                    }}
                  >
                    {CONTEXT_OPTIONS.map((context) => (
                      <option key={context} value={context}>
                        {ATTEMPT_CONTEXT_LABELS[context]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>측정일</label>
                  <input
                    type="date"
                    value={recordedAt}
                    onChange={(event) => setRecordedAt(event.target.value)}
                    style={{
                      width: '100%',
                      background: '#12160F',
                      border: '1px solid #2A2F22',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#F4F2EA',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>장소</label>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="예: 잠실 보조구장"
                  style={{
                    width: '100%',
                    background: '#12160F',
                    border: '1px solid #2A2F22',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#F4F2EA',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>메모</label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="측정 당시 컨디션, 참고 정보"
                  style={{
                    width: '100%',
                    background: '#12160F',
                    border: '1px solid #2A2F22',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#F4F2EA',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {submitError && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(232,93,93,0.24)',
                  background: 'rgba(232,93,93,0.1)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#E85D5D',
                }}
              >
                {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 16px',
                background: isSubmitting
                  ? 'rgba(212,168,67,0.2)'
                  : 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(212,168,67,0.25)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                color: isSubmitting ? '#706B56' : '#0B0E11',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '저장 중...' : '기록 저장'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
