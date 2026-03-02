import { NextRequest, NextResponse } from 'next/server'
import { getAuthedContext } from '@/lib/team/api'
import type { Team } from '@/types/team'

export async function POST(req: NextRequest) {
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  const body = await req.json()
  const inviteCode = String(body.inviteCode ?? '').trim().toUpperCase()

  if (!inviteCode) {
    return NextResponse.json({ data: null, error: 'inviteCode is required' }, { status: 400 })
  }

  const { data: teamRaw, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()
  const team = (teamRaw as Team | null) ?? null

  if (teamError || !team) {
    return NextResponse.json({ data: null, error: '유효하지 않은 초대 코드입니다' }, { status: 404 })
  }

  const { error: playerUpdateError } = await supabase
    .from('players')
    .update({ current_team_id: team.id, updated_at: new Date().toISOString() })
    .eq('id', player.id)

  if (playerUpdateError) {
    return NextResponse.json({ data: null, error: playerUpdateError.message }, { status: 500 })
  }

  return NextResponse.json({ data: team as Team, error: null })
}
