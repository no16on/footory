'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MeasurementRecord, MeasurementType } from '@/types/measurement'

export type MedalWithRule = {
  id: string
  player_id: string
  medal_rule_id: string
  earned_from_record_id: string | null
  earned_at: string
  verification_status_snapshot: string | null
  is_featured: boolean
  medal_rules: {
    id: string
    type_id: string
    display_name: string
    threshold_value: number
    sort_order: number
  } | null
  measurement_records: {
    id: string
    type_id: string
    value_display: string
    value_normalized: number
    recorded_at: string
  } | null
}

export type CreateMeasurementInput = {
  typeId: string
  valueDisplay: string
  attemptContext?: string | null
  recordedAt: string
  location?: string | null
  note?: string | null
  evidenceMediaUrl?: string | null
}

export function useMeasurements() {
  const [types, setTypes] = useState<MeasurementType[]>([])
  const [records, setRecords] = useState<MeasurementRecord[]>([])
  const [medals, setMedals] = useState<MedalWithRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [measurementsRes, medalsRes] = await Promise.all([
        fetch('/api/measurements'),
        fetch('/api/medals/me'),
      ])

      const measurementsJson = await measurementsRes.json()
      const medalsJson = await medalsRes.json()

      if (measurementsJson.error) {
        setError(measurementsJson.error)
        return
      }

      if (medalsJson.error) {
        setError(medalsJson.error)
        return
      }

      setTypes(measurementsJson.data?.types ?? [])
      setRecords(measurementsJson.data?.records ?? [])
      setMedals(medalsJson.data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load measurements')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const recordsByType = useMemo(() => {
    const grouped: Record<string, MeasurementRecord[]> = {}

    for (const record of records) {
      if (!grouped[record.type_id]) {
        grouped[record.type_id] = []
      }

      grouped[record.type_id].push(record)
    }

    return grouped
  }, [records])

  async function createMeasurement(input: CreateMeasurementInput) {
    const res = await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchAll()
    }

    return json as {
      data: {
        record: MeasurementRecord
        newMedals: MedalWithRule[]
        warning: string | null
      } | null
      error: string | null
    }
  }

  async function toggleMedalFeatured(medalId: string, isFeatured: boolean) {
    const res = await fetch(`/api/medals/${medalId}/feature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured }),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchAll()
    }

    return json as {
      data: MedalWithRule | null
      error: string | null
    }
  }

  return {
    types,
    records,
    medals,
    recordsByType,
    isLoading,
    error,
    refetch: fetchAll,
    createMeasurement,
    toggleMedalFeatured,
  }
}
