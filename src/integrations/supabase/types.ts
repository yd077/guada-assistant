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
      artisan_subscriptions: {
        Row: {
          artisan_id: string
          cancel_at_period_end: boolean
          current_period_end: string | null
          ends_at: string | null
          starts_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          artisan_id: string
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          ends_at?: string | null
          starts_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          ends_at?: string | null
          starts_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_subscriptions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: true
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      artisan_wallets: {
        Row: {
          artisan_id: string
          credits_balance: number
          updated_at: string
        }
        Insert: {
          artisan_id: string
          credits_balance?: number
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          credits_balance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_wallets_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: true
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      artisans: {
        Row: {
          avatar_url: string | null
          base_address: string | null
          base_lat: number | null
          base_lng: number | null
          bio: string | null
          certifications: string[] | null
          cover_url: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          first_name: string | null
          id: string
          insurance_url: string | null
          insurance_verified_at: string | null
          kbis_url: string | null
          kbis_verified_at: string | null
          last_name: string | null
          location: string
          name: string
          notify_new_leads: boolean
          onboarding_completed_at: string | null
          onboarding_step: number
          radius_km: number
          rating: number | null
          reviews_count: number | null
          specialty: string
          status: Database["public"]["Enums"]["artisan_status"]
          updated_at: string
          user_id: string | null
          verification_note: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          avatar_url?: string | null
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          bio?: string | null
          certifications?: string[] | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          id?: string
          insurance_url?: string | null
          insurance_verified_at?: string | null
          kbis_url?: string | null
          kbis_verified_at?: string | null
          last_name?: string | null
          location: string
          name: string
          notify_new_leads?: boolean
          onboarding_completed_at?: string | null
          onboarding_step?: number
          radius_km?: number
          rating?: number | null
          reviews_count?: number | null
          specialty: string
          status?: Database["public"]["Enums"]["artisan_status"]
          updated_at?: string
          user_id?: string | null
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          avatar_url?: string | null
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          bio?: string | null
          certifications?: string[] | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          id?: string
          insurance_url?: string | null
          insurance_verified_at?: string | null
          kbis_url?: string | null
          kbis_verified_at?: string | null
          last_name?: string | null
          location?: string
          name?: string
          notify_new_leads?: boolean
          onboarding_completed_at?: string | null
          onboarding_step?: number
          radius_km?: number
          rating?: number | null
          reviews_count?: number | null
          specialty?: string
          status?: Database["public"]["Enums"]["artisan_status"]
          updated_at?: string
          user_id?: string | null
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      credit_packs: {
        Row: {
          active: boolean
          created_at: string
          credits: number
          description: string | null
          highlight: boolean
          id: string
          name: string
          price_eur: number
          sort_order: number
          stripe_price_id_live: string | null
          stripe_price_id_test: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits: number
          description?: string | null
          highlight?: boolean
          id: string
          name: string
          price_eur: number
          sort_order?: number
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          credits?: number
          description?: string | null
          highlight?: boolean
          id?: string
          name?: string
          price_eur?: number
          sort_order?: number
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          artisan_id: string
          created_at: string
          id: string
          note: string | null
          reference_id: string | null
          type: Database["public"]["Enums"]["credit_tx_type"]
        }
        Insert: {
          amount: number
          artisan_id: string
          created_at?: string
          id?: string
          note?: string | null
          reference_id?: string | null
          type: Database["public"]["Enums"]["credit_tx_type"]
        }
        Update: {
          amount?: number
          artisan_id?: string
          created_at?: string
          id?: string
          note?: string | null
          reference_id?: string | null
          type?: Database["public"]["Enums"]["credit_tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_disputes: {
        Row: {
          artisan_id: string
          created_at: string
          description: string | null
          id: string
          reason: Database["public"]["Enums"]["dispute_reason"]
          resolved_at: string | null
          resolved_note: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          unlock_id: string
        }
        Insert: {
          artisan_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: Database["public"]["Enums"]["dispute_reason"]
          resolved_at?: string | null
          resolved_note?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          unlock_id: string
        }
        Update: {
          artisan_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["dispute_reason"]
          resolved_at?: string | null
          resolved_note?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          unlock_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_disputes_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_disputes_unlock_id_fkey"
            columns: ["unlock_id"]
            isOneToOne: false
            referencedRelation: "lead_unlocks"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_pricing_rules: {
        Row: {
          client_type: Database["public"]["Enums"]["client_type"] | null
          created_at: string
          credits_cost: number
          id: string
          label: string | null
          max_budget_eur: number | null
          min_budget_eur: number
          specialty: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          credits_cost: number
          id?: string
          label?: string | null
          max_budget_eur?: number | null
          min_budget_eur?: number
          specialty?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          credits_cost?: number
          id?: string
          label?: string | null
          max_budget_eur?: number | null
          min_budget_eur?: number
          specialty?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: []
      }
      lead_reminders: {
        Row: {
          id: string
          kind: string
          project_id: string
          sent_at: string
          unlock_id: string
        }
        Insert: {
          id?: string
          kind?: string
          project_id: string
          sent_at?: string
          unlock_id: string
        }
        Update: {
          id?: string
          kind?: string
          project_id?: string
          sent_at?: string
          unlock_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_reminders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "available_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_reminders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_reminders_unlock_id_fkey"
            columns: ["unlock_id"]
            isOneToOne: false
            referencedRelation: "lead_unlocks"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_unlocks: {
        Row: {
          artisan_id: string
          credits_spent: number
          deadline_at: string | null
          first_contact_at: string | null
          id: string
          project_id: string
          status: string
          unlocked_at: string
        }
        Insert: {
          artisan_id: string
          credits_spent: number
          deadline_at?: string | null
          first_contact_at?: string | null
          id?: string
          project_id: string
          status?: string
          unlocked_at?: string
        }
        Update: {
          artisan_id?: string
          credits_spent?: number
          deadline_at?: string | null
          first_contact_at?: string | null
          id?: string
          project_id?: string
          status?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_unlocks_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_unlocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "available_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_unlocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          artisan_id: string | null
          channel: string
          created_at: string
          error: string | null
          id: string
          kind: string
          project_id: string | null
          status: string
        }
        Insert: {
          artisan_id?: string | null
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          project_id?: string | null
          status?: string
        }
        Update: {
          artisan_id?: string | null
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          project_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "available_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          allow_unverified_purchase: boolean
          enabled: boolean
          id: string
          live_publishable_key: string | null
          live_secret_key: string | null
          live_webhook_secret: string | null
          mode: string
          provider: string
          test_publishable_key: string | null
          test_secret_key: string | null
          test_webhook_secret: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_unverified_purchase?: boolean
          enabled?: boolean
          id?: string
          live_publishable_key?: string | null
          live_secret_key?: string | null
          live_webhook_secret?: string | null
          mode?: string
          provider?: string
          test_publishable_key?: string | null
          test_secret_key?: string | null
          test_webhook_secret?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_unverified_purchase?: boolean
          enabled?: boolean
          id?: string
          live_publishable_key?: string | null
          live_secret_key?: string | null
          live_webhook_secret?: string | null
          mode?: string
          provider?: string
          test_publishable_key?: string | null
          test_secret_key?: string | null
          test_webhook_secret?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          artisan_id: string
          created_at: string
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          artisan_id: string
          created_at?: string
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          artisan_id?: string
          created_at?: string
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_inquiries: {
        Row: {
          client_type: string
          company_name: string
          contact_name: string
          created_at: string
          desired_sla: string | null
          email: string
          id: string
          managed_units: number | null
          message: string | null
          phone: string | null
          recurring_specialties: string[] | null
          status: string
        }
        Insert: {
          client_type: string
          company_name: string
          contact_name: string
          created_at?: string
          desired_sla?: string | null
          email: string
          id?: string
          managed_units?: number | null
          message?: string | null
          phone?: string | null
          recurring_specialties?: string[] | null
          status?: string
        }
        Update: {
          client_type?: string
          company_name?: string
          contact_name?: string
          created_at?: string
          desired_sla?: string | null
          email?: string
          id?: string
          managed_units?: number | null
          message?: string | null
          phone?: string | null
          recurring_specialties?: string[] | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: string | null
          client_id: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          company_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          deadline: string | null
          description: string
          desired_sla: string | null
          email_otp_attempts: number
          email_otp_code: string | null
          email_otp_expires_at: string | null
          email_verification_sent_at: string | null
          email_verification_token: string | null
          email_verified: boolean
          email_verified_at: string | null
          id: string
          internal_ref: string | null
          lead_price_credits: number | null
          location: string
          managed_units: number | null
          max_unlocks: number
          phone_verified: boolean
          project_lat: number | null
          project_lng: number | null
          specialty: string
          status: Database["public"]["Enums"]["project_status"]
          surface: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          budget?: string | null
          client_id?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string
          created_at?: string
          deadline?: string | null
          description: string
          desired_sla?: string | null
          email_otp_attempts?: number
          email_otp_code?: string | null
          email_otp_expires_at?: string | null
          email_verification_sent_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id?: string
          internal_ref?: string | null
          lead_price_credits?: number | null
          location: string
          managed_units?: number | null
          max_unlocks?: number
          phone_verified?: boolean
          project_lat?: number | null
          project_lng?: number | null
          specialty: string
          status?: Database["public"]["Enums"]["project_status"]
          surface?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          budget?: string | null
          client_id?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          deadline?: string | null
          description?: string
          desired_sla?: string | null
          email_otp_attempts?: number
          email_otp_code?: string | null
          email_otp_expires_at?: string | null
          email_verification_sent_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id?: string
          internal_ref?: string | null
          lead_price_credits?: number | null
          location?: string
          managed_units?: number | null
          max_unlocks?: number
          phone_verified?: boolean
          project_lat?: number | null
          project_lng?: number | null
          specialty?: string
          status?: Database["public"]["Enums"]["project_status"]
          surface?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          artisan_id: string
          city: string
          client_id: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          message: string
          status: Database["public"]["Enums"]["quote_status"]
        }
        Insert: {
          artisan_id: string
          city: string
          client_id?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string
          created_at?: string
          id?: string
          message: string
          status?: Database["public"]["Enums"]["quote_status"]
        }
        Update: {
          artisan_id?: string
          city?: string
          client_id?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["quote_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          artisan_id: string
          author_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          artisan_id: string
          author_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
        }
        Update: {
          artisan_id?: string
          author_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_checkout_sessions: {
        Row: {
          amount_eur: number | null
          artisan_id: string
          completed_at: string | null
          created_at: string
          credits_to_grant: number | null
          id: string
          kind: string
          mode: string
          pack_id: string | null
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"] | null
        }
        Insert: {
          amount_eur?: number | null
          artisan_id: string
          completed_at?: string | null
          created_at?: string
          credits_to_grant?: number | null
          id: string
          kind: string
          mode: string
          pack_id?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
        }
        Update: {
          amount_eur?: number | null
          artisan_id?: string
          completed_at?: string | null
          created_at?: string
          credits_to_grant?: number | null
          id?: string
          kind?: string
          mode?: string
          pack_id?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_checkout_sessions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_checkout_sessions_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "credit_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          delay_minutes: number
          description: string | null
          highlight: boolean
          name: string
          price_eur: number
          radius_km: number | null
          stripe_price_id_live: string | null
          stripe_price_id_test: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          active?: boolean
          delay_minutes: number
          description?: string | null
          highlight?: boolean
          name: string
          price_eur: number
          radius_km?: number | null
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          active?: boolean
          delay_minutes?: number
          description?: string | null
          highlight?: boolean
          name?: string
          price_eur?: number
          radius_km?: number | null
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      available_leads: {
        Row: {
          budget: string | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          created_at: string | null
          deadline: string | null
          description_preview: string | null
          id: string | null
          lead_price_credits: number | null
          location: string | null
          max_unlocks: number | null
          project_lat: number | null
          project_lng: number | null
          specialty: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          surface: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          budget?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string | null
          deadline?: string | null
          description_preview?: string | null
          id?: string | null
          lead_price_credits?: number | null
          location?: string | null
          max_unlocks?: number | null
          project_lat?: number | null
          project_lng?: number | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          surface?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          budget?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string | null
          deadline?: string | null
          description_preview?: string | null
          id?: string | null
          lead_price_credits?: number | null
          location?: string | null
          max_unlocks?: number | null
          project_lat?: number | null
          project_lng?: number | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          surface?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_adjust_wallet: {
        Args: {
          p_amount: number
          p_artisan_id: string
          p_note?: string
          p_reference_id?: string
          p_type?: Database["public"]["Enums"]["credit_tx_type"]
        }
        Returns: Json
      }
      admin_approve_dispute: {
        Args: { p_dispute_id: string; p_note?: string }
        Returns: Json
      }
      admin_refund_unlock: {
        Args: { p_note?: string; p_unlock_id: string }
        Returns: Json
      }
      admin_reject_dispute: {
        Args: { p_dispute_id: string; p_note?: string }
        Returns: Json
      }
      client_mark_contacted: { Args: { p_unlock_id: string }; Returns: Json }
      compute_lead_price: {
        Args: {
          p_budget_eur: number
          p_client_type?: Database["public"]["Enums"]["client_type"]
          p_specialty: string
          p_urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Returns: number
      }
      extract_budget_eur: { Args: { budget_txt: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_review: {
        Args: { p_artisan_id: string; p_comment?: string; p_rating: number }
        Returns: Json
      }
      unlock_lead: { Args: { p_project_id: string }; Returns: Json }
      verify_project_email: {
        Args: { _token: string }
        Returns: {
          contact_email: string
          ok: boolean
          project_id: string
        }[]
      }
      verify_project_otp: {
        Args: { _code: string; _token: string }
        Returns: {
          ok: boolean
          project_id: string
          reason: string
        }[]
      }
    }
    Enums: {
      app_role: "client" | "artisan" | "admin"
      artisan_status: "pending" | "verified" | "rejected"
      client_type: "particulier" | "entreprise" | "agence" | "syndic"
      credit_tx_type:
        | "purchase"
        | "lead_unlock"
        | "refund"
        | "bonus"
        | "admin_adjust"
      dispute_reason:
        | "wrong_number"
        | "not_reachable"
        | "not_owner"
        | "out_of_zone"
        | "other"
      dispute_status: "pending" | "approved" | "rejected"
      project_status: "open" | "in_review" | "closed"
      quote_status: "pending" | "read" | "responded"
      subscription_tier: "free" | "premium" | "elite"
      urgency_level: "normal" | "urgent" | "sos"
      verification_status: "pending" | "verified" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["client", "artisan", "admin"],
      artisan_status: ["pending", "verified", "rejected"],
      client_type: ["particulier", "entreprise", "agence", "syndic"],
      credit_tx_type: [
        "purchase",
        "lead_unlock",
        "refund",
        "bonus",
        "admin_adjust",
      ],
      dispute_reason: [
        "wrong_number",
        "not_reachable",
        "not_owner",
        "out_of_zone",
        "other",
      ],
      dispute_status: ["pending", "approved", "rejected"],
      project_status: ["open", "in_review", "closed"],
      quote_status: ["pending", "read", "responded"],
      subscription_tier: ["free", "premium", "elite"],
      urgency_level: ["normal", "urgent", "sos"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
