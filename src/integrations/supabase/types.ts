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
      conversation_analytics: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          fluency_score: number | null
          grammar_quality: number | null
          id: string
          user_id: string | null
          user_speaking_time_seconds: number | null
          vocabulary_count: number | null
          vocabulary_diversity: number | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          fluency_score?: number | null
          grammar_quality?: number | null
          id?: string
          user_id?: string | null
          user_speaking_time_seconds?: number | null
          vocabulary_count?: number | null
          vocabulary_diversity?: number | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          fluency_score?: number | null
          grammar_quality?: number | null
          id?: string
          user_id?: string | null
          user_speaking_time_seconds?: number | null
          vocabulary_count?: number | null
          vocabulary_diversity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_sessions: {
        Row: {
          assignment_id: string | null
          completed_at: string | null
          created_at: string | null
          difficulty_level: number
          duration_seconds: number | null
          id: string
          lesson_id: string | null
          speaking_confidence: number | null
          started_at: string | null
          topic: string
          user_id: string | null
          vocabulary_used: string[] | null
        }
        Insert: {
          assignment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level: number
          duration_seconds?: number | null
          id?: string
          lesson_id?: string | null
          speaking_confidence?: number | null
          started_at?: string | null
          topic: string
          user_id?: string | null
          vocabulary_used?: string[] | null
        }
        Update: {
          assignment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: number
          duration_seconds?: number | null
          id?: string
          lesson_id?: string | null
          speaking_confidence?: number | null
          started_at?: string | null
          topic?: string
          user_id?: string | null
          vocabulary_used?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          image_url: string | null
          is_published: boolean
          language_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          image_url?: string | null
          is_published?: boolean
          language_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          image_url?: string | null
          is_published?: boolean
          language_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_media: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          lesson_id: string
          media_type: Database["public"]["Enums"]["media_type"]
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lesson_id: string
          media_type: Database["public"]["Enums"]["media_type"]
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          lesson_id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_media_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_media_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          content_source: string | null
          course_id: string | null
          created_at: string
          created_by: string
          estimated_minutes: number | null
          generation_metadata: Json | null
          id: string
          is_published: boolean
          order_index: number
          structured_content: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_source?: string | null
          course_id?: string | null
          created_at?: string
          created_by: string
          estimated_minutes?: number | null
          generation_metadata?: Json | null
          id?: string
          is_published?: boolean
          order_index?: number
          structured_content?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_source?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string
          estimated_minutes?: number | null
          generation_metadata?: Json | null
          id?: string
          is_published?: boolean
          order_index?: number
          structured_content?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text: string
          order_index?: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          media_url: string | null
          order_index: number
          points: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_url?: string | null
          order_index?: number
          points?: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          media_url?: string | null
          order_index?: number
          points?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_published: boolean
          lesson_id: string | null
          pass_percent: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_published?: boolean
          lesson_id?: string | null
          pass_percent?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lesson_id?: string | null
          pass_percent?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      spaced_repetition_items: {
        Row: {
          created_at: string
          difficulty: number
          id: string
          lesson_id: string | null
          next_review_date: string
          question_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          id?: string
          lesson_id?: string | null
          next_review_date?: string
          question_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          id?: string
          lesson_id?: string | null
          next_review_date?: string
          question_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaced_repetition_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      spaced_repetition_stats: {
        Row: {
          ease_factor: number
          id: string
          interval_days: number
          item_id: string
          points_earned: number | null
          quality_response: number
          response_time_ms: number | null
          review_date: string
          streak: number
          user_id: string
        }
        Insert: {
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id: string
          points_earned?: number | null
          quality_response: number
          response_time_ms?: number | null
          review_date?: string
          streak?: number
          user_id: string
        }
        Update: {
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id?: string
          points_earned?: number | null
          quality_response?: number
          response_time_ms?: number | null
          review_date?: string
          streak?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_stats_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "spaced_repetition_items"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assignments: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lesson_id: string | null
          quiz_id: string | null
          started_at: string | null
          status: string
          student_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          quiz_id?: string | null
          started_at?: string | null
          status?: string
          student_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          quiz_id?: string | null
          started_at?: string | null
          status?: string
          student_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_code: string
          invited_by: string
          status: Database["public"]["Enums"]["invitation_status"]
          used_by_name: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_code: string
          invited_by: string
          status?: Database["public"]["Enums"]["invitation_status"]
          used_by_name?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          invited_by?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          used_by_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          percent_complete: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          percent_complete?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          percent_complete?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_sections: string[] | null
          id: string
          is_required: boolean | null
          last_accessed_at: string
          lesson_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_sections?: string[] | null
          id?: string
          is_required?: boolean | null
          last_accessed_at?: string
          lesson_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_sections?: string[] | null
          id?: string
          is_required?: boolean | null
          last_accessed_at?: string
          lesson_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          completed_steps: string[] | null
          current_step_index: number | null
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          current_step_index?: number | null
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          current_step_index?: number | null
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_quiz_answers: {
        Row: {
          answer_text: string | null
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option_id: string | null
        }
        Insert: {
          answer_text?: string | null
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id?: string | null
        }
        Update: {
          answer_text?: string | null
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "quiz_question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_attempts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          started_at?: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_progress: {
        Row: {
          answers: Json
          completed_at: string | null
          current_question: number
          id: string
          last_updated_at: string
          quiz_id: string
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          current_question?: number
          id?: string
          last_updated_at?: string
          quiz_id: string
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          current_question?: number
          id?: string
          last_updated_at?: string
          quiz_id?: string
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_progress_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_confidence_scores: {
        Row: {
          fluency_score: number
          grammar_score: number
          id: string
          overall_score: number
          pronunciation_score: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          fluency_score: number
          grammar_score: number
          id?: string
          overall_score: number
          pronunciation_score: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          fluency_score?: number
          grammar_score?: number
          id?: string
          overall_score?: number
          pronunciation_score?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_practice_feedback: {
        Row: {
          created_at: string
          feedback_text: string
          fluency_score: number | null
          grammar_score: number | null
          id: string
          pronunciation_score: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text: string
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          pronunciation_score?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          pronunciation_score?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_practice_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voice_practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_practice_sessions: {
        Row: {
          analytics_data: Json | null
          assignment_id: string | null
          completed_at: string | null
          conversation_topic: string | null
          created_at: string
          difficulty_level: number
          duration_seconds: number | null
          id: string
          is_conversation: boolean | null
          is_required: boolean | null
          lesson_id: string | null
          started_at: string
          topic: string
          user_id: string
          vocabulary_used: string[] | null
        }
        Insert: {
          analytics_data?: Json | null
          assignment_id?: string | null
          completed_at?: string | null
          conversation_topic?: string | null
          created_at?: string
          difficulty_level?: number
          duration_seconds?: number | null
          id?: string
          is_conversation?: boolean | null
          is_required?: boolean | null
          lesson_id?: string | null
          started_at?: string
          topic: string
          user_id: string
          vocabulary_used?: string[] | null
        }
        Update: {
          analytics_data?: Json | null
          assignment_id?: string | null
          completed_at?: string | null
          conversation_topic?: string | null
          created_at?: string
          difficulty_level?: number
          duration_seconds?: number | null
          id?: string
          is_conversation?: boolean | null
          is_required?: boolean | null
          lesson_id?: string | null
          started_at?: string
          topic?: string
          user_id?: string
          vocabulary_used?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_practice_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_practice_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_quiz: {
        Args: {
          progress_id_param: string
          completed_at_param: string
          score_param: number
          updated_at_param: string
        }
        Returns: undefined
      }
      create_quiz_progress: {
        Args: { quiz_id_param: string; user_id_param: string }
        Returns: {
          answers: Json
          completed_at: string | null
          current_question: number
          id: string
          last_updated_at: string
          quiz_id: string
          score: number | null
          started_at: string
          user_id: string
        }
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_quiz_progress: {
        Args: { quiz_id_param: string; user_id_param: string }
        Returns: {
          id: string
          quiz_id: string
          user_id: string
          current_question: number
          answers: Json
          started_at: string
          completed_at: string
          score: number
          last_updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_student: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_teacher: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_invitation_used: {
        Args: {
          invitation_code_param: string
          user_id_param: string
          user_name_param: string
        }
        Returns: boolean
      }
      reset_quiz: {
        Args: { progress_id_param: string; updated_at_param: string }
        Returns: undefined
      }
      update_quiz_progress: {
        Args: {
          progress_id_param: string
          current_question_param: number
          answers_param: Json
          updated_at_param: string
        }
        Returns: undefined
      }
      validate_invitation_code: {
        Args: { code: string }
        Returns: {
          is_valid: boolean
          message: string
          invitation_id: string
          teacher_name: string
          student_email: string
        }[]
      }
    }
    Enums: {
      app_role: "student" | "teacher"
      content_source_type: "manual" | "ai_generated" | "mixed"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      invitation_status: "pending" | "accepted" | "expired" | "rejected"
      media_type: "image" | "audio" | "video" | "document"
      question_type:
        | "multiple_choice"
        | "true_false"
        | "matching"
        | "fill_in_blank"
        | "audio_response"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher"],
      content_source_type: ["manual", "ai_generated", "mixed"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      invitation_status: ["pending", "accepted", "expired", "rejected"],
      media_type: ["image", "audio", "video", "document"],
      question_type: [
        "multiple_choice",
        "true_false",
        "matching",
        "fill_in_blank",
        "audio_response",
      ],
    },
  },
} as const
