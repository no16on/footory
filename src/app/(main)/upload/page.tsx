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
    <div className="flex gap-1.5 items-center">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-[800] text-[11px] transition-all ${
              i <= currentIdx
                ? 'bg-gold-gradient text-bg'
                : 'bg-white/[0.06] text-text-dim'
            } ${i === currentIdx ? 'border-2 border-accent-light' : ''}`}
          >
            {i < currentIdx ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0E11">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (i + 1)}
          </div>
          <span
            className={`font-sans text-[11px] ${
              i === currentIdx ? 'font-bold text-text' : 'font-normal text-text-dim'
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-5 h-px ${i < currentIdx ? 'bg-accent' : 'bg-border'}`}
            />
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
  const [isFeaturing, setIsFeaturing] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  function handleFileSelected(file: File, duration: number) {
    store.setFile(file)
    setVideoDuration(duration)
    const objUrl = URL.createObjectURL(file)
    setVideoObjectUrl(objUrl)
    store.setTrimRange(0, Math.min(30, duration))
    startUpload(file)
  }

  async function startUpload(file: File) {
    store.setStep('uploading')
    store.setUploadProgress(0)
    setSubmitError(null)

    try {
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

  async function handleFeature() {
    if (!store.highlightId) return
    setIsFeaturing(true)
    try {
      const res = await fetch(`/api/highlights/${store.highlightId}/feature`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setIsFeatured(true)
    } catch {
      setSubmitError('Featured 설정에 실패했습니다')
    } finally {
      setIsFeaturing(false)
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

      <div className="px-5 pt-4 pb-[100px] flex flex-col gap-6">
        {/* Step indicator */}
        {currentStep !== 'done' && currentStep !== 'uploading' && (
          <StepIndicator current={currentStep} />
        )}

        {/* STEP: select */}
        {currentStep === 'select' && (
          <>
            <div>
              <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase">UPLOAD</p>
              <h2 className="font-display font-[800] text-xl text-text mt-1">
                영상을 업로드하세요
              </h2>
              <p className="font-sans text-[13px] text-text-sec mt-1.5">
                경기나 훈련 영상을 올리면, 30초 하이라이트로 트림할 수 있어요
              </p>
            </div>
            {submitError && (
              <div className="px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-lg font-sans text-[13px] text-[#E85D5D]">
                {submitError}
              </div>
            )}
            <UploadDropzone onFileSelected={handleFileSelected} />
          </>
        )}

        {/* STEP: uploading */}
        {currentStep === 'uploading' && (
          <div className="flex flex-col items-center gap-6 pt-10">
            <div className="w-[72px] h-[72px] rounded-[18px] bg-accent-dim border border-accent/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#D4A843">
                <path d="M17 12h-5v5h-2v-5H5l7-7 7 7z" />
                <path d="M19 19H5v-2H3v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h-2v2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-text">업로드 중...</p>
              <p className="font-sans text-[13px] text-text-sec mt-1.5">{store.file?.name}</p>
            </div>
            <div className="w-full max-w-[280px]">
              <div className="h-1.5 bg-white/[0.06] rounded-[3px] overflow-hidden">
                <div
                  className="h-full bg-gold-gradient rounded-[3px] transition-[width] duration-300 ease-out"
                  style={{ width: `${store.uploadProgress}%` }}
                />
              </div>
              <p className="font-mono text-xs text-accent mt-2 text-center">
                {store.uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* STEP: trim */}
        {currentStep === 'trim' && videoObjectUrl && (
          <>
            <div>
              <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase">HIGHLIGHT TRIM</p>
              <h2 className="font-display font-[800] text-xl text-text mt-1">
                하이라이트 구간 선택
              </h2>
              <p className="font-sans text-[13px] text-text-sec mt-1.5">
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
              className="w-full py-3.5 bg-gold-gradient border-none rounded-[10px] font-sans font-[800] text-sm text-bg cursor-pointer shadow-gold-glow"
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

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase">
                MEMO (선택)
              </label>
              <textarea
                value={store.memo}
                onChange={(e) => store.setMemo(e.target.value)}
                placeholder="이 영상에 대한 메모..."
                maxLength={200}
                rows={3}
                className="bg-surface border border-border rounded-lg text-text px-3.5 py-2.5 font-sans text-sm resize-none outline-none focus:border-accent/40"
              />
            </div>

            {submitError && (
              <div className="px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-lg font-sans text-[13px] text-[#E85D5D]">
                {submitError}
              </div>
            )}

            <button
              onClick={handleTagsConfirm}
              disabled={isSubmitting}
              className={`w-full py-3.5 border-none rounded-[10px] font-sans font-[800] text-sm text-bg shadow-gold-glow ${
                isSubmitting
                  ? 'bg-accent/30 cursor-not-allowed'
                  : 'bg-gold-gradient cursor-pointer'
              }`}
            >
              {isSubmitting ? '저장 중...' : '하이라이트 저장'}
            </button>
          </>
        )}

        {/* STEP: done */}
        {currentStep === 'done' && (
          <div className="flex flex-col items-center gap-6 pt-10 text-center">
            <div className={`w-20 h-20 rounded-[20px] flex items-center justify-center border ${
              isFeatured
                ? 'bg-accent-dim border-accent/25'
                : 'bg-[rgba(107,203,119,0.12)] border-[rgba(107,203,119,0.25)]'
            }`}>
              {isFeatured ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#D4A843">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#6BCB77">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="font-display font-black text-[22px] text-text">
                {isFeatured ? 'Featured 설정 완료!' : '하이라이트 저장 완료!'}
              </h2>
              <p className="font-sans text-sm text-text-sec mt-2">
                {isFeatured
                  ? '프로필 상단에 하이라이트가 표시됩니다'
                  : '프로필에 하이라이트가 추가되었습니다'}
              </p>
              {store.selectedTags.length > 0 && (
                <p className="font-sans text-[13px] text-text-dim mt-1.5">
                  {store.selectedTags.length}개 기술 태그 연결됨
                </p>
              )}
            </div>

            {submitError && (
              <div className="px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-lg font-sans text-[13px] text-[#E85D5D] w-full max-w-[280px]">
                {submitError}
              </div>
            )}

            {!isFeatured && (
              <button
                onClick={handleFeature}
                disabled={isFeaturing}
                className={`w-full max-w-[280px] py-3.5 border-none rounded-[10px] font-sans font-[800] text-sm text-bg shadow-gold-glow ${
                  isFeaturing
                    ? 'bg-accent/30 cursor-not-allowed'
                    : 'bg-gold-gradient cursor-pointer'
                }`}
              >
                {isFeaturing ? '설정 중...' : '⭐ Featured로 설정하기'}
              </button>
            )}

            <button
              onClick={handleDone}
              className="w-full max-w-[280px] py-3.5 bg-transparent border border-border rounded-[10px] font-sans font-bold text-sm text-text-sec cursor-pointer hover:border-accent/40 hover:text-text transition-colors"
            >
              프로필로 돌아가기
            </button>
          </div>
        )}
      </div>
    </>
  )
}
