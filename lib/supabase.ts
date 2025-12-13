import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          access_code: string
          access_code_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          access_code: string
          access_code_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          access_code?: string
          access_code_hash?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          expires_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          expires_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          expires_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
      vpn_keys: {
        Row: {
          id: string
          user_id: string
          key_type: string
          config: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_type: string
          config: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_type?: string
          config?: string
          location?: string
          created_at?: string
        }
      }
    }
  }
}
