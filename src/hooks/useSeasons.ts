'use client'

import { useState, useEffect, useCallback } from 'react'

export type Season = {
  id: string
  player_id: string
  year: number
  team_name_snapshot: string | null
  competitions: string | null
  notes: string | null
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSeasons = useCallback(async () => {
    setIsLoading(true)
    const res = await fetch('/api/seasons')
    const json = await res.json()
    if (json.error) {
      setError(json.error)
    } else {
      setSeasons(json.data ?? [])
      setError(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchSeasons() }, [fetchSeasons])

  async function addSeason(data: { year: number; team_name_snapshot?: string; competitions?: string; notes?: string }) {
    const res = await fetch('/api/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!json.error) {
      await fetchSeasons()
    }
    return json
  }

  async function deleteSeason(id: string) {
    const res = await fetch(`/api/seasons?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.error) {
      setSeasons((prev) => prev.filter((s) => s.id !== id))
    }
    return json
  }

  return { seasons, isLoading, error, addSeason, deleteSeason, refetch: fetchSeasons }
}
