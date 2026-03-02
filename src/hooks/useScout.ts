'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ScoutPlayer } from '@/types/scout'

export function useScoutPlayers(
  q: string,
  position: string,
  region: string
) {
  const [players, setPlayers] = useState<ScoutPlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSeqRef = useRef(0)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()

    if (q.trim()) params.set('q', q.trim())
    if (position.trim()) params.set('position', position.trim())
    if (region.trim()) params.set('region', region.trim())

    return params.toString()
  }, [position, q, region])

  useEffect(() => {
    let disposed = false
    const timeout = window.setTimeout(async () => {
      const requestSeq = ++requestSeqRef.current
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/scout/players?${queryString}`)

        const json = await res.json()

        if (disposed || requestSeq !== requestSeqRef.current) {
          return
        }

        if (json.error) {
          setError(json.error)
          setPlayers([])
          return
        }

        setPlayers((json.data ?? []) as ScoutPlayer[])
      } catch (err: unknown) {
        if (disposed || requestSeq !== requestSeqRef.current) return

        setError(err instanceof Error ? err.message : 'Failed to load scout players')
      } finally {
        if (disposed || requestSeq !== requestSeqRef.current) return
        setIsLoading(false)
      }
    }, 200)

    return () => {
      disposed = true
      window.clearTimeout(timeout)
    }
  }, [queryString])

  return {
    players,
    isLoading,
    error,
  }
}
