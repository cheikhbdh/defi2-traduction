export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      words: {
        Row: {
          id: number
          word: string
          phonetic: string | null
          part_of_speech: string | null
          definition: string
          example: string | null
          notes: string | null
          contributor_id: number
          status: string
          created_at: string
          updated_at: string
          is_challenge_word: boolean
          likes: number
          views: number
        }
        Insert: {
          id?: number
          word: string
          phonetic?: string | null
          part_of_speech?: string | null
          definition: string
          example?: string | null
          notes?: string | null
          contributor_id: number
          status?: string
          created_at?: string
          updated_at?: string
          is_challenge_word?: boolean
          likes?: number
          views?: number
        }
        Update: {
          id?: number
          word?: string
          phonetic?: string | null
          part_of_speech?: string | null
          definition?: string
          example?: string | null
          notes?: string | null
          contributor_id?: number
          status?: string
          created_at?: string
          updated_at?: string
          is_challenge_word?: boolean
          likes?: number
          views?: number
        }
      }
      users: {
        Row: {
          id: number
          email: string
          name: string
          role: string
          points: number
          contributions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          name: string
          role?: string
          points?: number
          contributions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          name?: string
          role?: string
          points?: number
          contributions?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          word_id: number
          user_id: number
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          word_id: number
          user_id: number
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          word_id?: number
          user_id?: number
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      word_variants: {
        Row: {
          id: number
          word_id: number
          variant_type: string
          variant: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          word_id: number
          variant_type: string
          variant: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          word_id?: number
          variant_type?: string
          variant?: string
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: number
          name: string
          description: string
          criteria: string
          image_url: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          criteria: string
          image_url: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          criteria?: string
          image_url?: string
        }
      }
      user_badges: {
        Row: {
          id: number
          user_id: number
          badge_id: number
          awarded_at: string
        }
        Insert: {
          id?: number
          user_id: number
          badge_id: number
          awarded_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          badge_id?: number
          awarded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

