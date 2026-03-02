import { NextRequest, NextResponse } from 'next/server'
import { canWriteTeam, getAuthedContext, normalizeTeamDbError } from '@/lib/team/api'
import type { Team } from '@/types/team'

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
    return NextResponse.json({ data: null, error: '팀 멤버만 접근할 수 있습니다' }, { status: 403 })
  }

  const { data: teamRaw, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (teamError || !teamRaw) {
    return NextResponse.json({ data: null, error: teamError?.message ?? 'Team not found' }, { status: 404 })
  }

  const team = teamRaw as Team
  const role = team.created_by === user.id ? 'owner' : 'player'

  if (!canWriteTeam(role)) {
    return NextResponse.json({ data: null, error: '공지 작성 권한이 없습니다' }, { status: 403 })
  }

  const body = await req.json()
  const title = String(body.title ?? '').trim()
  const message = body.body ? String(body.body).trim() : null
  const isPinned = Boolean(body.isPinned)

  if (!title) {
    return NextResponse.json({ data: null, error: 'title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('team_announcements')
    .insert({
      team_id: id,
      author_id: user.id,
      title,
      body: message,
      is_pinned: isPinned,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: normalizeTeamDbError(error?.message ?? 'Failed to create announcement') })
  }

  return NextResponse.json({ data, error: null })
}
