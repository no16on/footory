import Link from 'next/link'

interface Highlight {
  id: string
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  featured_order: number | null
}

interface FeaturedHighlightsProps {
  highlights: Highlight[]
  isOwner?: boolean
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function FeaturedHighlights({ highlights, isOwner }: FeaturedHighlightsProps) {
  const sorted = [...highlights].sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#706B56',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            FEATURED
          </div>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F2EA',
            }}
          >
            대표 하이라이트
          </div>
        </div>
        {isOwner && (
          <Link
            href="/upload"
            style={{
              fontSize: '12px',
              color: '#D4A843',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
          >
            + 추가
          </Link>
        )}
      </div>

      {/* Highlight slots (max 3) */}
      {sorted.length === 0 ? (
        <EmptyHighlightSlot isOwner={isOwner} />
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          {sorted.map((h) => (
            <HighlightThumbnail key={h.id} highlight={h} />
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 3 - sorted.length) }).map((_, i) => (
            <EmptySlot key={i} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  )
}

function HighlightThumbnail({ highlight }: { highlight: Highlight }) {
  return (
    <div
      style={{
        flex: 1,
        aspectRatio: '9/16',
        maxHeight: '160px',
        background: '#12160F',
        borderRadius: '8px',
        border: '1px solid rgba(212,168,67,0.2)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {highlight.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={highlight.thumbnail_url}
          alt="하이라이트 썸네일"
          width={160}
          height={90}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#D4A843">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
      {/* Duration badge */}
      {highlight.duration_seconds && (
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '4px',
            padding: '2px 4px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: '#F4F2EA',
          }}
        >
          {formatDuration(highlight.duration_seconds)}
        </div>
      )}
      {/* Play overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(212,168,67,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="#0B0E11">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function EmptySlot({ isOwner }: { isOwner?: boolean }) {
  return (
    <Link
      href={isOwner ? '/upload' : '#'}
      style={{
        flex: 1,
        aspectRatio: '9/16',
        maxHeight: '160px',
        background: '#12160F',
        borderRadius: '8px',
        border: '1px dashed rgba(212,168,67,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
      }}
    >
      {isOwner && (
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="rgba(212,168,67,0.3)">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      )}
    </Link>
  )
}

function EmptyHighlightSlot({ isOwner }: { isOwner?: boolean }) {
  return (
    <div
      style={{
        background: '#12160F',
        borderRadius: '10px',
        border: '1px dashed rgba(212,168,67,0.15)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎥</div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#706B56',
          margin: 0,
        }}
      >
        {isOwner
          ? '첫 하이라이트 영상을 올려보세요'
          : '아직 대표 하이라이트가 없습니다'}
      </p>
      {isOwner && (
        <Link
          href="/upload"
          style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '8px 16px',
            background: 'rgba(212,168,67,0.12)',
            border: '1px solid rgba(212,168,67,0.3)',
            borderRadius: '8px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: '#D4A843',
            textDecoration: 'none',
          }}
        >
          영상 업로드
        </Link>
      )}
    </div>
  )
}
