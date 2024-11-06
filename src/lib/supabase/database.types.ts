export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_integrations: {
        Row: {
          email: string
          google_id: string
          id: string
          name: string
          resource_id: string | null
          user_id: string
          uuid: string | null
          watch_expiry: string | null
        }
        Insert: {
          email: string
          google_id: string
          id?: string
          name: string
          resource_id?: string | null
          user_id: string
          uuid?: string | null
          watch_expiry?: string | null
        }
        Update: {
          email?: string
          google_id?: string
          id?: string
          name?: string
          resource_id?: string | null
          user_id?: string
          uuid?: string | null
          watch_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expiry_date: string | null
          id: string
          provider: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          provider?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          provider?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          clean_vtt_file: string | null
          created_at: string
          date: string | null
          db_created_at: string | null
          duration_in_ms: number | null
          meeting_baas_original_json: Json | null
          name: string | null
          original_vtt_file: string | null
          recorded_at: string | null
          source_url: string | null
          speaker: string | null
          summary: string | null
          thumbnail_url: string | null
          video_api_id: string
        }
        Insert: {
          clean_vtt_file?: string | null
          created_at?: string
          date?: string | null
          db_created_at?: string | null
          duration_in_ms?: number | null
          meeting_baas_original_json?: Json | null
          name?: string | null
          original_vtt_file?: string | null
          recorded_at?: string | null
          source_url?: string | null
          speaker?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          video_api_id: string
        }
        Update: {
          clean_vtt_file?: string | null
          created_at?: string
          date?: string | null
          db_created_at?: string | null
          duration_in_ms?: number | null
          meeting_baas_original_json?: Json | null
          name?: string | null
          original_vtt_file?: string | null
          recorded_at?: string | null
          source_url?: string | null
          speaker?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          video_api_id?: string
        }
        Relationships: []
      }
      moment_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          moment_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moment_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moment_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_comments_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_reactions: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          reaction_type: Database["public"]["Enums"]["moment_reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          reaction_type: Database["public"]["Enums"]["moment_reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          reaction_type?: Database["public"]["Enums"]["moment_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_reactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          activity: string | null
          activity_reasoning: string | null
          activity_type: string | null
          created_at: string
          id: string
          latest: boolean
          moment_url: string | null
          search_vector: unknown | null
          segment_end_timestamp: string | null
          segment_end_timestamp_in_seconds: number | null
          segment_id_sequence_end: number | null
          segment_id_sequence_start: number | null
          segment_start_timestamp: string | null
          segment_start_timestamp_in_seconds: number | null
          summary: string | null
          target_person_reasoning: string | null
          target_person_type: string | null
          title: string | null
          version: number
          video_api_id: string | null
        }
        Insert: {
          activity?: string | null
          activity_reasoning?: string | null
          activity_type?: string | null
          created_at?: string
          id: string
          latest?: boolean
          moment_url?: string | null
          search_vector?: unknown | null
          segment_end_timestamp?: string | null
          segment_end_timestamp_in_seconds?: number | null
          segment_id_sequence_end?: number | null
          segment_id_sequence_start?: number | null
          segment_start_timestamp?: string | null
          segment_start_timestamp_in_seconds?: number | null
          summary?: string | null
          target_person_reasoning?: string | null
          target_person_type?: string | null
          title?: string | null
          version?: number
          video_api_id?: string | null
        }
        Update: {
          activity?: string | null
          activity_reasoning?: string | null
          activity_type?: string | null
          created_at?: string
          id?: string
          latest?: boolean
          moment_url?: string | null
          search_vector?: unknown | null
          segment_end_timestamp?: string | null
          segment_end_timestamp_in_seconds?: number | null
          segment_id_sequence_end?: number | null
          segment_id_sequence_start?: number | null
          segment_start_timestamp?: string | null
          segment_start_timestamp_in_seconds?: number | null
          summary?: string | null
          target_person_reasoning?: string | null
          target_person_type?: string | null
          title?: string | null
          version?: number
          video_api_id?: string | null
        }
        Relationships: []
      }
      moments_segment: {
        Row: {
          created_at: string
          id: string
          moments_id: string
          segment_id: string
          video_api_id: string
        }
        Insert: {
          created_at?: string
          id: string
          moments_id: string
          segment_id: string
          video_api_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moments_id?: string
          segment_id?: string
          video_api_id?: string
        }
        Relationships: []
      }
      oauth_connections: {
        Row: {
          access_token: string
          calendar_id: string
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          refresh_token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          calendar_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          provider: string
          refresh_token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          calendar_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          nickname: string | null
        }
        Insert: {
          id: string
          is_admin?: boolean
          nickname?: string | null
        }
        Update: {
          id?: string
          is_admin?: boolean
          nickname?: string | null
        }
        Relationships: []
      }
      scheduled_meetings: {
        Row: {
          calendar_id: string
          conference_id: string
          created_at: string | null
          event_id: string
          id: string
          meet_link: string | null
          notification_time: string
          start_time: string
          status: string
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_id: string
          conference_id: string
          created_at?: string | null
          event_id: string
          id?: string
          meet_link?: string | null
          notification_time: string
          start_time: string
          status?: string
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_id?: string
          conference_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          meet_link?: string | null
          notification_time?: string
          start_time?: string
          status?: string
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      segments: {
        Row: {
          duration: number | null
          end_timestamp: string | null
          hard_filler_word_count: number | null
          id: string
          index: number | null
          profanity_count: number | null
          question_count: number | null
          sentence_count: number | null
          soft_filler_word_count: number | null
          speaker_name: string | null
          start_timestamp: string | null
          text: string | null
          total_arousal: number | null
          total_dominance: number | null
          total_valence: number | null
          vad_word_count: number | null
          video_api_id: string | null
          word_count: number | null
        }
        Insert: {
          duration?: number | null
          end_timestamp?: string | null
          hard_filler_word_count?: number | null
          id: string
          index?: number | null
          profanity_count?: number | null
          question_count?: number | null
          sentence_count?: number | null
          soft_filler_word_count?: number | null
          speaker_name?: string | null
          start_timestamp?: string | null
          text?: string | null
          total_arousal?: number | null
          total_dominance?: number | null
          total_valence?: number | null
          vad_word_count?: number | null
          video_api_id?: string | null
          word_count?: number | null
        }
        Update: {
          duration?: number | null
          end_timestamp?: string | null
          hard_filler_word_count?: number | null
          id?: string
          index?: number | null
          profanity_count?: number | null
          question_count?: number | null
          sentence_count?: number | null
          soft_filler_word_count?: number | null
          speaker_name?: string | null
          start_timestamp?: string | null
          text?: string | null
          total_arousal?: number | null
          total_dominance?: number | null
          total_valence?: number | null
          vad_word_count?: number | null
          video_api_id?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_moments_with_metadata: {
        Args: {
          p_limit: number
          p_cursor?: string
        }
        Returns: {
          moment_data: unknown
          reactions: Database["public"]["CompositeTypes"]["moment_reaction_with_user"][]
          comments: Database["public"]["CompositeTypes"]["moment_comment_with_user"][]
        }[]
      }
      is_admin_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      search_moments: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          rank: number
        }[]
      }
    }
    Enums: {
      moment_reaction_type: "thumbs_up" | "thumbs_down"
    }
    CompositeTypes: {
      moment_comment_with_user: {
        id: string | null
        moment_id: string | null
        user_id: string | null
        content: string | null
        created_at: string | null
        updated_at: string | null
        user_nickname: string | null
        user_avatar_url: string | null
        user_is_admin: boolean | null
      }
      moment_reaction_with_user: {
        id: string | null
        moment_id: string | null
        reaction_type: string | null
        created_at: string | null
        user_id: string | null
        user_nickname: string | null
        user_avatar_url: string | null
        user_is_admin: boolean | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
