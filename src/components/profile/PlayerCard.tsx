import { POSITION_COLORS } from '@/types/profile'
import type { Player } from '@/types/profile'

interface PlayerCardProps {
  player: Player
  teamName?: string | null
  isOwner?: boolean
  onShare?: () => void
}

export function PlayerCard({ player, teamName, isOwner, onShare }: PlayerCardProps) {
  const positionColor = player.position
    ? (POSITION_COLORS[player.position] ?? '#D4A843')
    : '#D4A843'

  const age = player.birth_year
    ? new Date().getFullYear() - player.birth_year
    : null

  const avatarSize = 80
  const avatarRadius = Math.round(avatarSize * 0.28)

  return (
    <div
      style={{
        background: '#1A1E16',
        border: '1px solid rgba(212,168,67,0.15)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Top row: Avatar + Info + Share */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Avatar */}
        <div
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarRadius,
            backgroundColor: '#12160F',
            border: `2px solid ${positionColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {player.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.profile_image_url}
              alt={player.display_name}
              width={avatarSize}
              height={avatarSize}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontSize: '28px',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 900,
                color: positionColor,
              }}
            >
              {player.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                color: '#F4F2EA',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {player.display_name}
            </h2>
          </div>

          {/* Handle */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#706B56',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            @{player.handle}
          </div>

          {/* Position + Age badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {player.position && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: positionColor,
                  backgroundColor: `${positionColor}18`,
                  padding: '3px 8px',
                  borderRadius: '20px',
                  border: `1px solid ${positionColor}40`,
                  letterSpacing: '0.5px',
                }}
              >
                {player.position}
              </span>
            )}
            {player.secondary_position && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#706B56',
                  backgroundColor: 'rgba(112,107,86,0.12)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  border: '1px solid rgba(112,107,86,0.25)',
                }}
              >
                {player.secondary_position}
              </span>
            )}
            {age && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#A8A28A',
                  backgroundColor: 'rgba(168,162,138,0.08)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  border: '1px solid rgba(168,162,138,0.15)',
                }}
              >
                {age}세
              </span>
            )}
          </div>
        </div>

        {/* Share button */}
        {isOwner && onShare && (
          <button
            onClick={onShare}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#706B56',
              padding: '4px',
              flexShrink: 0,
            }}
            aria-label="프로필 공유"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
            </svg>
          </button>
        )}
      </div>

      {/* Team + Region */}
      {(teamName || player.region) && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {teamName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="#D4A843">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span
                style={{
                  fontSize: '13px',
                  color: '#A8A28A',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {teamName}
              </span>
            </div>
          )}
          {player.region && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="#706B56">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span
                style={{
                  fontSize: '13px',
                  color: '#706B56',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {player.region}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bio */}
      {player.bio && (
        <p
          style={{
            fontSize: '13px',
            color: '#A8A28A',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.6,
            margin: 0,
            padding: '12px',
            background: '#12160F',
            borderRadius: '8px',
            borderLeft: `2px solid ${positionColor}40`,
          }}
        >
          {player.bio}
        </p>
      )}
    </div>
  )
}
