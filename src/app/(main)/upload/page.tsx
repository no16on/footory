'use client'

import { useRouter } from 'next/navigation'
import { NavHeader } from '@/components/ui/nav-header'
import { UploadDropzone } from '@/components/upload/UploadDropzone'
import { TrimPreview } from '@/components/upload/TrimPreview'
import { TagSelector } from '@/components/upload/TagSelector'
import { useUploadStore } from '@/stores/upload-store'
import { useState } from 'react'

const STEPS = ['select', 'uploading', 'trim', 'tags', 'done'] as const

function StepIndicator({ current }: { current: string }) {
  const steps = [
    { key: 'select', label: '파일 선택' },
    { key: 'trim', label: '트림' },
    { key: 'tags', label: '태그' },
  ]
  const visibleSteps = ['select', 'trim', 'tags']
  const currentIdx = visibleSteps.indexOf(current === 'uploading' ? 'select' : current)

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: i <= currentIdx
              ? 'linear-gradient(135deg, #B8922E, #D4A843)'
              : 'rgba(255,255,255,0.06)',
            border: i === currentIdx ? '2px solid #F0D078' : 'none',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: '11px',
            color: i <= currentIdx ? '#0B0E11' : '#706B56',
            transition: 'all 0.2s',
          }}>
            {i < currentIdx ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0E11">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (i + 1)}
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: i === currentIdx ? 700 : 400,
            color: i === currentIdx ? '#F4F2EA' : '#706B56',
          }}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div style={{
              width: '20px',
              height: '1px',
              background: i < currentIdx ? '#D4A843' : '#2A2F22',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function UploadPage() {
  const router = useRouter()
  const store = useUploadStore()
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function handleFileSelected(file: File, duration: number) {
    store.setFile(file)
    setVideoDuration(duration)
    const objUrl = URL.createObjectURL(file)
    setVideoObjectUrl(objUrl)
    // Default trim: first 30 seconds (or full if shorter)
    store.setTrimRange(0, Math.min(30, duration))
    startUpload(file)
  }

  async function startUpload(file: File) {
    store.setStep('uploading')
    store.setUploadProgress(0)
    setSubmitError(null)

    try {
      // 1. Get presigned URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })
      const presignData = await presignRes.json()
      if (presignData.error) throw new Error(presignData.error)

      const { presignedUrl, key } = presignData

      // 2. Upload to R2 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            store.setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('Upload network error'))
        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // 3. Create clip record
      const clipRes = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2Key: key,
          durationSeconds: Math.floor(videoDuration || 0),
          fileSizeBytes: file.size,
        }),
      })
      const clipData = await clipRes.json()
      if (clipData.error) throw new Error(clipData.error)

      store.setClipId(clipData.data.id)
      store.setVideoUrl(clipData.data.video_url)
      store.setStep('trim')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setSubmitError(msg)
      store.setStep('select')
    }
  }

  async function handleTrimConfirm() {
    store.setStep('tags')
  }

  async function handleTagsConfirm() {
    if (!store.clipId) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/highlights/trim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId: store.clipId,
          startSeconds: store.trimStart,
          endSeconds: store.trimEnd,
          tagIds: store.selectedTags,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      store.setHighlightId(data.data.id)
      store.setStep('done')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDone() {
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl)
    store.reset()
    router.push('/profile')
  }

  const currentStep = store.step

  return (
    <>
      <NavHeader
        title="영상 업로드"
        showBack={currentStep !== 'done'}
        onBack={() => {
          if (currentStep === 'trim') store.setStep('select')
          else if (currentStep === 'tags') store.setStep('trim')
          else router.back()
        }}
      />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step indicator */}
        {currentStep !== 'done' && currentStep !== 'uploading' && (
          <StepIndicator current={currentStep} />
        )}

        {/* STEP: select */}
        {currentStep === 'select' && (
          <>
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase' }}>UPLOAD</p>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '20px', color: '#F4F2EA', marginTop: '4px' }}>
                영상을 업로드하세요
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#A8A28A', marginTop: '6px' }}>
                경기나 훈련 영상을 올리면, 30초 하이라이트로 트림할 수 있어요
              </p>
            </div>
            {submitError && (
              <div style={{ padding: '12px 14px', background: 'rgba(232,93,93,0.1)', border: '1px solid rgba(232,93,93,0.2)', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#E85D5D' }}>
                {submitError}
              </div>
            )}
            <UploadDropzone onFileSelected={handleFileSelected} />
          </>
        )}

        {/* STEP: uploading */}
        {currentStep === 'uploading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '40px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#D4A843">
                <path d="M17 12h-5v5h-2v-5H5l7-7 7 7z" />
                <path d="M19 19H5v-2H3v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h-2v2z" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: '#F4F2EA' }}>업로드 중...</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#A8A28A', marginTop: '6px' }}>{store.file?.name}</p>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${store.uploadProgress}%`,
                  background: 'linear-gradient(90deg, #B8922E, #D4A843)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#D4A843', marginTop: '8px', textAlign: 'center' }}>
                {store.uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* STEP: trim */}
        {currentStep === 'trim' && videoObjectUrl && (
          <>
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase' }}>HIGHLIGHT TRIM</p>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '20px', color: '#F4F2EA', marginTop: '4px' }}>
                하이라이트 구간 선택
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#A8A28A', marginTop: '6px' }}>
                최대 30초 구간을 선택하세요
              </p>
            </div>

            <TrimPreview
              videoUrl={videoObjectUrl}
              duration={videoDuration}
              trimStart={store.trimStart}
              trimEnd={store.trimEnd}
              onTrimChange={store.setTrimRange}
            />

            <button
              onClick={handleTrimConfirm}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                color: '#0B0E11',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
              }}
            >
              다음 — 태그 선택
            </button>
          </>
        )}

        {/* STEP: tags */}
        {currentStep === 'tags' && (
          <>
            <TagSelector
              selected={store.selectedTags}
              onChange={store.setSelectedTags}
            />

            {/* Memo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                MEMO (선택)
              </label>
              <textarea
                value={store.memo}
                onChange={(e) => store.setMemo(e.target.value)}
                placeholder="이 영상에 대한 메모..."
                maxLength={200}
                rows={3}
                style={{
                  background: '#12160F',
                  border: '1px solid #2A2F22',
                  borderRadius: '8px',
                  color: '#F4F2EA',
                  padding: '10px 14px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            {submitError && (
              <div style={{ padding: '12px 14px', background: 'rgba(232,93,93,0.1)', border: '1px solid rgba(232,93,93,0.2)', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#E85D5D' }}>
                {submitError}
              </div>
            )}

            <button
              onClick={handleTagsConfirm}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                background: isSubmitting ? 'rgba(212,168,67,0.3)' : 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                color: '#0B0E11',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
              }}
            >
              {isSubmitting ? '저장 중...' : '하이라이트 저장'}
            </button>
          </>
        )}

        {/* STEP: done */}
        {currentStep === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '40px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(107,203,119,0.12)',
              border: '1px solid rgba(107,203,119,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#6BCB77">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '22px', color: '#F4F2EA' }}>
                하이라이트 저장 완료!
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#A8A28A', marginTop: '8px' }}>
                프로필에 하이라이트가 추가되었습니다
              </p>
              {store.selectedTags.length > 0 && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#706B56', marginTop: '6px' }}>
                  {store.selectedTags.length}개 기술 태그 연결됨
                </p>
              )}
            </div>

            <button
              onClick={handleDone}
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '14px',
                background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                color: '#0B0E11',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
              }}
            >
              프로필로 돌아가기
            </button>
          </div>
        )}
      </div>
    </>
  )
}
