'use client'

import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { useProfile } from '@/hooks/useProfile'
import { useTagPortfolio } from '@/hooks/useTags'
import type { TagWithStats } from '@/hooks/useTags'

const TAG_COLORS: Record<string, string> = {
  '1v1_dribble': '#E8943A',
  shooting: '#E85D5D',
  heading: '#5BBFCF',
  first_touch: '#D4A843',
  forward_pass: '#6BCB77',
  '1v1_defense': '#5B9ECF',
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const filled = max > 0 ? Math.min(5, Math.round((value / max) * 5)) : 0
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '14px',
            height: '6px',
            borderRadius: '2px',
            background: i < filled ? color : 'rgba(255,255,255,0.06)',
            boxShadow: i < filled ? `0 0 6px ${color}55` : 'none',
          }}
        />
      ))}
    </div>
  )
}

function TagCard({ tag, maxCount, onClick }: { tag: TagWithStats; maxCount: number; onClick: () => void }) {
  const color = TAG_COLORS[tag.id] ?? '#D4A843'
  const hasClips = tag.clip_count > 0

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px',
        background: '#1A1E16',
        borderRadius: '12px',
        border: `1px solid ${hasClips ? color + '22' : '#2A2F22'}`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Left: video thumbnail or icon */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '10px',
        background: hasClips ? `${color}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hasClips ? color + '30' : '#2A2F22'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {tag.top_clip_thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tag.top_clip_thumbnail}
            alt="top clip"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '22px' }}>{tag.icon}</span>
        )}
        {hasClips && !tag.top_clip_thumbnail && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="#0B0E11">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Center: tag info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            color: hasClips ? '#F4F2EA' : '#706B56',
          }}>
            {tag.display_name}
          </span>
          {tag.clip_count > 0 && (
            <span style={{
              padding: '2px 7px',
              background: `${color}18`,
              border: `1px solid ${color}35`,
              borderRadius: '20px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 700,
              color,
            }}>
              {tag.clip_count}
            </span>
          )}
        </div>
        <StatBar value={tag.clip_count} max={maxCount || 1} color={color} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#706B56',
        }}>
          {hasClips ? `${tag.clip_count} 클립` : '클립 없음'}
        </span>
      </div>

      {/* Right: arrow */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill={hasClips ? '#A8A28A' : '#2A2F22'}>
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </button>
  )
}

export default function TagsPage() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useProfile()
  const { tagStats, isLoading } = useTagPortfolio(profile?.id)

  const totalClips = tagStats.reduce((s, t) => s + t.clip_count, 0)
  const maxCount = Math.max(...tagStats.map((t) => t.clip_count), 1)
  const activeTags = tagStats.filter((t) => t.clip_count > 0).length

  if (profileLoading || isLoading) {
    return (
      <>
        <NavHeader title="기술 포트폴리오" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          color: '#706B56',
          letterSpacing: '1px',
        }}>
          LOADING...
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader title="기술 포트폴리오" />
      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          <div style={{
            padding: '14px 16px',
            background: '#1A1E16',
            borderRadius: '12px',
            border: '1px solid rgba(212,168,67,0.12)',
          }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL CLIPS</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '28px', color: '#D4A843' }}>{totalClips}</p>
          </div>
          <div style={{
            padding: '14px 16px',
            background: '#1A1E16',
            borderRadius: '12px',
            border: '1px solid rgba(107,203,119,0.12)',
          }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>ACTIVE TAGS</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '28px', color: '#6BCB77' }}>{activeTags}<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#706B56', fontWeight: 400 }}>/6</span></p>
          </div>
        </div>

        {/* Tag cards */}
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            SKILL BREAKDOWN
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tagStats.map((tag) => (
              <TagCard
                key={tag.id}
                tag={tag}
                maxCount={maxCount}
                onClick={() => router.push(`/tags/${tag.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Upload CTA if no clips */}
        {totalClips === 0 && (
          <div style={{
            padding: '24px',
            background: '#12160F',
            border: '1px dashed rgba(212,168,67,0.15)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#706B56', marginBottom: '12px' }}>
              영상을 올리고 태그를 추가하면 여기에 기술 데이터가 쌓여요
            </p>
            <button
              onClick={() => router.push('/upload')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '13px',
                color: '#0B0E11',
                cursor: 'pointer',
              }}
            >
              첫 영상 업로드
            </button>
          </div>
        )}
      </div>
    </>
  )
}
