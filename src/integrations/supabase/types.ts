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
      ai_results: {
        Row: {
          classification: string | null
          confidence_score: number | null
          created_at: string | null
          evaluation_id: string | null
          id: string
          recommendations: string | null
        }
        Insert: {
          classification?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          recommendations?: string | null
        }
        Update: {
          classification?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_models: {
        Row: {
          accuracy: number | null
          confusion_matrix: Json | null
          created_at: string | null
          created_by: string | null
          f1_high: number | null
          f1_low: number | null
          f1_medium: number | null
          id: string
          model_name: string
          precision_high: number | null
          precision_low: number | null
          precision_medium: number | null
          test_samples: number
          trained_at: string | null
          training_samples: number
          training_time_seconds: number | null
          validation_samples: number
        }
        Insert: {
          accuracy?: number | null
          confusion_matrix?: Json | null
          created_at?: string | null
          created_by?: string | null
          f1_high?: number | null
          f1_low?: number | null
          f1_medium?: number | null
          id?: string
          model_name: string
          precision_high?: number | null
          precision_low?: number | null
          precision_medium?: number | null
          test_samples: number
          trained_at?: string | null
          training_samples: number
          training_time_seconds?: number | null
          validation_samples: number
        }
        Update: {
          accuracy?: number | null
          confusion_matrix?: Json | null
          created_at?: string | null
          created_by?: string | null
          f1_high?: number | null
          f1_low?: number | null
          f1_medium?: number | null
          id?: string
          model_name?: string
          precision_high?: number | null
          precision_low?: number | null
          precision_medium?: number | null
          test_samples?: number
          trained_at?: string | null
          training_samples?: number
          training_time_seconds?: number | null
          validation_samples?: number
        }
        Relationships: []
      }
      applied_suggestions: {
        Row: {
          applied_at: string | null
          applied_by: string
          child_id: string
          competency_index_id: string | null
          created_at: string | null
          effectiveness_rating: number | null
          id: string
          notes: string | null
          status: string | null
          suggestion_content: Json
          suggestion_type: string
        }
        Insert: {
          applied_at?: string | null
          applied_by: string
          child_id: string
          competency_index_id?: string | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          suggestion_content: Json
          suggestion_type: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string
          child_id?: string
          competency_index_id?: string | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          suggestion_content?: Json
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "applied_suggestions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_suggestions_competency_index_id_fkey"
            columns: ["competency_index_id"]
            isOneToOne: false
            referencedRelation: "competency_indices"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          created_at: string | null
          evaluator_id: string | null
          gender: string | null
          grade: string | null
          id: string
          name: string
          school: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          evaluator_id?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          name: string
          school?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          evaluator_id?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          name?: string
          school?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_indices: {
        Row: {
          calculated_at: string | null
          child_id: string
          coordination_index: number | null
          created_at: string | null
          evaluation_id: string | null
          id: string
          learning_velocity: number | null
          notes: string | null
          overall_index: number
          precision_index: number | null
          strength_index: number | null
          trend: string | null
          visual_motor_index: number | null
        }
        Insert: {
          calculated_at?: string | null
          child_id: string
          coordination_index?: number | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          learning_velocity?: number | null
          notes?: string | null
          overall_index: number
          precision_index?: number | null
          strength_index?: number | null
          trend?: string | null
          visual_motor_index?: number | null
        }
        Update: {
          calculated_at?: string | null
          child_id?: string
          coordination_index?: number | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          learning_velocity?: number | null
          notes?: string | null
          overall_index?: number
          precision_index?: number | null
          strength_index?: number | null
          trend?: string | null
          visual_motor_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competency_indices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_indices_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_children: {
        Row: {
          birth_date: string
          created_at: string | null
          deleted_at: string
          deleted_by: string
          evaluator_id: string | null
          gender: string | null
          grade: string | null
          id: string
          name: string
          original_id: string
          school: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          deleted_at?: string
          deleted_by: string
          evaluator_id?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          name: string
          original_id: string
          school?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          deleted_at?: string
          deleted_by?: string
          evaluator_id?: string | null
          gender?: string | null
          grade?: string | null
          id?: string
          name?: string
          original_id?: string
          school?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          child_id: string | null
          created_at: string | null
          evaluation_date: string | null
          evaluator_id: string | null
          id: string
          observations: string | null
          test_1_observations: string | null
          test_1_score: number | null
          test_2_observations: string | null
          test_2_score: number | null
          test_3_observations: string | null
          test_3_score: number | null
          test_4_observations: string | null
          test_4_score: number | null
          test_5_observations: string | null
          test_5_score: number | null
          test_6_observations: string | null
          test_6_score: number | null
          test_7_observations: string | null
          test_7_score: number | null
          test_8_observations: string | null
          test_8_score: number | null
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          id?: string
          observations?: string | null
          test_1_observations?: string | null
          test_1_score?: number | null
          test_2_observations?: string | null
          test_2_score?: number | null
          test_3_observations?: string | null
          test_3_score?: number | null
          test_4_observations?: string | null
          test_4_score?: number | null
          test_5_observations?: string | null
          test_5_score?: number | null
          test_6_observations?: string | null
          test_6_score?: number | null
          test_7_observations?: string | null
          test_7_score?: number | null
          test_8_observations?: string | null
          test_8_score?: number | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          id?: string
          observations?: string | null
          test_1_observations?: string | null
          test_1_score?: number | null
          test_2_observations?: string | null
          test_2_score?: number | null
          test_3_observations?: string | null
          test_3_score?: number | null
          test_4_observations?: string | null
          test_4_score?: number | null
          test_5_observations?: string | null
          test_5_score?: number | null
          test_6_observations?: string | null
          test_6_score?: number | null
          test_7_observations?: string | null
          test_7_score?: number | null
          test_8_observations?: string | null
          test_8_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_style_assessments: {
        Row: {
          analysis_notes: string | null
          assessment_date: string
          auditory_score: number | null
          child_id: string
          created_at: string
          dominant_style: string | null
          evaluator_id: string
          id: string
          kinesthetic_score: number | null
          logical_score: number | null
          responses: Json
          secondary_style: string | null
          social_score: number | null
          solitary_score: number | null
          updated_at: string
          visual_score: number | null
        }
        Insert: {
          analysis_notes?: string | null
          assessment_date?: string
          auditory_score?: number | null
          child_id: string
          created_at?: string
          dominant_style?: string | null
          evaluator_id: string
          id?: string
          kinesthetic_score?: number | null
          logical_score?: number | null
          responses: Json
          secondary_style?: string | null
          social_score?: number | null
          solitary_score?: number | null
          updated_at?: string
          visual_score?: number | null
        }
        Update: {
          analysis_notes?: string | null
          assessment_date?: string
          auditory_score?: number | null
          child_id?: string
          created_at?: string
          dominant_style?: string | null
          evaluator_id?: string
          id?: string
          kinesthetic_score?: number | null
          logical_score?: number | null
          responses?: Json
          secondary_style?: string | null
          social_score?: number | null
          solitary_score?: number | null
          updated_at?: string
          visual_score?: number | null
        }
        Relationships: []
      }
      parent_access_tokens: {
        Row: {
          child_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_active: boolean
          parent_email: string | null
          parent_name: string | null
          questionnaire_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean
          parent_email?: string | null
          parent_name?: string | null
          questionnaire_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          parent_email?: string | null
          parent_name?: string | null
          questionnaire_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_access_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_access_tokens_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_activities: {
        Row: {
          activity_name: string
          activity_type: string
          ai_confidence: number | null
          applied_at: string | null
          applied_by: string | null
          child_id: string
          created_at: string | null
          description: string
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          materials_needed: string[] | null
          progression_notes: string | null
          repetitions_recommended: number | null
          replaces_activity_id: number | null
          results_notes: string | null
          success_criteria: string | null
          target_skills: Json | null
        }
        Insert: {
          activity_name: string
          activity_type: string
          ai_confidence?: number | null
          applied_at?: string | null
          applied_by?: string | null
          child_id: string
          created_at?: string | null
          description: string
          difficulty_level: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          progression_notes?: string | null
          repetitions_recommended?: number | null
          replaces_activity_id?: number | null
          results_notes?: string | null
          success_criteria?: string | null
          target_skills?: Json | null
        }
        Update: {
          activity_name?: string
          activity_type?: string
          ai_confidence?: number | null
          applied_at?: string | null
          applied_by?: string | null
          child_id?: string
          created_at?: string | null
          description?: string
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          progression_notes?: string | null
          repetitions_recommended?: number | null
          replaces_activity_id?: number | null
          results_notes?: string | null
          success_criteria?: string | null
          target_skills?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          institution: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          institution?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaire_dimensions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          questionnaire_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          questionnaire_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          questionnaire_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_dimensions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_questions: {
        Row: {
          created_at: string | null
          dimension_id: string | null
          id: string
          is_reverse_scored: boolean | null
          question_number: number
          question_text: string
          questionnaire_id: string
          score_weight: number | null
        }
        Insert: {
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          is_reverse_scored?: boolean | null
          question_number: number
          question_text: string
          questionnaire_id: string
          score_weight?: number | null
        }
        Update: {
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          is_reverse_scored?: boolean | null
          question_number?: number
          question_text?: string
          questionnaire_id?: string
          score_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          child_id: string
          created_at: string | null
          dimension_scores: Json | null
          dominant_dimension: string | null
          evaluator_id: string
          id: string
          notes: string | null
          questionnaire_id: string
          response_date: string | null
          responses: Json
          secondary_dimension: string | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          dimension_scores?: Json | null
          dominant_dimension?: string | null
          evaluator_id: string
          id?: string
          notes?: string | null
          questionnaire_id: string
          response_date?: string | null
          responses: Json
          secondary_dimension?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          dimension_scores?: Json | null
          dominant_dimension?: string | null
          evaluator_id?: string
          id?: string
          notes?: string | null
          questionnaire_id?: string
          response_date?: string | null
          responses?: Json
          secondary_dimension?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["questionnaire_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: Database["public"]["Enums"]["questionnaire_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["questionnaire_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      report_settings: {
        Row: {
          accent_color: string | null
          background_image_url: string | null
          body_font_size: number | null
          border_color: string | null
          border_width: number | null
          content_company_name: string | null
          content_conclusion_text: string | null
          content_introduction_text: string | null
          content_recommendations_text: string | null
          content_responsible_agent: string | null
          content_show_conclusion: boolean | null
          content_show_introduction: boolean | null
          content_show_recommendations: boolean | null
          created_at: string | null
          custom_field_1_label: string | null
          custom_field_1_value: string | null
          custom_field_2_label: string | null
          custom_field_2_value: string | null
          custom_field_3_label: string | null
          custom_field_3_value: string | null
          evaluator_name: string | null
          font_family: string | null
          footer_logo_urls: Json | null
          footer_text: string | null
          header_font_size: number | null
          header_text: string | null
          id: string
          institution_address: string | null
          institution_email: string | null
          institution_name: string | null
          institution_phone: string | null
          logo_position: string | null
          logo_size: number | null
          logo_url: string | null
          logo_urls: Json | null
          page_margins: Json | null
          primary_color: string | null
          qr_code_position: string | null
          report_type: string | null
          secondary_color: string | null
          section_order: string[] | null
          show_footer_border: boolean | null
          show_header_border: boolean | null
          show_page_numbers: boolean | null
          show_qr_code: boolean | null
          show_signature: boolean | null
          show_watermark: boolean | null
          signature_text: string | null
          signature_url: string | null
          template: string | null
          updated_at: string | null
          updated_by: string | null
          use_gemini_charts: boolean | null
          watermark_text: string | null
        }
        Insert: {
          accent_color?: string | null
          background_image_url?: string | null
          body_font_size?: number | null
          border_color?: string | null
          border_width?: number | null
          content_company_name?: string | null
          content_conclusion_text?: string | null
          content_introduction_text?: string | null
          content_recommendations_text?: string | null
          content_responsible_agent?: string | null
          content_show_conclusion?: boolean | null
          content_show_introduction?: boolean | null
          content_show_recommendations?: boolean | null
          created_at?: string | null
          custom_field_1_label?: string | null
          custom_field_1_value?: string | null
          custom_field_2_label?: string | null
          custom_field_2_value?: string | null
          custom_field_3_label?: string | null
          custom_field_3_value?: string | null
          evaluator_name?: string | null
          font_family?: string | null
          footer_logo_urls?: Json | null
          footer_text?: string | null
          header_font_size?: number | null
          header_text?: string | null
          id?: string
          institution_address?: string | null
          institution_email?: string | null
          institution_name?: string | null
          institution_phone?: string | null
          logo_position?: string | null
          logo_size?: number | null
          logo_url?: string | null
          logo_urls?: Json | null
          page_margins?: Json | null
          primary_color?: string | null
          qr_code_position?: string | null
          report_type?: string | null
          secondary_color?: string | null
          section_order?: string[] | null
          show_footer_border?: boolean | null
          show_header_border?: boolean | null
          show_page_numbers?: boolean | null
          show_qr_code?: boolean | null
          show_signature?: boolean | null
          show_watermark?: boolean | null
          signature_text?: string | null
          signature_url?: string | null
          template?: string | null
          updated_at?: string | null
          updated_by?: string | null
          use_gemini_charts?: boolean | null
          watermark_text?: string | null
        }
        Update: {
          accent_color?: string | null
          background_image_url?: string | null
          body_font_size?: number | null
          border_color?: string | null
          border_width?: number | null
          content_company_name?: string | null
          content_conclusion_text?: string | null
          content_introduction_text?: string | null
          content_recommendations_text?: string | null
          content_responsible_agent?: string | null
          content_show_conclusion?: boolean | null
          content_show_introduction?: boolean | null
          content_show_recommendations?: boolean | null
          created_at?: string | null
          custom_field_1_label?: string | null
          custom_field_1_value?: string | null
          custom_field_2_label?: string | null
          custom_field_2_value?: string | null
          custom_field_3_label?: string | null
          custom_field_3_value?: string | null
          evaluator_name?: string | null
          font_family?: string | null
          footer_logo_urls?: Json | null
          footer_text?: string | null
          header_font_size?: number | null
          header_text?: string | null
          id?: string
          institution_address?: string | null
          institution_email?: string | null
          institution_name?: string | null
          institution_phone?: string | null
          logo_position?: string | null
          logo_size?: number | null
          logo_url?: string | null
          logo_urls?: Json | null
          page_margins?: Json | null
          primary_color?: string | null
          qr_code_position?: string | null
          report_type?: string | null
          secondary_color?: string | null
          section_order?: string[] | null
          show_footer_border?: boolean | null
          show_header_border?: boolean | null
          show_page_numbers?: boolean | null
          show_qr_code?: boolean | null
          show_signature?: boolean | null
          show_watermark?: boolean | null
          signature_text?: string | null
          signature_url?: string | null
          template?: string | null
          updated_at?: string | null
          updated_by?: string | null
          use_gemini_charts?: boolean | null
          watermark_text?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "evaluator"
      questionnaire_type: "cornell" | "chaea" | "tam" | "custom"
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
      app_role: ["admin", "evaluator"],
      questionnaire_type: ["cornell", "chaea", "tam", "custom"],
    },
  },
} as const
