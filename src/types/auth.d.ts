export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  language?: string;
  studyReminders?: boolean;
  dailyGoal?: number;
}

export interface UserProfile {
  bio?: string;
  level?: number;
  learning_since?: string;
  interests?: string[];
  languages?: UserLanguage[];
  learning_goals?: string[];
  preferred_learning_style?: string;
  time_zone?: string;
  country?: string;
}

export interface UserLanguage {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
} 