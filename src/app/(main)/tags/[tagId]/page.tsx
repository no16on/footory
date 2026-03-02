'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { useTagClips } from '@/hooks/useTags'
import { TAG_LIST } from '@/types/clip'
import type { TagClipEntry } from '@/hooks/useTags'

const TAG_COLORS: Record<string, string> = {
  '1v1_dribble': '#E8943A',
  shooting: '#E85D5D',
  heading: '#5BBFCF',
  first_touch: '#D4A843',
  forward_pass: '#6BCB77',
  '1v1_defense': '#5B9ECF',
}

function formatDuration(sec: number | null) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

type VideoModalProps = {
  videoUrl: string
  onClose: () => void
  trimStart?: number
  trimEnd?: number
}

function VideoModal({ videoUrl, onClose, trimStart, trimEnd }: VideoModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '390px' }}>
        <video
          src={trimStart !== undefined ? `${videoUrl}#t=${trimStart},${trimEnd}` : videoUrl}
          controls
          autoPlay
          playsInline
          style={{
            width: '100%',
            borderRadius: '10px',
            background: '#161A12',
          }}
        />
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #2A2F22',
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            color: '#F4F2EA',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}

type ClipCardProps = {
  entry: TagClipEntry
  color: string
  onSetTop: () => void
  onRemoveTag: () => void
  onPlay: () => void
}

function ClipCard({ entry, color, onSetTop, onRemoveTag, onPlay }: ClipCardProps) {
  const clip = entry.clips
  if (!clip) return null
  const isTop = entry.is_top_clip
  const highlight = clip.highlights?.[0] ?? null

  return (
    <div style={{
      background: '#1A1E16',
      borderRadius: '12px',
      border: `1px solid ${isTop ? color + '40' : '#2A2F22'}`,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top clip badge */}
      {isTop && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 2,
          padding: '3px 8px',
          background: 'linear-gradient(135deg, #B8922E, #D4A843)',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          fontWeight: 800,
          color: '#0B0E11',
          letterSpacing: '0.5px',
        }}>
          ⭐ TOP CLIP
        </div>
      )}

      {/* Video thumbnail area */}
      <div
        onClick={onPlay}
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #161A12, #1E221A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {clip.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.thumbnail_url} alt="clip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212,168,67,0.2)',
            border: '1px solid rgba(212,168,67,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0D078">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {/* Duration badge */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '4px',
          padding: '2px 6px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#F0D078',
        }}>
          {highlight
            ? `${Math.round(highlight.end_seconds - highlight.start_seconds)}s`
            : formatDuration(clip.duration_seconds)}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Memo + date */}
        <div>
          {clip.memo && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#F4F2EA', marginBottom: '4px' }}>
              {clip.memo}
            </p>
          )}
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56' }}>
            {formatDate(clip.created_at)}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isTop ? (
            <button
              onClick={onSetTop}
              style={{
                flex: 1,
                padding: '8px',
                background: `${color}12`,
                border: `1px solid ${color}30`,
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '12px',
                color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              TOP으로 설정
            </button>
          ) : (
            <div style={{
              flex: 1,
              padding: '8px',
              background: `${color}08`,
              border: `1px solid ${color}20`,
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color: '#706B56',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              현재 TOP 클립
            </div>
          )}
          <button
            onClick={onRemoveTag}
            style={{
              padding: '8px 12px',
              background: 'rgba(232,93,93,0.08)',
              border: '1px solid rgba(232,93,93,0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="이 태그에서 제거"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#E85D5D">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TagDetailPage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = use(params)
  const router = useRouter()
  const { clips, isLoading, error, setTopClip, removeTag } = useTagClips(tagId)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [playingStart, setPlayingStart] = useState<number | undefined>()
  const [playingEnd, setPlayingEnd] = useState<number | undefined>()

  const tagInfo = TAG_LIST.find((t) => t.id === tagId)
  const color = TAG_COLORS[tagId] ?? '#D4A843'

  function handlePlay(entry: TagClipEntry) {
    const clip = entry.clips
    if (!clip) return
    const h = clip.highlights?.[0]
    if (h) {
      setPlayingUrl(clip.video_url)
      setPlayingStart(h.start_seconds)
      setPlayingEnd(h.end_seconds)
    } else {
      setPlayingUrl(clip.video_url)
      setPlayingStart(undefined)
      setPlayingEnd(undefined)
    }
  }

  async function handleRemove(clipId: string) {
    if (!confirm('이 태그에서 클립을 제거할까요?')) return
    await removeTag(clipId)
  }

  return (
    <>
      {playingUrl && (
        <VideoModal
          videoUrl={playingUrl}
          trimStart={playingStart}
          trimEnd={playingEnd}
          onClose={() => { setPlayingUrl(null); setPlayingStart(undefined); setPlayingEnd(undefined) }}
        />
      )}

      <NavHeader
        title={tagInfo?.display_name ?? tagId}
        showBack
        onBack={() => router.back()}
      />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Tag header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          background: '#1A1E16',
          borderRadius: '12px',
          border: `1px solid ${color}22`,
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
          }}>
            {tagInfo?.icon}
          </div>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              SKILL TAG
            </p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '20px', color: '#F4F2EA', marginTop: '2px' }}>
              {tagInfo?.display_name}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 700, color, marginTop: '4px' }}>
              {clips.length} 클립
            </p>
          </div>
        </div>

        {/* Clips section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#706B56',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            CLIPS ({clips.length})
          </p>
          <button
            onClick={() => router.push('/upload')}
            style={{
              padding: '6px 12px',
              background: `${color}12`,
              border: `1px solid ${color}30`,
              borderRadius: '20px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              color,
              cursor: 'pointer',
            }}
          >
            + 클립 추가
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#706B56', letterSpacing: '1px' }}>
            LOADING...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '14px', background: 'rgba(232,93,93,0.1)', border: '1px solid rgba(232,93,93,0.2)', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#E85D5D' }}>
            {error}
          </div>
        )}

        {/* Clips grid */}
        {!isLoading && clips.length === 0 && (
          <div style={{
            padding: '40px 24px',
            background: '#12160F',
            border: '1px dashed rgba(255,255,255,0.06)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '32px' }}>{tagInfo?.icon}</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#706B56', marginTop: '12px' }}>
              이 태그에 연결된 클립이 없습니다
            </p>
            <button
              onClick={() => router.push('/upload')}
              style={{
                marginTop: '16px',
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
              영상 업로드
            </button>
          </div>
        )}

        {!isLoading && clips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clips.map((entry) => (
              <ClipCard
                key={entry.clip_id}
                entry={entry}
                color={color}
                onPlay={() => handlePlay(entry)}
                onSetTop={() => setTopClip(entry.clip_id)}
                onRemoveTag={() => handleRemove(entry.clip_id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
