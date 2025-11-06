export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      actions: {
        Row: {
          id: number
          action: string
          responsible: string
          sector: string
          due_date: string
          status: string
          delay_status: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          action: string
          responsible: string
          sector: string
          due_date: string
          status: string
          delay_status?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          action?: string
          responsible?: string
          sector?: string
          due_date?: string
          status?: string
          delay_status?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          action_id: number | null
          title: string
          description: string | null
          status: string
          parent_id: string | null
          order_index: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          action_id?: number | null
          title: string
          description?: string | null
          status?: string
          parent_id?: string | null
          order_index?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          action_id?: number | null
          title?: string
          description?: string | null
          status?: string
          parent_id?: string | null
          order_index?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          action_id: number
          user_id: string
          content: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          action_id: number
          user_id: string
          content: string
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          action_id?: number
          user_id?: string
          content?: string
          type?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action_type: string
          table_name: string
          record_id: string
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          table_name: string
          record_id: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          table_name?: string
          record_id?: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Action = Database['public']['Tables']['actions']['Row'];
export type ActionInsert = Database['public']['Tables']['actions']['Insert'];
export type ActionUpdate = Database['public']['Tables']['actions']['Update'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];

// User role type
export type UserRole = 'admin' | 'user';
