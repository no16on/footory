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
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-border px-5 flex items-center justify-between h-12 w-full">
      <div className="w-6 flex items-center">
        {showBack && (
          <button
            onClick={() => onBack ? onBack() : router.back()}
            className="bg-transparent border-none p-0 cursor-pointer flex items-center text-text"
            aria-label="뒤로 가기"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        )}
      </div>

      {title && (
        <span className="text-sm font-bold font-display text-text absolute left-1/2 -translate-x-1/2">
          {title}
        </span>
      )}

      <div className="w-6 flex items-center justify-end">
        {rightAction}
      </div>
    </header>
  )
}
