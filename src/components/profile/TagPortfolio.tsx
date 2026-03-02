import Link from 'next/link'

interface TagSummary {
  id: string
  display_name: string
  icon: string | null
  clip_count: number
}

interface TagPortfolioProps {
  tags: TagSummary[]
  isOwner?: boolean
}

const TAG_COLORS: Record<string, string> = {
  '1v1_dribble': '#E8943A',
  heading: '#5BBFCF',
  shooting: '#E85D5D',
  first_touch: '#D4A843',
  forward_pass: '#6BCB77',
  '1v1_defense': '#5B9ECF',
}

export function TagPortfolio({ tags, isOwner }: TagPortfolioProps) {
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
            SKILL TAGS
          </div>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#F4F2EA',
            }}
          >
            기술 포트폴리오
          </div>
        </div>
        {isOwner && tags.length > 0 && (
          <Link
            href="/tags"
            style={{
              fontSize: '12px',
              color: '#D4A843',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
          >
            전체 보기
          </Link>
        )}
      </div>

      {tags.length === 0 ? (
        <div
          style={{
            background: '#12160F',
            borderRadius: '10px',
            border: '1px dashed rgba(212,168,67,0.15)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏷️</div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#706B56',
              margin: 0,
            }}
          >
            {isOwner
              ? '영상을 올리고 기술 태그를 연결하세요'
              : '아직 기술 태그가 없습니다'}
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tags.map((tag) => {
            const color = TAG_COLORS[tag.id] ?? '#D4A843'
            return (
              <Link
                key={tag.id}
                href={`/tags/${tag.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#12160F',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    {tag.icon ?? '⚽'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#F4F2EA',
                    }}
                  >
                    {tag.display_name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '12px',
                      color: color,
                      fontWeight: 700,
                    }}
                  >
                    {tag.clip_count}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: '#706B56',
                    }}
                  >
                    clips
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#706B56">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
