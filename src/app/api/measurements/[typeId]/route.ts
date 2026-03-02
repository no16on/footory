import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeId: string }> }
) {
  const { typeId } = await params

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

  const { data: typeRow, error: typeError } = await supabase
    .from('measurement_types')
    .select('*')
    .eq('id', typeId)
    .single()

  if (typeError || !typeRow) {
    return NextResponse.json({ data: null, error: 'Measurement type not found' }, { status: 404 })
  }

  const { data: records, error } = await supabase
    .from('measurement_records')
    .select('*')
    .eq('player_id', player.id)
    .eq('type_id', typeId)
    .order('recorded_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      type: typeRow,
      records: records ?? [],
    },
    error: null,
  })
}
