import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

async function getAuthedContext() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, playerId: null as string | null }
  const { data: player } = await supabase.from('players').select('id').eq('user_id', user.id).single()
  return { supabase, playerId: player?.id ?? null }
}

export async function GET() {
  const { supabase, playerId } = await getAuthedContext()
  if (!playerId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('player_id', playerId)
    .order('year', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const { supabase, playerId } = await getAuthedContext()
  if (!playerId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { year, team_name_snapshot, competitions, notes } = body

  if (!year || typeof year !== 'number') {
    return NextResponse.json({ data: null, error: '연도를 입력해주세요' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('seasons')
    .upsert({
      player_id: playerId,
      year: Number(year),
      team_name_snapshot: team_name_snapshot || null,
      competitions: competitions || null,
      notes: notes || null,
    }, { onConflict: 'player_id,year' })
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const { supabase, playerId } = await getAuthedContext()
  if (!playerId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'id 필요' }, { status: 400 })

  const { error } = await supabase.from('seasons').delete().eq('id', id).eq('player_id', playerId)
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
