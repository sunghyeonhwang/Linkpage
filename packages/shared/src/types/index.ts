export interface User {
  id: string;
  email: string;
  password_hash?: string;
  email_verified: boolean;
  email_verify_token?: string | null;
  password_reset_token?: string | null;
  password_reset_expires?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  background_image_url: string | null;
  social_links: SocialLink[] | null;
  theme_preset: string;
  theme_overrides: ThemeOverrides | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileLink {
  id: string;
  profile_id: string;
  label: string;
  url: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  type: string;
  url: string;
}

export interface ThemeOverrides {
  bgColor?: string;
  bgGradient?: string;
  textColor?: string;
  btnBgColor?: string;
  btnTextColor?: string;
  btnStyle?: 'filled' | 'outlined';
  btnRadius?: 'none' | 'sm' | 'md' | 'full';
  font?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  btnBgColor: string;
  btnTextColor: string;
  btnStyle: 'filled' | 'outlined';
  btnRadius: 'none' | 'sm' | 'md' | 'full';
  font?: string;
}

export interface PublicProfile {
  profile: Omit<Profile, 'user_id'>;
  links: Omit<ProfileLink, 'profile_id'>[];
}

// API response types
export interface ApiResponse<T = void> {
  data?: T;
  error?: { message: string; code?: string };
}

export interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'email' | 'email_verified'>;
}

// Analytics types
export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  todayViews: number;
  todayClicks: number;
}

export interface DailyStat {
  date: string;
  views: number;
  clicks: number;
}

export interface LinkStat {
  linkId: string;
  label: string;
  url: string;
  clicks: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyStats: DailyStat[];
  linkStats: LinkStat[];
}

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface TrackViewPayload {
  profileId: string;
}

export interface TrackClickPayload {
  linkId: string;
  profileId: string;
}
