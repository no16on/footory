import { NextResponse } from 'next/server'
import { getAuthedContext } from '@/lib/team/api'

export async function GET() {
  const { user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      teamId: player.current_team_id,
    },
    error: null,
  })
}
