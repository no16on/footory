import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayerCard } from '@/components/profile/PlayerCard'
import { FeaturedHighlights } from '@/components/profile/FeaturedHighlights'
import { MeasuredStats } from '@/components/profile/MeasuredStats'
import { TagPortfolio } from '@/components/profile/TagPortfolio'
import { SeasonHistory } from '@/components/profile/SeasonHistory'
import { ShareButton } from '@/components/ui/share-button'
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
    <div className="min-h-dvh bg-bg max-w-[390px] mx-auto relative">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-surface z-10">
        <div className="font-display font-black text-base bg-gold-gradient bg-clip-text text-transparent">
          FOOTORY
        </div>
        <div className="font-mono text-[10px] text-text-dim tracking-[1.4px]">
          SCOUT PROFILE
        </div>
      </div>

      <div className="px-5 pt-4 pb-12 flex flex-col gap-6">
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

      <ShareButton />
    </div>
  )
}
