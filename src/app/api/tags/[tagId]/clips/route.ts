import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// GET /api/tags/[tagId]/clips — player's clips for a specific tag
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const { tagId } = await params
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

  // Get all clips tagged with this tag for this player
  const { data, error } = await supabase
    .from('clip_tags')
    .select('clip_id, tag_id, is_top_clip, clips(*, highlights(*))')
    .eq('tag_id', tagId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter to only this player's clips (clip.player_id === player.id)
  const filtered = (data ?? []).filter((ct: any) => ct.clips?.player_id === player.id)

  // Sort: top clip first, then by created_at desc
  filtered.sort((a: any, b: any) => {
    if (a.is_top_clip && !b.is_top_clip) return -1
    if (!a.is_top_clip && b.is_top_clip) return 1
    const da = new Date(a.clips?.created_at ?? 0).getTime()
    const db2 = new Date(b.clips?.created_at ?? 0).getTime()
    return db2 - da
  })

  return NextResponse.json({ data: filtered })
}

// POST /api/tags/[tagId]/clips — add tag to a clip
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const { tagId } = await params
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

  const { clipId } = await req.json()

  // Verify clip ownership
  const { data: clip } = await supabase
    .from('clips')
    .select('id')
    .eq('id', clipId)
    .eq('player_id', player.id)
    .single()
  if (!clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })

  const { error } = await supabase
    .from('clip_tags')
    .upsert({ clip_id: clipId, tag_id: tagId, is_top_clip: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/tags/[tagId]/clips — remove tag from a clip
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const { tagId } = await params
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

  const { clipId } = await req.json()

  // Verify clip ownership via join
  const { data: clip } = await supabase
    .from('clips')
    .select('id')
    .eq('id', clipId)
    .eq('player_id', player.id)
    .single()
  if (!clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })

  const { error } = await supabase
    .from('clip_tags')
    .delete()
    .eq('clip_id', clipId)
    .eq('tag_id', tagId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
