'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

type Props = {
  videoUrl: string
  duration: number
  trimStart: number
  trimEnd: number
  onTrimChange: (start: number, end: number) => void
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TrimPreview({ videoUrl, duration, trimStart, trimEnd, onTrimChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(trimStart)
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null)
  const animFrameRef = useRef<number>(0)

  const MAX_TRIM = 30

  // Clamp trim end to start + 30
  function clampEnd(start: number, end: number) {
    return Math.min(end, start + MAX_TRIM, duration)
  }

  // Sync video to trimStart on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimStart
      setCurrentTime(trimStart)
    }
  }, [trimStart])

  // Stop at trimEnd
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function onTimeUpdate() {
      if (!video) return
      setCurrentTime(video.currentTime)
      if (video.currentTime >= trimEnd) {
        video.pause()
        video.currentTime = trimStart
        setIsPlaying(false)
      }
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [trimStart, trimEnd])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.currentTime = trimStart
      video.play()
      setIsPlaying(true)
    }
  }

  function getHandlePos(sec: number) {
    return duration > 0 ? (sec / duration) * 100 : 0
  }

  const handleDragMove = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track || !dragging) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const sec = ratio * duration

    if (dragging === 'start') {
      const newStart = Math.max(0, Math.min(sec, trimEnd - 1))
      const newEnd = clampEnd(newStart, trimEnd)
      onTrimChange(newStart, newEnd)
      if (videoRef.current) videoRef.current.currentTime = newStart
    } else {
      const newEnd = Math.max(trimStart + 1, Math.min(sec, duration))
      const newStart = Math.max(0, newEnd - MAX_TRIM > trimStart ? newEnd - MAX_TRIM : trimStart)
      onTrimChange(newStart, clampEnd(newStart, newEnd))
    }
  }, [dragging, duration, trimStart, trimEnd, onTrimChange])

  useEffect(() => {
    if (!dragging) return
    function onMouseMove(e: MouseEvent) { handleDragMove(e.clientX) }
    function onTouchMove(e: TouchEvent) { handleDragMove(e.touches[0].clientX) }
    function onUp() { setDragging(null) }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, handleDragMove])

  const trimDuration = trimEnd - trimStart
  const startPct = getHandlePos(trimStart)
  const endPct = getHandlePos(trimEnd)
  const currentPct = getHandlePos(currentTime)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Video preview */}
      <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#161A12', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          playsInline
          preload="metadata"
        />
        {/* Play overlay */}
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(212,168,67,0.2)',
            border: '1px solid rgba(212,168,67,0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0D078">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0D078">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        {/* Duration badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '4px',
          padding: '2px 6px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#F0D078',
        }}>
          {formatTime(trimDuration)}s
        </div>
      </div>

      {/* Trim label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase' }}>TRIM</span>
          <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '14px', color: '#F4F2EA', marginTop: '2px' }}>
            {formatTime(trimStart)} — {formatTime(trimEnd)}
          </p>
        </div>
        <div style={{
          padding: '4px 10px',
          background: trimDuration >= MAX_TRIM ? 'rgba(232,93,93,0.12)' : 'rgba(212,168,67,0.1)',
          border: `1px solid ${trimDuration >= MAX_TRIM ? 'rgba(232,93,93,0.3)' : 'rgba(212,168,67,0.2)'}`,
          borderRadius: '20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          fontWeight: 700,
          color: trimDuration >= MAX_TRIM ? '#E85D5D' : '#D4A843',
        }}>
          {Math.round(trimDuration)}s / 30s
        </div>
      </div>

      {/* Trim track */}
      <div style={{ padding: '8px 0' }}>
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            height: '40px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '6px',
            border: '1px solid #2A2F22',
          }}
        >
          {/* Selected range */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${startPct}%`,
              width: `${endPct - startPct}%`,
              background: 'rgba(212,168,67,0.15)',
              border: '2px solid #D4A843',
              borderRadius: '4px',
            }}
          />
          {/* Current time indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${currentPct}%`,
              width: '2px',
              background: '#F0D078',
              borderRadius: '1px',
              pointerEvents: 'none',
            }}
          />
          {/* Start handle */}
          <div
            onMouseDown={() => setDragging('start')}
            onTouchStart={() => setDragging('start')}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${startPct}%`,
              transform: 'translate(-50%, -50%)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#D4A843',
              border: '2px solid #F0D078',
              cursor: 'grab',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="#0B0E11">
              <rect x="1" y="1" width="2" height="8" rx="1" />
              <rect x="5" y="1" width="2" height="8" rx="1" />
            </svg>
          </div>
          {/* End handle */}
          <div
            onMouseDown={() => setDragging('end')}
            onTouchStart={() => setDragging('end')}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${endPct}%`,
              transform: 'translate(-50%, -50%)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#D4A843',
              border: '2px solid #F0D078',
              cursor: 'grab',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="#0B0E11">
              <rect x="1" y="1" width="2" height="8" rx="1" />
              <rect x="5" y="1" width="2" height="8" rx="1" />
            </svg>
          </div>
        </div>
        {/* Time labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56' }}>0:00</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56' }}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
