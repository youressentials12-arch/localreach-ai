export type CampaignStatus = "active" | "paused" | "completed";

export type OutreachStatus =
  | "discovered"
  | "contacted"
  | "replied"
  | "negotiating"
  | "won"
  | "lost"
  | "not_qualified";

export type ContactChannel =
  | "email"
  | "phone"
  | "instagram"
  | "facebook"
  | "linkedin";

export type HookTone =
  | "direct"
  | "empathetic"
  | "curious"
  | "provocative"
  | "professional";

export type ActivityType =
  | "contacted"
  | "replied"
  | "status_changed"
  | "note_added"
  | "hook_used";

export interface QualificationCriteria {
  no_website?: boolean;
  weak_website?: boolean;
  low_reviews?: boolean;
  low_rating?: boolean;
  no_review_responses?: boolean;
  no_social_media?: boolean;
  new_business?: boolean;
  incomplete_contact?: boolean;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  service_offered: string;
  target_industry: string;
  target_location: string;
  qualification_criteria: QualificationCriteria;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  user_id: string;
  campaign_id?: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  business_website?: string;
  business_category?: string;
  google_place_id?: string;
  google_rating?: number;
  google_reviews_count?: number;
  google_maps_url?: string;
  opportunity_score?: number;
  analysis_summary?: string;
  pain_points?: string[];
  analysis_data?: Record<string, unknown>;
  outreach_status: OutreachStatus;
  contact_channel?: ContactChannel;
  contacted_at?: string;
  last_activity_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Hook {
  id: string;
  prospect_id: string;
  user_id: string;
  channel: ContactChannel;
  hook_subject?: string;
  hook_content: string;
  tone: HookTone;
  was_used: boolean;
  got_response?: boolean;
  created_at: string;
}

export interface OutreachActivity {
  id: string;
  prospect_id: string;
  user_id: string;
  activity_type: ActivityType;
  channel?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  types?: string[];
}

export interface AIAnalysisResult {
  opportunity_score: number;
  pain_points: string[];
  analysis_summary: string;
}

export interface GeneratedHooks {
  email?: { subject: string; content: string };
  phone?: { content: string };
  instagram?: { content: string };
  facebook?: { content: string };
  linkedin?: { content: string };
}

export interface DashboardStats {
  total_discovered: number;
  contacted_this_month: number;
  response_rate: number;
  clients_won: number;
}

export interface ActivityFeedItem {
  id: string;
  activity_type: ActivityType;
  channel?: string;
  details?: Record<string, unknown>;
  created_at: string;
  prospects: { business_name: string; business_category: string | null } | null;
}

export type GoalStatus = "reached" | "on_track" | "slightly_behind" | "behind";

export interface GoalProgress {
  current: number;
  target: number;
  status: GoalStatus;
}

export interface UserGoals {
  goal_prospects: number;
  goal_contacted: number;
  goal_replies: number;
  goal_clients: number;
}

export type NotificationType = "follow_up" | "goal_reached" | "campaign_done" | "system";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  read: boolean;
  prospect_id?: string;
  campaign_id?: string;
  created_at: string;
}
