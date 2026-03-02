import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

type MedalRuleRow = Database['public']['Tables']['medal_rules']['Row']

type AwardInput = {
  playerId: string
  typeId: string
  valueNormalized: number
  recordId: string
  verificationStatus: string | null
  conditionOperator: 'GTE' | 'LTE'
}

export type AwardedMedal = Database['public']['Tables']['player_medals']['Row'] & {
  medal_rules: Pick<MedalRuleRow, 'id' | 'display_name' | 'type_id' | 'threshold_value' | 'sort_order'> | null
}

export async function evaluateAndAwardMedals({
  playerId,
  typeId,
  valueNormalized,
  recordId,
  verificationStatus,
  conditionOperator,
}: AwardInput): Promise<{ awarded: AwardedMedal[]; warning: string | null }> {
  const admin = createAdminClient()

  if (!admin) {
    return {
      awarded: [],
      warning: 'SUPABASE_SERVICE_ROLE_KEY is not set. Medal awarding was skipped.',
    }
  }

  const [rulesRes, existingRes] = await Promise.all([
    admin
      .from('medal_rules')
      .select('id, type_id, display_name, threshold_value, sort_order')
      .eq('type_id', typeId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    admin
      .from('player_medals')
      .select('medal_rule_id')
      .eq('player_id', playerId),
  ])

  if (rulesRes.error) {
    throw new Error(rulesRes.error.message)
  }

  if (existingRes.error) {
    throw new Error(existingRes.error.message)
  }

  const rules = rulesRes.data ?? []
  const existingIds = new Set((existingRes.data ?? []).map((row) => row.medal_rule_id))

  const inserts = rules
    .filter((rule) => {
      if (existingIds.has(rule.id)) {
        return false
      }

      if (conditionOperator === 'GTE') {
        return valueNormalized >= Number(rule.threshold_value)
      }

      return valueNormalized <= Number(rule.threshold_value)
    })
    .map((rule) => ({
      player_id: playerId,
      medal_rule_id: rule.id,
      earned_from_record_id: recordId,
      verification_status_snapshot: verificationStatus,
      is_featured: false,
    }))

  if (inserts.length === 0) {
    return { awarded: [], warning: null }
  }

  const insertRes = await admin
    .from('player_medals')
    .insert(inserts)
    .select('*, medal_rules(id, type_id, display_name, threshold_value, sort_order)')

  if (insertRes.error) {
    throw new Error(insertRes.error.message)
  }

  return {
    awarded: (insertRes.data ?? []) as AwardedMedal[],
    warning: null,
  }
}
