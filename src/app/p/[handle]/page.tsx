import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlayerCard } from '@/components/profile/PlayerCard'
import { FeaturedHighlights } from '@/components/profile/FeaturedHighlights'
import { MeasuredStats } from '@/components/profile/MeasuredStats'
import { TagPortfolio } from '@/components/profile/TagPortfolio'
import { SeasonHistory } from '@/components/profile/SeasonHistory'
import type { Player } from '@/types/profile'
import type { Database } from '@/types/database'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const supabase = await createClient()
  const { data: player } = await supabase
    .from('players')
    .select('display_name, position, region, bio')
    .eq('handle', handle)
    .single()

  if (!player) {
    return { title: 'Footory' }
  }

  const description = player.bio
    ?? `${player.position ?? ''}${player.region ? ` · ${player.region}` : ''} — Footory`

  return {
    title: `${player.display_name} — Footory`,
    description,
    openGraph: {
      title: `${player.display_name} — Footory`,
      description,
      siteName: 'Footory',
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params
  const supabase = await createClient()

  const { data: playerData } = await supabase
    .from('players')
    .select('*')
    .eq('handle', handle)
    .single()

  if (!playerData) notFound()
  const player = playerData as unknown as Player

  // Featured highlights
  const { data: highlights } = await supabase
    .from('highlights')
    .select('id, video_url, thumbnail_url, duration_seconds, featured_order')
    .eq('player_id', player.id)
    .eq('is_featured', true)
    .order('featured_order', { ascending: true })

  // Tag portfolio: get clip_tags for this player's clips
  const { data: clipTagsData } = await supabase
    .from('clip_tags')
    .select('tag_id, is_top_clip, clips!inner(player_id)')
    .eq('clips.player_id', player.id)

  const [{ data: measurementTypes }, { data: measurementRecords }, { data: medals }] = await Promise.all([
    supabase
      .from('measurement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('measurement_records')
      .select('*')
      .eq('player_id', player.id)
      .order('recorded_at', { ascending: false }),
    supabase
      .from('player_medals')
      .select('id, is_featured, medal_rules(id, type_id, display_name, threshold_value, sort_order)')
      .eq('player_id', player.id)
      .order('is_featured', { ascending: false })
      .order('earned_at', { ascending: false }),
  ])

  const typedMeasurementTypes = (measurementTypes ?? []) as Database['public']['Tables']['measurement_types']['Row'][]
  const typedMeasurementRecords = (measurementRecords ?? []) as Database['public']['Tables']['measurement_records']['Row'][]
  const typedMedals = (medals ?? []) as Array<{
    id: string
    is_featured: boolean
    medal_rules: {
      id: string
      type_id: string
      display_name: string
      threshold_value: number
      sort_order: number
    } | null | Array<{
      id: string
      type_id: string
      display_name: string
      threshold_value: number
      sort_order: number
    }>
  }>

  const TAG_LIST_STATIC = [
    { id: '1v1_dribble', display_name: '1v1 돌파', icon: '⚡' },
    { id: 'shooting', display_name: '슈팅', icon: '🎯' },
    { id: 'heading', display_name: '헤딩경합', icon: '💪' },
    { id: 'first_touch', display_name: '퍼스트터치', icon: '✨' },
    { id: 'forward_pass', display_name: '전진패스', icon: '📡' },
    { id: '1v1_defense', display_name: '1v1 수비', icon: '🛡️' },
  ]
  const tagCountMap: Record<string, number> = {}
  type ClipTagRow = { tag_id: string; is_top_clip: boolean; clips: { player_id: string } | null }
  for (const ct of (clipTagsData as unknown as ClipTagRow[]) ?? []) {
    const tid = ct.tag_id
    tagCountMap[tid] = (tagCountMap[tid] ?? 0) + 1
  }
  const tagList = TAG_LIST_STATIC
    .filter((t) => (tagCountMap[t.id] ?? 0) > 0)
    .map((t) => ({ ...t, clip_count: tagCountMap[t.id] ?? 0 }))

  // Season history
  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, year, team_name_snapshot, competitions, notes')
    .eq('player_id', player.id)
    .order('year', { ascending: false })

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0B0E11',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'sticky',
          top: 0,
          background: '#0B0E11',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 900,
            fontSize: '16px',
            background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          FOOTORY
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#706B56',
            letterSpacing: '1px',
          }}
        >
          PUBLIC PROFILE
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PlayerCard player={player} />
        <FeaturedHighlights highlights={highlights ?? []} />
        <MeasuredStats
          types={typedMeasurementTypes}
          records={typedMeasurementRecords.map((record) => ({
            ...record,
            verification_status: record.verification_status ?? null,
          }))}
          medals={typedMedals.map((medal) => ({
            ...medal,
            medal_rules: medal.medal_rules && !Array.isArray(medal.medal_rules)
              ? medal.medal_rules
              : null,
          }))}
        />
        <TagPortfolio tags={tagList} />
        <SeasonHistory seasons={seasons ?? []} />
      </div>
    </div>
  )
}
