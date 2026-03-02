import { create } from 'zustand'
import type { UploadStep } from '@/types/clip'

type UploadState = {
  step: UploadStep
  file: File | null
  clipId: string | null
  videoUrl: string | null
  uploadProgress: number
  trimStart: number
  trimEnd: number
  selectedTags: string[]
  memo: string
  highlightId: string | null

  setStep: (step: UploadStep) => void
  setFile: (file: File | null) => void
  setClipId: (id: string) => void
  setVideoUrl: (url: string) => void
  setUploadProgress: (progress: number) => void
  setTrimRange: (start: number, end: number) => void
  setSelectedTags: (tags: string[]) => void
  setMemo: (memo: string) => void
  setHighlightId: (id: string) => void
  reset: () => void
}

const initialState = {
  step: 'select' as UploadStep,
  file: null,
  clipId: null,
  videoUrl: null,
  uploadProgress: 0,
  trimStart: 0,
  trimEnd: 30,
  selectedTags: [] as string[],
  memo: '',
  highlightId: null,
}

export const useUploadStore = create<UploadState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setFile: (file) => set({ file }),
  setClipId: (clipId) => set({ clipId }),
  setVideoUrl: (videoUrl) => set({ videoUrl }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setTrimRange: (trimStart, trimEnd) => set({ trimStart, trimEnd }),
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  setMemo: (memo) => set({ memo }),
  setHighlightId: (highlightId) => set({ highlightId }),
  reset: () => set(initialState),
}))
