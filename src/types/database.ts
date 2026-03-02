// Supabase에서 자동 생성된 타입 (npx supabase gen types typescript 실행 후 교체)
// 현재는 placeholder 타입

export type Database = {
  public: {
    Tables: {
      players: {
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
      clip_tags: {
        Relationships: []
        Row: {
          clip_id: string
          tag_id: string
          is_top_clip: boolean
        }
        Insert: {
          clip_id: string
          tag_id: string
          is_top_clip?: boolean
        }
        Update: Partial<Database['public']['Tables']['clip_tags']['Insert']>
      }
      measurement_types: {
        Relationships: []
        Row: {
          id: string
          display_name: string
          unit: string
          condition_operator: string
          distance_m: number | null
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id: string
          display_name: string
          unit: string
          condition_operator: string
          distance_m?: number | null
          sort_order?: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['measurement_types']['Insert']>
      }
      measurement_records: {
        Relationships: []
        Row: {
          id: string
          player_id: string
          type_id: string
          value_display: string
          value_normalized: number
          attempt_context: string | null
          recorded_at: string
          location: string | null
          note: string | null
          evidence_media_url: string | null
          verification_status: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          type_id: string
          value_display: string
          value_normalized: number
          attempt_context?: string | null
          recorded_at: string
          location?: string | null
          note?: string | null
          evidence_media_url?: string | null
          verification_status?: string | null
          verified_by?: string | null
          verified_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['measurement_records']['Insert']>
      }
      medal_rules: {
        Relationships: []
        Row: {
          id: string
          type_id: string
          display_name: string
          threshold_value: number
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id: string
          type_id: string
          display_name: string
          threshold_value: number
          sort_order?: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['medal_rules']['Insert']>
      }
      player_medals: {
        Relationships: []
        Row: {
          id: string
          player_id: string
          medal_rule_id: string
          earned_from_record_id: string | null
          earned_at: string
          verification_status_snapshot: string | null
          is_featured: boolean
        }
        Insert: {
          id?: string
          player_id: string
          medal_rule_id: string
          earned_from_record_id?: string | null
          earned_at?: string
          verification_status_snapshot?: string | null
          is_featured?: boolean
        }
        Update: Partial<Database['public']['Tables']['player_medals']['Insert']>
      }
      seasons: {
        Relationships: []
        Row: {
          id: string
          player_id: string
          year: number
          team_id: string | null
          team_name_snapshot: string | null
          competitions: string | null
          notes: string | null
          representative_highlight_id: string | null
        }
        Insert: {
          id?: string
          player_id: string
          year: number
          team_id?: string | null
          team_name_snapshot?: string | null
          competitions?: string | null
          notes?: string | null
          representative_highlight_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['seasons']['Insert']>
      }
      teams: {
        Relationships: []
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
    CompositeTypes: Record<string, never>
  }
}
