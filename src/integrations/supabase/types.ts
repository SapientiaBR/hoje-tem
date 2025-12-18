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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      eventos: {
        Row: {
          categoria: string
          cidade: string
          coordenadas_lat: number | null
          coordenadas_lng: number | null
          created_at: string | null
          data: string
          data_fim: string | null
          descricao: string | null
          destaque: boolean | null
          endereco: string | null
          estado: string
          id: string
          imagem: string | null
          link_origem: string | null
          local: string
          local_id: string | null
          nome: string
          organizador_id: string | null
          origem: string | null
          preco: number | null
          preco_max: number | null
          status: string | null
        }
        Insert: {
          categoria: string
          cidade?: string
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          created_at?: string | null
          data: string
          data_fim?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          estado?: string
          id?: string
          imagem?: string | null
          link_origem?: string | null
          local: string
          local_id?: string | null
          nome: string
          organizador_id?: string | null
          origem?: string | null
          preco?: number | null
          preco_max?: number | null
          status?: string | null
        }
        Update: {
          categoria?: string
          cidade?: string
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          created_at?: string | null
          data?: string
          data_fim?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          estado?: string
          id?: string
          imagem?: string | null
          link_origem?: string | null
          local?: string
          local_id?: string | null
          nome?: string
          organizador_id?: string | null
          origem?: string | null
          preco?: number | null
          preco_max?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string | null
          evento_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          evento_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          evento_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          categorias: string[] | null
          cidade: string | null
          claimed_at: string | null
          claimed_by: string | null
          coordenadas_lat: number | null
          coordenadas_lng: number | null
          created_at: string | null
          descricao: string | null
          endereco: string | null
          estado: string | null
          id: string
          imagem: string | null
          instagram: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          categorias?: string[] | null
          cidade?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem?: string | null
          instagram?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          categorias?: string[] | null
          cidade?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem?: string | null
          instagram?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      local_claims: {
        Row: {
          created_at: string | null
          documento_comprovante: string | null
          id: string
          local_id: string | null
          mensagem: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          documento_comprovante?: string | null
          id?: string
          local_id?: string | null
          mensagem?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          documento_comprovante?: string | null
          id?: string
          local_id?: string | null
          mensagem?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_claims_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cidade_preferida: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          preferencias: string[] | null
          updated_at: string | null
        }
        Insert: {
          cidade_preferida?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          preferencias?: string[] | null
          updated_at?: string | null
        }
        Update: {
          cidade_preferida?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          preferencias?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sugestoes_eventos: {
        Row: {
          created_at: string | null
          dados_raw: Json | null
          data: string | null
          descricao: string | null
          evento_id: string | null
          id: string
          imagem: string | null
          link_origem: string
          local: string | null
          nome: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dados_raw?: Json | null
          data?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          imagem?: string | null
          link_origem: string
          local?: string | null
          nome?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dados_raw?: Json | null
          data?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          imagem?: string | null
          link_origem?: string
          local?: string | null
          nome?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          verified?: boolean | null
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
    }
    Enums: {
      app_role: "user" | "organizador" | "local" | "admin"
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
      app_role: ["user", "organizador", "local", "admin"],
    },
  },
} as const
