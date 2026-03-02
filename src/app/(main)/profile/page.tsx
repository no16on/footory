'use client'

import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { PlayerCard } from '@/components/profile/PlayerCard'
import { FeaturedHighlights } from '@/components/profile/FeaturedHighlights'
import { MeasuredStats } from '@/components/profile/MeasuredStats'
import { TagPortfolio } from '@/components/profile/TagPortfolio'
import { SeasonHistory } from '@/components/profile/SeasonHistory'
import { useProfile } from '@/hooks/useProfile'
import { useHighlights } from '@/hooks/useClips'
import { useTagPortfolio } from '@/hooks/useTags'
import { useMeasurements } from '@/hooks/useMeasurements'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, isLoading } = useProfile()
  const { highlights } = useHighlights(profile?.id)
  const { tagStats } = useTagPortfolio(profile?.id)
  const { types: measurementTypes, records: measurementRecords, medals } = useMeasurements(Boolean(profile?.id))

  function handleShare() {
    if (!profile) return
    const url = `${window.location.origin}/p/${profile.handle}`
    if (navigator.share) {
      navigator.share({ title: `${profile.display_name} — Footory`, url })
    } else {
      navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다'))
    }
  }

  if (isLoading) {
    return (
      <>
        <NavHeader title="내 프로필" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            color: '#706B56',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            letterSpacing: '1px',
          }}
        >
          LOADING…
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <NavHeader title="내 프로필" />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#706B56', fontFamily: "'DM Sans', sans-serif" }}>
            프로필을 찾을 수 없습니다
          </p>
          <button
            onClick={() => router.push('/profile/onboarding')}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
              border: 'none',
              borderRadius: '10px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              color: '#0B0E11',
              cursor: 'pointer',
            }}
          >
            프로필 만들기
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader
        title="내 프로필"
        rightAction={
          <button
            onClick={() => router.push('/profile/edit')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#A8A28A',
              padding: 0,
            }}
            aria-label="프로필 편집"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        }
      />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Player Card */}
        <PlayerCard
          player={profile}
          isOwner
          onShare={handleShare}
        />

        {/* Public Profile Link */}
        <button
          onClick={handleShare}
          aria-label="공개 프로필 링크 공유"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(212,168,67,0.06)',
            border: '1px solid rgba(212,168,67,0.15)',
            borderRadius: '10px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#D4A843">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
          <span
            style={{
              flex: 1,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#A8A28A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            footory.com/p/{profile.handle}
          </span>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#706B56">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
        </button>

        <button
          onClick={() => router.push('/scout')}
          aria-label="Scout View — 선수 검색 페이지로 이동"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(91,191,207,0.08)',
            border: '1px solid rgba(91,191,207,0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#5BBFCF">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <span
            style={{
              flex: 1,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#A8A28A',
              letterSpacing: '1px',
            }}
          >
            SCOUT VIEW · 선수 검색
          </span>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#706B56">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>

        {/* Featured Highlights */}
        <FeaturedHighlights
          highlights={highlights.filter(h => h.is_featured)}
          isOwner
        />

        {/* Measured Stats */}
        <MeasuredStats
          types={measurementTypes}
          records={measurementRecords}
          medals={medals}
          isOwner
        />

        {/* Tag Portfolio */}
        <TagPortfolio
          tags={tagStats.filter((t) => t.clip_count > 0).map((t) => ({
            id: t.id,
            display_name: t.display_name,
            icon: t.icon,
            clip_count: t.clip_count,
          }))}
          isOwner
        />

        {/* Season History */}
        <SeasonHistory seasons={[]} isOwner />
      </div>
    </>
  )
}
