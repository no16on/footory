import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { ScoutPlayer } from '@/types/scout'

function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll()
        },
        async setAll() {},
      },
    }
  )
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const params = req.nextUrl.searchParams

  const q = String(params.get('q') ?? '').trim()
  const position = String(params.get('position') ?? '').trim().toUpperCase()
  const region = String(params.get('region') ?? '').trim()

  const limitRaw = Number(params.get('limit') ?? 40)
  const limit = Number.isFinite(limitRaw)
    ? Math.min(60, Math.max(1, Math.floor(limitRaw)))
    : 40

  let playersQuery = supabase
    .from('players')
    .select('id, handle, display_name, position, region, bio, profile_image_url, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (q) {
    const keyword = q.replace(/[%_]/g, '')
    playersQuery = playersQuery.or(`display_name.ilike.%${keyword}%,handle.ilike.%${keyword}%`)
  }

  if (position && position !== 'ALL') {
    playersQuery = playersQuery.eq('position', position)
  }

  if (region) {
    playersQuery = playersQuery.ilike('region', `%${region}%`)
  }

  const { data: players, error: playersError } = await playersQuery

  if (playersError) {
    return NextResponse.json({ data: null, error: playersError.message }, { status: 500 })
  }

  const basePlayers = players ?? []
  const playerIds = basePlayers.map((player) => player.id)

  if (playerIds.length === 0) {
    return NextResponse.json({ data: [], error: null })
  }

  const [clipsRes, highlightsRes, featuredRes] = await Promise.all([
    supabase
      .from('clips')
      .select('id, player_id')
      .in('player_id', playerIds),
    supabase
      .from('highlights')
      .select('player_id')
      .in('player_id', playerIds),
    supabase
      .from('highlights')
      .select('player_id, thumbnail_url, duration_seconds, featured_order, created_at')
      .in('player_id', playerIds)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ])

  const clips = clipsRes.data ?? []
  const clipIds = clips.map((clip) => clip.id)
  const highlights = highlightsRes.data ?? []
  const featured = featuredRes.data ?? []
  const clipTags = clipIds.length > 0
    ? (await supabase.from('clip_tags').select('clip_id, tag_id').in('clip_id', clipIds)).data ?? []
    : []

  const clipCountByPlayer = new Map<string, number>()
  const clipIdToPlayerId = new Map<string, string>()

  for (const clip of clips) {
    clipIdToPlayerId.set(clip.id, clip.player_id)
    clipCountByPlayer.set(clip.player_id, (clipCountByPlayer.get(clip.player_id) ?? 0) + 1)
  }

  const highlightCountByPlayer = new Map<string, number>()

  for (const item of highlights) {
    highlightCountByPlayer.set(item.player_id, (highlightCountByPlayer.get(item.player_id) ?? 0) + 1)
  }

  const featuredByPlayer = new Map<string, { thumbnail_url: string | null; duration_seconds: number | null }>()

  for (const item of featured) {
    if (!featuredByPlayer.has(item.player_id)) {
      featuredByPlayer.set(item.player_id, {
        thumbnail_url: item.thumbnail_url,
        duration_seconds: item.duration_seconds,
      })
    }
  }

  const tagSetByPlayer = new Map<string, Set<string>>()

  for (const item of clipTags) {
    const playerId = clipIdToPlayerId.get(item.clip_id)

    if (!playerId) {
      continue
    }

    const existing = tagSetByPlayer.get(playerId) ?? new Set<string>()
    existing.add(item.tag_id)
    tagSetByPlayer.set(playerId, existing)
  }

  const data: ScoutPlayer[] = basePlayers.map((player) => ({
    id: player.id,
    handle: player.handle,
    display_name: player.display_name,
    position: player.position,
    region: player.region,
    bio: player.bio,
    profile_image_url: player.profile_image_url,
    clips_count: clipCountByPlayer.get(player.id) ?? 0,
    highlights_count: highlightCountByPlayer.get(player.id) ?? 0,
    tags_active_count: tagSetByPlayer.get(player.id)?.size ?? 0,
    featured_thumbnail_url: featuredByPlayer.get(player.id)?.thumbnail_url ?? null,
    featured_duration_seconds: featuredByPlayer.get(player.id)?.duration_seconds ?? null,
    updated_at: player.updated_at,
  }))

  return NextResponse.json(
    { data, error: null },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
  )
}
