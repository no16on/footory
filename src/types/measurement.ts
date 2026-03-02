import type { Database } from './database'

export type MeasurementType = Database['public']['Tables']['measurement_types']['Row']
export type MeasurementRecord = Database['public']['Tables']['measurement_records']['Row']
export type MedalRule = Database['public']['Tables']['medal_rules']['Row']
export type PlayerMedal = Database['public']['Tables']['player_medals']['Row']

export type MeasurementTypeId =
  | 'JUGGLING'
  | 'SPRINT_30M'
  | 'RUN_1000M'
  | 'DRIBBLE_SLALOM'
  | 'SHOT_SPEED'

export type MeasurementConditionOperator = 'GTE' | 'LTE'

export type AttemptContext = 'TRAINING' | 'MATCH' | 'TEST'

export const ATTEMPT_CONTEXT_LABELS: Record<AttemptContext, string> = {
  TRAINING: '훈련',
  MATCH: '경기',
  TEST: '테스트',
}

export const MEASUREMENT_TYPE_META: Record<MeasurementTypeId, {
  label: string
  shortLabel: string
  color: string
  unitLabel: string
  inputPlaceholder: string
}> = {
  JUGGLING: {
    label: '저글링',
    shortLabel: 'JUGGLING',
    color: '#D4A843',
    unitLabel: 'reps',
    inputPlaceholder: '예: 120',
  },
  SPRINT_30M: {
    label: '30m 스프린트',
    shortLabel: 'SPRINT',
    color: '#E85D5D',
    unitLabel: 's',
    inputPlaceholder: '예: 5.12',
  },
  RUN_1000M: {
    label: '1000m 달리기',
    shortLabel: '1000M',
    color: '#6BCB77',
    unitLabel: 'mm:ss',
    inputPlaceholder: '예: 04:10',
  },
  DRIBBLE_SLALOM: {
    label: '드리블 슬라롬',
    shortLabel: 'SLALOM',
    color: '#5BBFCF',
    unitLabel: 's',
    inputPlaceholder: '예: 8.64',
  },
  SHOT_SPEED: {
    label: '슈팅 속도',
    shortLabel: 'SHOT',
    color: '#E8943A',
    unitLabel: 'km/h',
    inputPlaceholder: '예: 84',
  },
}

export function parseRunTimeToSeconds(value: string): number {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})$/)
  if (!match) {
    throw new Error('1000m 기록은 mm:ss 형식으로 입력해주세요 (예: 04:10)')
  }

  const minutes = Number(match[1])
  const seconds = Number(match[2])

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds >= 60) {
    throw new Error('1000m 기록 형식이 올바르지 않습니다')
  }

  return minutes * 60 + seconds
}

export function formatSecondsToRunTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function normalizeMeasurementValue(typeId: string, valueDisplayRaw: string): {
  valueDisplay: string
  valueNormalized: number
} {
  const type = typeId as MeasurementTypeId
  const valueDisplay = valueDisplayRaw.trim()

  if (!valueDisplay) {
    throw new Error('기록 값을 입력해주세요')
  }

  if (type === 'RUN_1000M') {
    const normalized = parseRunTimeToSeconds(valueDisplay)
    return { valueDisplay: formatSecondsToRunTime(normalized), valueNormalized: normalized }
  }

  const normalized = Number(valueDisplay)

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('기록 값은 0보다 큰 숫자여야 합니다')
  }

  if (type === 'JUGGLING' || type === 'SHOT_SPEED') {
    return {
      valueDisplay: String(Math.round(normalized)),
      valueNormalized: Math.round(normalized),
    }
  }

  return {
    valueDisplay: normalized.toFixed(2),
    valueNormalized: Number(normalized.toFixed(2)),
  }
}

export function formatMeasurementValue(typeId: string, record: Pick<MeasurementRecord, 'value_display' | 'value_normalized'>): string {
  const type = typeId as MeasurementTypeId

  if (type === 'RUN_1000M') {
    return record.value_display || formatSecondsToRunTime(Number(record.value_normalized))
  }

  return record.value_display
}

export function isBetterRecord(
  conditionOperator: string,
  candidateValue: number,
  baselineValue: number
): boolean {
  if (conditionOperator === 'GTE') {
    return candidateValue > baselineValue
  }

  return candidateValue < baselineValue
}
