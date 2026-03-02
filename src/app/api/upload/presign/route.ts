import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { createPresignedUploadUrl, generateVideoKey } from '@/lib/r2/upload'

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get player ID
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const body = await req.json()
  const { fileName, contentType, fileSize } = body

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다 (MP4, MOV, WebM만 가능)' }, { status: 400 })
  }
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '파일 크기는 500MB 이하여야 합니다' }, { status: 400 })
  }

  const key = generateVideoKey(player.id, fileName)
  const presignedUrl = await createPresignedUploadUrl(key, contentType)

  return NextResponse.json({ presignedUrl, key })
}
