import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

interface Props {
  params: Promise<{ handle: string }>
}

export default async function OpenGraphImage({ params }: Props) {
  const { handle } = await params

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: player } = await supabase
    .from('players')
    .select('display_name, position, region, bio')
    .eq('handle', handle)
    .single()

  const displayName = player?.display_name ?? `@${handle}`
  const subline = [player?.position, player?.region].filter(Boolean).join(' · ') || 'Footory Public Profile'
  const bio = player?.bio || '영상 기반 실력 증거를 쌓는 유소년 축구 프로필'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(140deg, #0B0E11 0%, #12160F 58%, #1A1E16 100%)',
          color: '#F4F2EA',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.4px' }}>FOOTORY</div>
          <div
            style={{
              fontSize: '18px',
              color: '#F0D078',
              border: '1px solid rgba(212,168,67,0.35)',
              borderRadius: '999px',
              padding: '6px 14px',
              textTransform: 'uppercase',
            }}
          >
            SCOUT VIEW
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '24px', color: '#706B56', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
            PLAYER PROFILE
          </div>
          <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1.05 }}>{displayName}</div>
          <div style={{ fontSize: '30px', color: '#F0D078' }}>{subline}</div>
          <div style={{ fontSize: '26px', color: '#A8A28A', maxWidth: '1000px' }}>{bio}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '22px', color: '#A8A28A' }}>{`footory.com/p/${handle}`}</div>
          <div style={{ width: '200px', height: '10px', borderRadius: '999px', background: 'linear-gradient(90deg, #B8922E, #D4A843, #E8C35A)' }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
