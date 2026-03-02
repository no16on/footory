'use client'

import { useState, useEffect, useCallback } from 'react'
import { TAG_LIST } from '@/types/clip'

export type TagWithStats = {
  id: string
  display_name: string
  display_name_en: string | null
  icon: string | null
  sort_order: number
  clip_count: number
  top_clip_url: string | null
  top_clip_thumbnail: string | null
}

export type TagClipEntry = {
  clip_id: string
  tag_id: string
  is_top_clip: boolean
  clips: {
    id: string
    video_url: string
    thumbnail_url: string | null
    duration_seconds: number | null
    memo: string | null
    created_at: string
    player_id: string
    highlights: Array<{
      id: string
      video_url: string
      thumbnail_url: string | null
      start_seconds: number
      end_seconds: number
      duration_seconds: number | null
      is_featured: boolean
      featured_order: number | null
    }>
  } | null
}

// Returns the player's tag portfolio: each tag with clip count + top clip
export function useTagPortfolio(playerId?: string) {
  const [tagStats, setTagStats] = useState<TagWithStats[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!playerId) return
    setIsLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // Get player's clips with tags
    const { data: clipsWithTags } = await supabase
      .from('clip_tags')
      .select('clip_id, tag_id, is_top_clip, clips(id, video_url, thumbnail_url, player_id)')

    const rows = (clipsWithTags as unknown as Array<{ tag_id: string; is_top_clip: boolean; clips: { id: string; video_url: string; thumbnail_url: string | null; player_id: string } | null }>) ?? []
    const mine = rows.filter((ct) => ct.clips?.player_id === playerId)

    // Group by tag
    const byTag: Record<string, { count: number; topUrl: string | null; topThumb: string | null }> = {}
    for (const ct of mine) {
      const tid = ct.tag_id
      if (!byTag[tid]) byTag[tid] = { count: 0, topUrl: null, topThumb: null }
      byTag[tid].count++
      if (ct.is_top_clip) {
        byTag[tid].topUrl = ct.clips?.video_url ?? null
        byTag[tid].topThumb = ct.clips?.thumbnail_url ?? null
      }
    }

    // Build from TAG_LIST (always show all 6 tags)
    const stats: TagWithStats[] = TAG_LIST.map((t) => ({
      id: t.id,
      display_name: t.display_name,
      display_name_en: null,
      icon: t.icon,
      sort_order: TAG_LIST.findIndex((x) => x.id === t.id),
      clip_count: byTag[t.id]?.count ?? 0,
      top_clip_url: byTag[t.id]?.topUrl ?? null,
      top_clip_thumbnail: byTag[t.id]?.topThumb ?? null,
    }))

    setTagStats(stats)
    setIsLoading(false)
  }, [playerId])

  useEffect(() => { fetch() }, [fetch])

  return { tagStats, isLoading, refetch: fetch }
}

// Returns clips for a specific tag (for the tag detail page)
export function useTagClips(tagId: string) {
  const [clips, setClips] = useState<TagClipEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const res = await window.fetch(`/api/tags/${tagId}/clips`)
    const json = await res.json()
    if (json.error) {
      setError(json.error)
    } else {
      setClips(json.data ?? [])
    }
    setIsLoading(false)
  }, [tagId])

  useEffect(() => { fetch() }, [fetch])

  async function setTopClip(clipId: string) {
    const res = await window.fetch(`/api/clips/${clipId}/tags/${tagId}/top`, { method: 'PUT' })
    const json = await res.json()
    if (json.success) await fetch()
    return json
  }

  async function removeTag(clipId: string) {
    const res = await window.fetch(`/api/tags/${tagId}/clips`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId }),
    })
    const json = await res.json()
    if (json.success) await fetch()
    return json
  }

  return { clips, isLoading, error, refetch: fetch, setTopClip, removeTag }
}
