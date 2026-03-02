import { NextRequest, NextResponse } from 'next/server'
import { createInviteCode, getAuthedContext } from '@/lib/team/api'
import type { Team } from '@/types/team'

export async function POST(req: NextRequest) {
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  if (player.current_team_id) {
    return NextResponse.json({ data: null, error: '이미 소속된 팀이 있습니다' }, { status: 400 })
  }

  const body = await req.json()

  const name = String(body.name ?? '').trim()
  const description = body.description ? String(body.description).trim() : null
  const region = body.region ? String(body.region).trim() : null

  if (!name || name.length < 2) {
    return NextResponse.json({ data: null, error: '팀 이름은 2자 이상이어야 합니다' }, { status: 400 })
  }

  let createdTeam: Team | null = null
  let lastError: string | null = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = createInviteCode()

    const insertRes = await supabase
      .from('teams')
      .insert({
        name,
        description,
        region,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select('*')
      .single()

    if (!insertRes.error && insertRes.data) {
      createdTeam = insertRes.data as Team
      break
    }

    const message = insertRes.error?.message ?? 'Failed to create team'
    lastError = message

    if (!message.toLowerCase().includes('invite_code')) {
      break
    }
  }

  if (!createdTeam) {
    return NextResponse.json({ data: null, error: lastError ?? 'Failed to create team' }, { status: 500 })
  }

  const { error: playerUpdateError } = await supabase
    .from('players')
    .update({ current_team_id: createdTeam.id, updated_at: new Date().toISOString() })
    .eq('id', player.id)

  if (playerUpdateError) {
    return NextResponse.json({ data: null, error: playerUpdateError.message }, { status: 500 })
  }

  return NextResponse.json({ data: createdTeam, error: null })
}
