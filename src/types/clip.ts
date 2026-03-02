export type Clip = {
  id: string
  player_id: string
  source: string
  source_team_id: string | null
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  file_size_bytes: number | null
  memo: string | null
  created_at: string
  // Joined
  clip_tags?: ClipTag[]
}

export type ClipTag = {
  clip_id: string
  tag_id: string
  is_top_clip: boolean
  tag?: {
    id: string
    display_name: string
    display_name_en: string | null
    icon: string | null
  }
}

export type Highlight = {
  id: string
  player_id: string
  clip_id: string
  video_url: string
  thumbnail_url: string | null
  start_seconds: number
  end_seconds: number
  duration_seconds: number | null
  is_featured: boolean
  featured_order: number | null
  created_at: string
  // Joined
  clip?: Clip
}

export type UploadStep = 'select' | 'uploading' | 'trim' | 'tags' | 'done'

export const TAG_LIST = [
  { id: '1v1_dribble', display_name: '1v1 돌파', icon: '⚡' },
  { id: 'shooting', display_name: '슈팅', icon: '🎯' },
  { id: 'heading', display_name: '헤딩경합', icon: '💪' },
  { id: 'first_touch', display_name: '퍼스트터치', icon: '✨' },
  { id: 'forward_pass', display_name: '전진패스', icon: '📡' },
  { id: '1v1_defense', display_name: '1v1 수비', icon: '🛡️' },
] as const

export type TagId = (typeof TAG_LIST)[number]['id']
