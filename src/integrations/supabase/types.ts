export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          hero_image: string | null
          html: string | null
          id: string
          published_at: string | null
          scraped_at: string
          search_vector: unknown
          slug: string
          source: string
          source_url: string
          summary: string | null
          tags: string[] | null
          theme: string | null
          theme_confidence: number | null
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          hero_image?: string | null
          html?: string | null
          id?: string
          published_at?: string | null
          scraped_at?: string
          search_vector?: unknown
          slug: string
          source?: string
          source_url: string
          summary?: string | null
          tags?: string[] | null
          theme?: string | null
          theme_confidence?: number | null
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          hero_image?: string | null
          html?: string | null
          id?: string
          published_at?: string | null
          scraped_at?: string
          search_vector?: unknown
          slug?: string
          source?: string
          source_url?: string
          summary?: string | null
          tags?: string[] | null
          theme?: string | null
          theme_confidence?: number | null
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: []
      }
      publications: {
        Row: {
          abstract: string | null
          authors: string
          citation_count: number | null
          created_at: string
          doi: string | null
          featured: boolean
          hero_image: string | null
          id: string
          sort_order: number
          theme: string | null
          title: string
          updated_at: string
          url: string | null
          venue: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors?: string
          citation_count?: number | null
          created_at?: string
          doi?: string | null
          featured?: boolean
          hero_image?: string | null
          id?: string
          sort_order?: number
          theme?: string | null
          title: string
          updated_at?: string
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string
          citation_count?: number | null
          created_at?: string
          doi?: string | null
          featured?: boolean
          hero_image?: string | null
          id?: string
          sort_order?: number
          theme?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmed: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          blurb: string
          created_at: string
          id: string
          narrative: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          blurb: string
          created_at?: string
          id?: string
          narrative: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          blurb?: string
          created_at?: string
          id?: string
          narrative?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tributes: {
        Row: {
          approved_at: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          message: string
          name: string
          relationship: string | null
          status: Database["public"]["Enums"]["tribute_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          message: string
          name: string
          relationship?: string | null
          status?: Database["public"]["Enums"]["tribute_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          message?: string
          name?: string
          relationship?: string | null
          status?: Database["public"]["Enums"]["tribute_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_articles: {
        Args: { max_results?: number; q: string }
        Returns: {
          id: string
          published_at: string
          rank: number
          slug: string
          snippet: string
          source: string
          source_url: string
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "family" | "user"
      tribute_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "family", "user"],
      tribute_status: ["pending", "approved", "rejected"],
    },
  },
} as const
