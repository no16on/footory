import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { Highlight } from '@/types/clip'

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const body = await req.json()
  const { isFeatured } = body

  // Get current highlight
  const { data: highlightRaw } = await supabase
    .from('highlights')
    .select('*')
    .eq('id', id)
    .eq('player_id', player.id)
    .single()
  if (!highlightRaw) return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
  const highlight = highlightRaw as unknown as Highlight

  if (isFeatured) {
    // Check max 3 featured
    const { count } = await supabase
      .from('highlights')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', player.id)
      .eq('is_featured', true)

    if ((count ?? 0) >= 3 && !highlight.is_featured) {
      return NextResponse.json({ error: '피처드 하이라이트는 최대 3개입니다' }, { status: 400 })
    }

    // Get next order
    const { data: maxOrderRaw } = await supabase
      .from('highlights')
      .select('featured_order')
      .eq('player_id', player.id)
      .eq('is_featured', true)
      .order('featured_order', { ascending: false })
      .limit(1)
      .single()
    const maxOrder = maxOrderRaw as unknown as { featured_order: number | null } | null

    const nextOrder = highlight.is_featured
      ? highlight.featured_order
      : ((maxOrder?.featured_order ?? 0) + 1)

    await supabase
      .from('highlights')
      .update({ is_featured: true, featured_order: nextOrder })
      .eq('id', id)
  } else {
    await supabase
      .from('highlights')
      .update({ is_featured: false, featured_order: null })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}
