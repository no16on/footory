import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createRouteClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function getAuthedContext() {
  const supabase = await createRouteClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, player: null }
  }

  const { data: player } = await supabase
    .from('players')
    .select('id, current_team_id')
    .eq('user_id', user.id)
    .single()

  return { supabase, user, player }
}

export function canWriteTeam(role: string | null | undefined) {
  return role === 'owner' || role === 'coach' || role === 'manager'
}

export function createInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''

  for (let index = 0; index < 8; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}

export function normalizeTeamDbError(message: string) {
  if (message.includes('infinite recursion detected in policy for relation "team_members"')) {
    return 'team_members RLS 정책 오류입니다. Supabase에서 팀 정책 SQL을 수정/재적용해 주세요.'
  }

  return message
}
