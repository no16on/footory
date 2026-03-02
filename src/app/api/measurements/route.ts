import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { evaluateAndAwardMedals } from '@/lib/medals/engine'
import { normalizeMeasurementValue, type AttemptContext } from '@/types/measurement'
import type { Database } from '@/types/database'

const ALLOWED_CONTEXTS: AttemptContext[] = ['TRAINING', 'MATCH', 'TEST']

async function getAuthedContext() {
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
    return { supabase, playerId: null as string | null, userId: null as string | null }
  }

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return { supabase, playerId: player?.id ?? null, userId: user.id }
}

export async function GET() {
  const { supabase, playerId, userId } = await getAuthedContext()

  if (!userId) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!playerId) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  const [typesRes, recordsRes] = await Promise.all([
    supabase
      .from('measurement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('measurement_records')
      .select('*')
      .eq('player_id', playerId)
      .order('recorded_at', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  if (typesRes.error) {
    return NextResponse.json({ data: null, error: typesRes.error.message }, { status: 500 })
  }

  if (recordsRes.error) {
    return NextResponse.json({ data: null, error: recordsRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      types: typesRes.data ?? [],
      records: recordsRes.data ?? [],
    },
    error: null,
  })
}

export async function POST(req: NextRequest) {
  const { supabase, playerId, userId } = await getAuthedContext()

  if (!userId) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!playerId) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  const body = await req.json()

  const typeId = String(body.typeId ?? '').trim()
  const valueDisplayRaw = String(body.valueDisplay ?? '').trim()
  const attemptContextRaw = body.attemptContext ? String(body.attemptContext).trim().toUpperCase() : null
  const recordedAt = String(body.recordedAt ?? '').trim()
  const location = body.location ? String(body.location).trim() : null
  const note = body.note ? String(body.note).trim() : null
  const evidenceMediaUrl = body.evidenceMediaUrl ? String(body.evidenceMediaUrl).trim() : null

  if (!typeId) {
    return NextResponse.json({ data: null, error: 'typeId is required' }, { status: 400 })
  }

  if (!valueDisplayRaw) {
    return NextResponse.json({ data: null, error: 'valueDisplay is required' }, { status: 400 })
  }

  if (!recordedAt || !/^\d{4}-\d{2}-\d{2}$/.test(recordedAt)) {
    return NextResponse.json({ data: null, error: 'recordedAt must be YYYY-MM-DD' }, { status: 400 })
  }

  if (attemptContextRaw && !ALLOWED_CONTEXTS.includes(attemptContextRaw as AttemptContext)) {
    return NextResponse.json({ data: null, error: 'attemptContext is invalid' }, { status: 400 })
  }

  const { data: typeRow, error: typeError } = await supabase
    .from('measurement_types')
    .select('*')
    .eq('id', typeId)
    .eq('is_active', true)
    .single()

  if (typeError || !typeRow) {
    return NextResponse.json({ data: null, error: 'Measurement type not found' }, { status: 404 })
  }

  const measurementType = typeRow as Database['public']['Tables']['measurement_types']['Row']

  let normalized: { valueDisplay: string; valueNormalized: number }

  try {
    normalized = normalizeMeasurementValue(typeId, valueDisplayRaw)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid measurement value'
    return NextResponse.json({ data: null, error: message }, { status: 400 })
  }

  const insertRes = await supabase
    .from('measurement_records')
    .insert({
      player_id: playerId,
      type_id: typeId,
      value_display: normalized.valueDisplay,
      value_normalized: normalized.valueNormalized,
      attempt_context: attemptContextRaw,
      recorded_at: recordedAt,
      location,
      note,
      evidence_media_url: evidenceMediaUrl,
      verification_status: 'CLAIMED',
    })
    .select('*')
    .single()

  if (insertRes.error || !insertRes.data) {
    return NextResponse.json({ data: null, error: insertRes.error?.message ?? 'Failed to insert record' }, { status: 500 })
  }

  const insertedRecord = insertRes.data as Database['public']['Tables']['measurement_records']['Row']

  let awarded: Awaited<ReturnType<typeof evaluateAndAwardMedals>>['awarded'] = []
  let warning: string | null = null

  try {
    const awardResult = await evaluateAndAwardMedals({
      playerId,
      typeId,
      valueNormalized: normalized.valueNormalized,
      recordId: insertedRecord.id,
      verificationStatus: insertedRecord.verification_status,
      conditionOperator: (measurementType.condition_operator === 'GTE' ? 'GTE' : 'LTE'),
    })

    awarded = awardResult.awarded
    warning = awardResult.warning
  } catch (err: unknown) {
    warning = err instanceof Error ? err.message : 'Failed to evaluate medals'
  }

  return NextResponse.json({
    data: {
      record: insertedRecord,
      newMedals: awarded,
      warning,
    },
    error: null,
  })
}
