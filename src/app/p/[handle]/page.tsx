import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
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

export const revalidate = 60

const TAG_LIST_STATIC = [
  { id: '1v1_dribble', display_name: '1v1 돌파', icon: '⚡' },
  { id: 'shooting', display_name: '슈팅', icon: '🎯' },
  { id: 'heading', display_name: '헤딩경합', icon: '💪' },
  { id: 'first_touch', display_name: '퍼스트터치', icon: '✨' },
  { id: 'forward_pass', display_name: '전진패스', icon: '📡' },
  { id: '1v1_defense', display_name: '1v1 수비', icon: '🛡️' },
]

const getPlayerByHandle = cache(async (handle: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('handle', handle)
    .single()

  return (data as Player | null) ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const player = await getPlayerByHandle(handle)

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
      images: [
        {
          url: `/p/${handle}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${player.display_name} — Footory`,
      description,
      images: [`/p/${handle}/opengraph-image`],
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params
  const player = await getPlayerByHandle(handle)

  if (!player) {
    notFound()
  }

  const supabase = await createClient()

  const [highlightsRes, clipTagsRes, measurementTypesRes, measurementRecordsRes, medalsRes, seasonsRes] = await Promise.all([
    supabase
      .from('highlights')
      .select('id, video_url, thumbnail_url, duration_seconds, featured_order')
      .eq('player_id', player.id)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true }),
    supabase
      .from('clip_tags')
      .select('tag_id, clips!inner(player_id)')
      .eq('clips.player_id', player.id),
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
    supabase
      .from('seasons')
      .select('id, year, team_name_snapshot, competitions, notes')
      .eq('player_id', player.id)
      .order('year', { ascending: false }),
  ])

  const tagCountMap: Record<string, number> = {}

  for (const ct of (clipTagsRes.data as Array<{ tag_id: string }> | null) ?? []) {
    tagCountMap[ct.tag_id] = (tagCountMap[ct.tag_id] ?? 0) + 1
  }

  const tagList = TAG_LIST_STATIC
    .filter((item) => (tagCountMap[item.id] ?? 0) > 0)
    .map((item) => ({
      ...item,
      clip_count: tagCountMap[item.id] ?? 0,
    }))

  const typedMeasurementTypes = (measurementTypesRes.data ?? []) as Database['public']['Tables']['measurement_types']['Row'][]
  const typedMeasurementRecords = (measurementRecordsRes.data ?? []) as Database['public']['Tables']['measurement_records']['Row'][]
  const typedMedals = (medalsRes.data ?? []) as Array<{
    id: string
    is_featured: boolean
    medal_rules:
      | {
          id: string
          type_id: string
          display_name: string
          threshold_value: number
          sort_order: number
        }
      | null
      | Array<{
          id: string
          type_id: string
          display_name: string
          threshold_value: number
          sort_order: number
        }>
  }>

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0B0E11',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #2A2F22',
          position: 'sticky',
          top: 0,
          background: '#12160F',
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
            letterSpacing: '1.4px',
          }}
        >
          SCOUT PROFILE
        </div>
      </div>

      <div style={{ padding: '16px 20px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PlayerCard player={player} />
        <FeaturedHighlights highlights={highlightsRes.data ?? []} />
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
        <SeasonHistory seasons={seasonsRes.data ?? []} />
      </div>
    </div>
  )
}
