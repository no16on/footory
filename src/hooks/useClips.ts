'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Clip, Highlight } from '@/types/clip'

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClips = useCallback(async () => {
    setIsLoading(true)
    const res = await fetch('/api/clips')
    const json = await res.json()
    if (json.error) {
      setError(json.error)
    } else {
      setClips(json.data ?? [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchClips() }, [fetchClips])

  async function deleteClip(id: string) {
    const res = await fetch(`/api/clips/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.error) {
      setClips((prev) => prev.filter((c) => c.id !== id))
    }
    return json
  }

  return { clips, isLoading, error, refetch: fetchClips, deleteClip }
}

export function useHighlights(playerId?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchHighlights = useCallback(async () => {
    if (!playerId) return
    setIsLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('highlights')
      .select('*')
      .eq('player_id', playerId)
      .order('featured_order', { ascending: true, nullsFirst: false })
    setHighlights((data as unknown as Highlight[]) ?? [])
    setIsLoading(false)
  }, [playerId])

  useEffect(() => { fetchHighlights() }, [fetchHighlights])

  async function toggleFeature(highlightId: string, isFeatured: boolean) {
    const res = await fetch(`/api/highlights/${highlightId}/feature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured }),
    })
    const json = await res.json()
    if (json.success) await fetchHighlights()
    return json
  }

  return { highlights, isLoading, refetch: fetchHighlights, toggleFeature }
}
