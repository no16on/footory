export type ScoutPlayer = {
  id: string
  handle: string
  display_name: string
  position: string | null
  region: string | null
  bio: string | null
  profile_image_url: string | null
  clips_count: number
  highlights_count: number
  tags_active_count: number
  featured_thumbnail_url: string | null
  featured_duration_seconds: number | null
  updated_at: string
}

export type ScoutFilters = {
  q?: string
  position?: string
  region?: string
}
