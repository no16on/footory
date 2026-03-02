'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { useClips, useHighlights } from '@/hooks/useClips'
import { useProfile } from '@/hooks/useProfile'
import { TAG_LIST } from '@/types/clip'

function formatDuration(seconds: number | null) {
  if (!seconds) return '?'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

type TabType = 'highlights' | 'clips'

function ClipsSkeleton() {
  return (
    <div className="px-5 pt-4 flex flex-col gap-3">
      <div className="skeleton h-[200px] rounded-2xl" />
      <div className="skeleton h-[200px] rounded-2xl" />
    </div>
  )
}

export default function ClipsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('highlights')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const { profile } = useProfile()
  const { clips, isLoading: clipsLoading, deleteClip } = useClips()
  const { highlights, isLoading: hlLoading, toggleFeature } = useHighlights(profile?.id)

  function showNotice(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 2000)
  }

  async function handleDelete(clipId: string) {
    setDeletingId(clipId)
    const result = await deleteClip(clipId)
    setDeletingId(null)
    if (result.error) showNotice(result.error)
    else showNotice('클립이 삭제되었습니다')
  }

  async function handleToggleFeature(highlightId: string, current: boolean) {
    const result = await toggleFeature(highlightId, !current)
    if (result.error) showNotice(result.error)
    else showNotice(current ? '대표 하이라이트에서 해제했습니다' : '대표 하이라이트로 설정했습니다')
  }

  const featuredHighlights = highlights.filter((h) => h.is_featured)
  const otherHighlights = highlights.filter((h) => !h.is_featured)

  return (
    <>
      <NavHeader
        title="영상 라이브러리"
        rightAction={
          <button
            onClick={() => router.push('/upload')}
            aria-label="새 영상 업로드"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-accent/35 bg-accent-dim text-accent-light font-mono text-[10px] font-bold tracking-wide cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            업로드
          </button>
        }
      />

      {/* Toast */}
      {notice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-lg bg-accent/[0.12] border border-accent/25 font-sans text-xs text-accent-light whitespace-nowrap pointer-events-none animate-fade-in">
          {notice}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-0 px-5 border-b border-border bg-surface">
        {(['highlights', 'clips'] as const).map((t) => {
          const active = tab === t
          const label = t === 'highlights' ? `하이라이트 (${highlights.length})` : `원본 클립 (${clips.length})`
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 border-none bg-transparent font-sans text-xs cursor-pointer transition-all ${
                active ? 'font-bold text-accent-light border-b-2 border-b-accent' : 'font-semibold text-text-dim border-b-2 border-b-transparent'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="px-5 pt-4 pb-28 flex flex-col gap-3">
        {/* HIGHLIGHTS TAB */}
        {tab === 'highlights' && (
          <div className="animate-fade-in">
            {hlLoading && <ClipsSkeleton />}

            {!hlLoading && highlights.length === 0 && (
              <div className="py-8 px-5 border border-dashed border-accent/15 rounded-2xl text-center flex flex-col items-center gap-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#2A2F22">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                <p className="font-sans text-[13px] text-text-dim m-0">하이라이트가 없습니다</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="px-5 py-2.5 border-none rounded-xl font-sans text-[13px] font-extrabold text-bg cursor-pointer"
                  style={{ background: 'var(--bg-gold-gradient)', boxShadow: 'var(--shadow-gold-glow)' }}
                >
                  첫 영상 올리기
                </button>
              </div>
            )}

            {featuredHighlights.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase mb-2">
                  FEATURED · {featuredHighlights.length}/3
                </p>
                <div className="flex flex-col gap-2">
                  {featuredHighlights.map((h) => (
                    <HighlightCard key={h.id} highlight={h} onToggleFeature={handleToggleFeature} />
                  ))}
                </div>
              </div>
            )}

            {otherHighlights.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase mb-2">ALL HIGHLIGHTS</p>
                <div className="flex flex-col gap-2">
                  {otherHighlights.map((h) => (
                    <HighlightCard key={h.id} highlight={h} onToggleFeature={handleToggleFeature} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLIPS TAB */}
        {tab === 'clips' && (
          <div className="animate-fade-in">
            {clipsLoading && <ClipsSkeleton />}

            {!clipsLoading && clips.length === 0 && (
              <div className="py-8 px-5 border border-dashed border-accent/15 rounded-2xl text-center flex flex-col items-center gap-3">
                <p className="font-sans text-[13px] text-text-dim m-0">업로드된 클립이 없습니다</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="px-5 py-2.5 border-none rounded-xl font-sans text-[13px] font-extrabold text-bg cursor-pointer"
                  style={{ background: 'var(--bg-gold-gradient)', boxShadow: 'var(--shadow-gold-glow)' }}
                >
                  영상 업로드
                </button>
              </div>
            )}

            {!clipsLoading && clips.length > 0 && (
              <div className="flex flex-col gap-2">
                {clips.map((clip) => {
                  const tags = clip.clip_tags?.map((ct) => ct.tag).filter(Boolean) ?? []
                  return (
                    <div key={clip.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="relative aspect-video" style={{ background: 'var(--bg-video-thumb)' }}>
                        {clip.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={clip.thumbnail_url} alt="클립 썸네일" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(212,168,67,0.2)">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                        {clip.duration_seconds && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-accent-light">
                            {formatDuration(clip.duration_seconds)}
                          </span>
                        )}
                        {clip.source === 'team' && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-cyan/20 border border-cyan/35 font-mono text-[9px] text-cyan">TEAM</span>
                        )}
                      </div>
                      <div className="p-3 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-sans text-[13px] text-text flex-1 min-w-0 truncate m-0" style={{ color: clip.memo ? '#F4F2EA' : '#706B56' }}>
                            {clip.memo || '메모 없음'}
                          </p>
                          <p className="font-mono text-[9px] text-text-dim m-0 shrink-0">{formatDate(clip.created_at)}</p>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => {
                              const meta = TAG_LIST.find((t) => t.id === tag?.id)
                              return (
                                <span key={tag?.id} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 font-sans text-[10px] text-accent-light">
                                  {meta?.icon} {tag?.display_name}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(clip.id)}
                          disabled={deletingId === clip.id}
                          className="self-end px-2.5 py-1 rounded-lg border border-red/20 bg-red/[0.08] text-red font-sans text-[11px] font-semibold cursor-pointer disabled:opacity-60"
                        >
                          {deletingId === clip.id ? '삭제 중…' : '삭제'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function HighlightCard({
  highlight,
  onToggleFeature,
}: {
  highlight: { id: string; video_url: string; thumbnail_url: string | null; duration_seconds: number | null; is_featured: boolean; featured_order: number | null; created_at: string }
  onToggleFeature: (id: string, current: boolean) => void
}) {
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${highlight.is_featured ? 'rgba(212,168,67,0.3)' : '#2A2F22'}` }}
    >
      <div className="relative aspect-video" style={{ background: 'var(--bg-video-thumb)' }}>
        {highlight.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={highlight.thumbnail_url} alt="하이라이트 썸네일" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0D078">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        {highlight.duration_seconds && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-accent-light">
            {formatDuration(highlight.duration_seconds)}
          </span>
        )}
        {highlight.is_featured && (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] font-extrabold text-bg" style={{ background: 'var(--bg-gold-gradient)' }}>
            FEATURED {highlight.featured_order}
          </span>
        )}
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] text-text-dim m-0">{formatDate(highlight.created_at)}</p>
        <button
          onClick={() => onToggleFeature(highlight.id, highlight.is_featured)}
          className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-semibold cursor-pointer ${
            highlight.is_featured
              ? 'border border-accent/35 bg-accent-dim text-accent-light'
              : 'border border-border bg-white/[0.03] text-text-sec'
          }`}
        >
          {highlight.is_featured ? '대표 해제' : '대표 설정'}
        </button>
      </div>
    </div>
  )
}
