import { NextRequest, NextResponse } from 'next/server'
import { getAuthedContext, normalizeTeamDbError } from '@/lib/team/api'
import type { TeamMedia } from '@/types/team'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const { id, mediaId } = await params
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  if (player.current_team_id !== id) {
    return NextResponse.json({ data: null, error: '팀 멤버만 가져올 수 있습니다' }, { status: 403 })
  }

  const { data: mediaRaw } = await supabase
    .from('team_media')
    .select('*')
    .eq('id', mediaId)
    .eq('team_id', id)
    .maybeSingle()
  const media = (mediaRaw as TeamMedia | null) ?? null

  if (!media) {
    return NextResponse.json({ data: null, error: 'Team media not found' }, { status: 404 })
  }

  if (media.media_type !== 'video') {
    return NextResponse.json({ data: null, error: '영상만 프로필로 가져올 수 있습니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clips')
    .insert({
      player_id: player.id,
      source: 'team',
      source_team_id: id,
      video_url: media.media_url,
      thumbnail_url: media.thumbnail_url,
      memo: media.caption ? `[TEAM] ${media.caption}` : '[TEAM] Add to profile',
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: normalizeTeamDbError(error?.message ?? 'Failed to claim media') })
  }

  return NextResponse.json({ data, error: null })
}
