import { NextRequest, NextResponse } from 'next/server'
import { getAuthedContext, normalizeTeamDbError } from '@/lib/team/api'
import type { TeamRsvpStatus } from '@/types/team'

const ALLOWED_STATUSES: TeamRsvpStatus[] = ['going', 'maybe', 'no']

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const { id, eventId } = await params
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  if (player.current_team_id !== id) {
    return NextResponse.json({ data: null, error: '팀 멤버만 RSVP 할 수 있습니다' }, { status: 403 })
  }

  const body = await req.json()
  const status = String(body.status ?? '').trim().toLowerCase() as TeamRsvpStatus

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ data: null, error: 'status is invalid' }, { status: 400 })
  }

  const { data: event } = await supabase
    .from('team_events')
    .select('id')
    .eq('id', eventId)
    .eq('team_id', id)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ data: null, error: 'Event not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('team_event_rsvps')
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'event_id,user_id' }
    )
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: normalizeTeamDbError(error?.message ?? 'Failed to RSVP') })
  }

  return NextResponse.json({ data, error: null })
}
