import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

const FEATURED_LIMIT = 5

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const body = await req.json()
  const isFeatured = Boolean(body.isFeatured)

  const { data: medal, error: medalError } = await supabase
    .from('player_medals')
    .select('id, is_featured')
    .eq('id', id)
    .eq('player_id', player.id)
    .single()

  if (medalError || !medal) {
    return NextResponse.json({ data: null, error: 'Medal not found' }, { status: 404 })
  }

  if (isFeatured && !medal.is_featured) {
    const { count, error: countError } = await supabase
      .from('player_medals')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', player.id)
      .eq('is_featured', true)

    if (countError) {
      return NextResponse.json({ data: null, error: countError.message }, { status: 500 })
    }

    if ((count ?? 0) >= FEATURED_LIMIT) {
      return NextResponse.json({ data: null, error: `Featured 메달은 최대 ${FEATURED_LIMIT}개입니다` }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('player_medals')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .eq('player_id', player.id)
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ data: null, error: error?.message ?? 'Failed to update medal' }, { status: 500 })
  }

  return NextResponse.json({ data, error: null })
}
