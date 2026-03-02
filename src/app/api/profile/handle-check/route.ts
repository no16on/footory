import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  const { handle } = await request.json()

  if (!handle || typeof handle !== 'string') {
    return NextResponse.json({ available: false, error: 'Invalid handle' }, { status: 400 })
  }

  // Handle validation: 3-30 chars, lowercase letters, numbers, underscores
  const handleRegex = /^[a-z0-9_]{3,30}$/
  if (!handleRegex.test(handle)) {
    return NextResponse.json({
      available: false,
      error: '핸들은 3~30자의 영소문자, 숫자, 밑줄(_)만 사용 가능합니다',
    })
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll()
        },
        async setAll(cookiesToSet) {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase
    .from('players')
    .select('id')
    .eq('handle', handle)
    .single()

  return NextResponse.json({ available: !data, error: null })
}
