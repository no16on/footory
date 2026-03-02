'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface NavHeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: ReactNode
}

export function NavHeader({ title, showBack = false, onBack, rightAction }: NavHeaderProps) {
  const router = useRouter()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#12160F',
        borderBottom: '1px solid #2A2F22',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '46px',
        width: '100%',
      }}
    >
      {/* Left: back button or spacer */}
      <div style={{ width: '22px', display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            onClick={() => onBack ? onBack() : router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#F4F2EA',
            }}
            aria-label="뒤로 가기"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Center: title */}
      {title && (
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            color: '#F4F2EA',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {title}
        </span>
      )}

      {/* Right: action or spacer */}
      <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {rightAction}
      </div>
    </header>
  )
}
