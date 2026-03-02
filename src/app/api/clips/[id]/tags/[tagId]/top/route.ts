import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// PUT /api/clips/[id]/tags/[tagId]/top — set clip as top for tag
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params
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

  // Verify clip belongs to player
  const { data: clip } = await supabase
    .from('clips')
    .select('id')
    .eq('id', id)
    .eq('player_id', player.id)
    .single()
  if (!clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })

  // Get all clip_ids for this tag + player to unset previous top
  const { data: playerClips } = await supabase
    .from('clips')
    .select('id')
    .eq('player_id', player.id)

  const playerClipIds = (playerClips ?? []).map((c: any) => c.id)

  // Unset previous top for this tag + player's clips
  if (playerClipIds.length > 0) {
    await supabase
      .from('clip_tags')
      .update({ is_top_clip: false })
      .eq('tag_id', tagId)
      .in('clip_id', playerClipIds)
  }

  // Set new top
  const { error } = await supabase
    .from('clip_tags')
    .update({ is_top_clip: true })
    .eq('clip_id', id)
    .eq('tag_id', tagId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
