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
          user_id: string
          email: string
          full_name: string
          role: 'student' | 'teacher' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          role?: 'student' | 'teacher' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'teacher' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string | null
          code: string
          created_by: string
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          code: string
          created_by: string
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          code?: string
          created_by?: string
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lectures: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          lecture_number: number
          date: string | null
          materials_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          lecture_number: number
          date?: string | null
          materials_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          lecture_number?: number
          date?: string | null
          materials_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          lecture_id: string
          title: string
          description: string
          instructions: string | null
          due_date: string
          max_points: number
          status: 'draft' | 'published' | 'archived'
          allow_late_submission: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lecture_id: string
          title: string
          description: string
          instructions?: string | null
          due_date: string
          max_points?: number
          status?: 'draft' | 'published' | 'archived'
          allow_late_submission?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lecture_id?: string
          title?: string
          description?: string
          instructions?: string | null
          due_date?: string
          max_points?: number
          status?: 'draft' | 'published' | 'archived'
          allow_late_submission?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          student_id: string
          enrolled_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          enrolled_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          course_id?: string
          student_id?: string
          enrolled_at?: string
          is_active?: boolean
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          file_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          prompt_text: string
          prompt_analysis: string | null
          grade: number | null
          max_points: number | null
          feedback: string | null
          status: 'submitted' | 'graded' | 'returned'
          submitted_at: string
          graded_at: string | null
          graded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          prompt_text: string
          prompt_analysis?: string | null
          grade?: number | null
          max_points?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded' | 'returned'
          submitted_at?: string
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          prompt_text?: string
          prompt_analysis?: string | null
          grade?: number | null
          max_points?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded' | 'returned'
          submitted_at?: string
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}