import { NextRequest, NextResponse } from 'next/server'
import { getR2PublicUrl } from '@/lib/r2/upload'
import { getAuthedContext, normalizeTeamDbError } from '@/lib/team/api'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  if (player.current_team_id !== id) {
    return NextResponse.json({ data: null, error: '팀 멤버만 업로드할 수 있습니다' }, { status: 403 })
  }

  const body = await req.json()

  const mediaTypeRaw = String(body.mediaType ?? '').trim().toLowerCase()
  const mediaType = mediaTypeRaw === 'photo' || mediaTypeRaw === 'video' ? mediaTypeRaw : null
  const r2Key = String(body.r2Key ?? '').trim()
  const caption = body.caption ? String(body.caption).trim() : null
  const thumbnailUrl = body.thumbnailUrl ? String(body.thumbnailUrl).trim() : null

  if (!mediaType) {
    return NextResponse.json({ data: null, error: 'mediaType must be photo or video' }, { status: 400 })
  }

  if (!r2Key) {
    return NextResponse.json({ data: null, error: 'r2Key is required' }, { status: 400 })
  }

  const mediaUrl = getR2PublicUrl(r2Key)

  const { data, error } = await supabase
    .from('team_media')
    .insert({
      team_id: id,
      uploaded_by: user.id,
      media_type: mediaType,
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      caption,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: normalizeTeamDbError(error?.message ?? 'Failed to upload team media') })
  }

  return NextResponse.json({ data, error: null })
}
