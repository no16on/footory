'use client'

import { useRef, useState } from 'react'

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v']
const MAX_SIZE_MB = 500
const MAX_DURATION_SEC = 300
const METADATA_TIMEOUT_MS = 10000

/** 파일 확장자에서 MIME type 추론 (모바일 브라우저 fallback) */
function inferContentType(fileName: string): string | null {
  const ext = fileName.toLowerCase().split('.').pop()
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
  }
  return map[ext || ''] || null
}

/** 파일이 허용된 비디오 형식인지 확인 (MIME + 확장자 모두 체크) */
function isAllowedVideo(file: File): boolean {
  // 1) MIME type이 있으면 체크
  if (file.type && ALLOWED_TYPES.includes(file.type)) return true
  // 2) MIME type이 빈 문자열이거나 generic인 경우 확장자로 판단
  const inferred = inferContentType(file.name)
  return inferred !== null
}

/** 업로드에 사용할 Content-Type 결정 */
export function resolveContentType(file: File): string {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type
  return inferContentType(file.name) || 'video/mp4'
}

type Props = {
  onFileSelected: (file: File, duration: number) => void
}

export function UploadDropzone({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateAndSelect(file: File) {
    setError(null)
    if (!isAllowedVideo(file)) {
      setError('MP4, MOV, WebM 파일만 업로드할 수 있습니다')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다`)
      return
    }
    // Check duration via video element
    const video = document.createElement('video')
    video.preload = 'metadata'
    const url = URL.createObjectURL(file)
    video.src = url

    let resolved = false
    const cleanup = () => {
      if (resolved) return
      resolved = true
      URL.revokeObjectURL(url)
    }

    // 타임아웃: 모바일에서 메타데이터 로딩이 실패할 수 있음
    const timer = setTimeout(() => {
      if (resolved) return
      cleanup()
      // 메타데이터 없이 진행 (duration 0으로 fallback)
      onFileSelected(file, 0)
    }, METADATA_TIMEOUT_MS)

    video.onloadedmetadata = () => {
      clearTimeout(timer)
      cleanup()
      if (video.duration > MAX_DURATION_SEC) {
        setError(`영상은 최대 5분(300초)까지 업로드 가능합니다`)
        return
      }
      onFileSelected(file, video.duration)
    }
    video.onerror = () => {
      clearTimeout(timer)
      cleanup()
      setError('영상 파일을 읽을 수 없습니다. 다른 파일을 시도해주세요.')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSelect(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#D4A843' : '#2A2F22'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          background: isDragging ? 'rgba(212,168,67,0.04)' : 'rgba(255,255,255,0.01)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(212,168,67,0.1)',
            border: '1px solid rgba(212,168,67,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#D4A843">
            <path d="M17 12h-5v5h-2v-5H5l7-7 7 7z" />
            <path d="M19 19H5v-2H3v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h-2v2z" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            color: '#F4F2EA',
            marginBottom: '6px',
          }}>
            영상 선택하기
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: '#706B56',
            lineHeight: 1.5,
          }}>
            MP4, MOV, WebM · 최대 500MB · 5분 이하
          </p>
        </div>

        <div
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '13px',
            color: '#0B0E11',
            boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
          }}
        >
          파일 선택
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 14px',
          background: 'rgba(232,93,93,0.1)',
          border: '1px solid rgba(232,93,93,0.2)',
          borderRadius: '8px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#E85D5D',
        }}>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
