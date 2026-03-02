import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlayerCard } from '@/components/profile/PlayerCard'
import { FeaturedHighlights } from '@/components/profile/FeaturedHighlights'
import { TagPortfolio } from '@/components/profile/TagPortfolio'
import { SeasonHistory } from '@/components/profile/SeasonHistory'
import type { Player } from '@/types/profile'

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

  // Tag summary (v1 — show empty, tags loaded in S3)
  const tagMap: Record<string, { id: string; display_name: string; icon: string | null; clip_count: number }> = {}

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
        <TagPortfolio tags={Object.values(tagMap)} />
        <SeasonHistory seasons={seasons ?? []} />
      </div>
    </div>
  )
}
