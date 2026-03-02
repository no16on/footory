'use client'

import { TAG_LIST } from '@/types/clip'

const TAG_COLORS: Record<string, string> = {
  '1v1_dribble': '#E8943A',
  shooting: '#E85D5D',
  heading: '#6BCB77',
  first_touch: '#D4A843',
  forward_pass: '#5BBFCF',
  '1v1_defense': '#B088CF',
}

type Props = {
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagSelector({ selected, onChange }: Props) {
  function toggle(tagId: string) {
    if (selected.includes(tagId)) {
      onChange(selected.filter((t) => t !== tagId))
    } else {
      onChange([...selected, tagId])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#706B56',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>SKILL TAGS</p>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: '14px',
          color: '#F4F2EA',
          marginTop: '2px',
        }}>어떤 기술을 보여줬나요?</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {TAG_LIST.map((tag) => {
          const isActive = selected.includes(tag.id)
          const color = TAG_COLORS[tag.id] ?? '#D4A843'
          return (
            <button
              key={tag.id}
              onClick={() => toggle(tag.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? color + '55' : '#2A2F22'}`,
                background: isActive ? color + '18' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '14px' }}>{tag.icon}</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: isActive ? color : '#706B56',
              }}>
                {tag.display_name}
              </span>
              {isActive && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: '#A8A28A',
        }}>
          {selected.length}개 태그 선택됨
        </p>
      )}
    </div>
  )
}
