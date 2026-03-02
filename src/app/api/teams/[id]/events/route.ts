import { NextRequest, NextResponse } from 'next/server'
import { canWriteTeam, getAuthedContext, normalizeTeamDbError } from '@/lib/team/api'
import type { Team, TeamEventType } from '@/types/team'

const ALLOWED_EVENT_TYPES: TeamEventType[] = ['training', 'match', 'other']

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
    return NextResponse.json({ data: null, error: '일정 생성 권한이 없습니다' }, { status: 403 })
  }

  const body = await req.json()

  const title = String(body.title ?? '').trim()
  const eventType = String(body.eventType ?? 'training').trim().toLowerCase() as TeamEventType
  const startAt = String(body.startAt ?? '').trim()
  const endAtRaw = body.endAt ? String(body.endAt).trim() : null
  const location = body.location ? String(body.location).trim() : null
  const description = body.description ? String(body.description).trim() : null

  if (!title) {
    return NextResponse.json({ data: null, error: 'title is required' }, { status: 400 })
  }

  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    return NextResponse.json({ data: null, error: 'eventType is invalid' }, { status: 400 })
  }

  const startDate = new Date(startAt)

  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ data: null, error: 'startAt is invalid ISO datetime' }, { status: 400 })
  }

  let endAt: string | null = null

  if (endAtRaw) {
    const endDate = new Date(endAtRaw)

    if (Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ data: null, error: 'endAt is invalid ISO datetime' }, { status: 400 })
    }

    endAt = endDate.toISOString()
  }

  const { data, error } = await supabase
    .from('team_events')
    .insert({
      team_id: id,
      title,
      event_type: eventType,
      start_at: startDate.toISOString(),
      end_at: endAt,
      location,
      description,
      created_by: user.id,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: normalizeTeamDbError(error?.message ?? 'Failed to create event') })
  }

  return NextResponse.json({ data, error: null })
}
