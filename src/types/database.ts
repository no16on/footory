// Supabase에서 자동 생성된 타입 (npx supabase gen types typescript 실행 후 교체)
// 현재는 placeholder 타입

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          user_id: string
          handle: string
          display_name: string
          birth_year: number | null
          position: string | null
          secondary_position: string | null
          region: string | null
          current_team_id: string | null
          current_season_year: number
          profile_image_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          handle: string
          display_name: string
          birth_year?: number | null
          position?: string | null
          secondary_position?: string | null
          region?: string | null
          current_team_id?: string | null
          current_season_year?: number
          profile_image_url?: string | null
          bio?: string | null
        }
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      clips: {
        Row: {
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
        }
        Insert: {
          id?: string
          player_id: string
          source?: string
          source_team_id?: string | null
          video_url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          memo?: string | null
        }
        Update: Partial<Database['public']['Tables']['clips']['Insert']>
      }
      highlights: {
        Row: {
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
        }
        Insert: {
          id?: string
          player_id: string
          clip_id: string
          video_url: string
          thumbnail_url?: string | null
          start_seconds: number
          end_seconds: number
          is_featured?: boolean
          featured_order?: number | null
        }
        Update: Partial<Database['public']['Tables']['highlights']['Insert']>
      }
      tags: {
        Row: {
          id: string
          display_name: string
          display_name_en: string | null
          icon: string | null
          sort_order: number
        }
        Insert: {
          id: string
          display_name: string
          display_name_en?: string | null
          icon?: string | null
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          region: string | null
          season_year: number
          invite_code: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          region?: string | null
          season_year?: number
          invite_code?: string | null
          created_by: string
        }
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
