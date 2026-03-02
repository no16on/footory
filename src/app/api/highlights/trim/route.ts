import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const body = await req.json()
  const { clipId, startSeconds, endSeconds, tagIds } = body

  // Validate
  if (endSeconds - startSeconds > 30) {
    return NextResponse.json({ error: '하이라이트는 최대 30초까지 가능합니다' }, { status: 400 })
  }
  if (startSeconds < 0 || endSeconds <= startSeconds) {
    return NextResponse.json({ error: '트림 범위가 올바르지 않습니다' }, { status: 400 })
  }

  // Verify clip belongs to player
  const { data: clip } = await supabase
    .from('clips')
    .select('id, video_url')
    .eq('id', clipId)
    .eq('player_id', player.id)
    .single()
  if (!clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })

  // Check featured slots (max 3)
  const { count: featuredCount } = await supabase
    .from('highlights')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', player.id)
    .eq('is_featured', true)

  const canFeature = (featuredCount ?? 0) < 3

  // Create highlight record (v1: video_url = original clip URL; FFmpeg trim is deferred)
  const { data: highlight, error } = await supabase
    .from('highlights')
    .insert({
      player_id: player.id,
      clip_id: clipId,
      video_url: clip.video_url,
      start_seconds: startSeconds,
      end_seconds: endSeconds,
      is_featured: canFeature, // Auto-feature if slots available
      featured_order: canFeature ? (featuredCount ?? 0) + 1 : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add tags to clip
  if (tagIds && tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId: string) => ({
      clip_id: clipId,
      tag_id: tagId,
      is_top_clip: false,
    }))
    await supabase.from('clip_tags').upsert(tagInserts)
  }

  return NextResponse.json({ data: highlight })
}
