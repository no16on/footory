import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('player_medals')
    .select(`
      *,
      medal_rules(id, type_id, display_name, threshold_value, sort_order),
      measurement_records(id, type_id, value_display, value_normalized, recorded_at)
    `)
    .eq('player_id', player.id)
    .order('is_featured', { ascending: false })
    .order('earned_at', { ascending: false })

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], error: null })
}
