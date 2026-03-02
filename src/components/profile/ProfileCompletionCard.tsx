'use client'

import Link from 'next/link'
import type { Player } from '@/types/profile'

interface ProfileCompletionCardProps {
  profile: Player
  highlightCount: number
  tagCount: number
  measurementCount: number
  seasonCount: number
}

interface CheckItem {
  label: string
  done: boolean
  href: string
}

export default function ProfileCompletionCard({
  profile,
  highlightCount,
  tagCount,
  measurementCount,
  seasonCount,
}: ProfileCompletionCardProps) {
  const items: CheckItem[] = [
    { label: '프로필 사진', done: !!profile.profile_image_url, href: '/profile/edit' },
    { label: '자기소개', done: !!profile.bio, href: '/profile/edit' },
    { label: '포지션 설정', done: !!profile.position, href: '/profile/edit' },
    { label: '대표 하이라이트', done: highlightCount > 0, href: '/upload' },
    { label: '측정 기록', done: measurementCount > 0, href: '/measurements' },
    { label: '기술 태그', done: tagCount > 0, href: '/upload' },
    { label: '시즌 기록', done: seasonCount > 0, href: '/profile' },
  ]

  const completed = items.filter((i) => i.done).length
  const total = items.length

  if (completed === total) return null

  const percent = Math.round((completed / total) * 100)

  return (
    <section className="bg-card border border-border rounded-[var(--radius-card)] p-4">
      {/* Section header */}
      <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-dim mb-1">
        PROFILE COMPLETION
      </p>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold text-text">
          프로필 완성도
        </h3>
        <span className="font-mono text-xs font-semibold text-accent">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-[image:var(--bg-gold-gradient)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.done ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-text-sec">
                <span className="text-green text-sm">✓</span>
                <span className="text-xs line-through">{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] bg-accent-dim hover:bg-accent/15 transition-colors group"
              >
                <span className="w-4 h-4 rounded-full border border-accent/40 flex-shrink-0" />
                <span className="text-xs font-medium text-accent-light group-hover:text-accent">
                  {item.label}
                </span>
                <svg
                  className="ml-auto w-3.5 h-3.5 text-accent/50 group-hover:text-accent transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
