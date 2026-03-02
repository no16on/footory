import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { getR2PublicUrl } from '@/lib/r2/upload'

export async function POST(req: NextRequest) {
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
  const { r2Key, durationSeconds, fileSizeBytes, memo } = body

  const videoUrl = getR2PublicUrl(r2Key)

  const { data, error } = await supabase
    .from('clips')
    .insert({
      player_id: player.id,
      video_url: videoUrl,
      duration_seconds: durationSeconds || null,
      file_size_bytes: fileSizeBytes || null,
      memo: memo || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function GET(req: NextRequest) {
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

  const { data, error } = await supabase
    .from('clips')
    .select('*, clip_tags(*, tags(*))')
    .eq('player_id', player.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
