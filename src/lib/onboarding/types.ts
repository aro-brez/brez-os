// Team Onboarding & Quest System Types

export type Department =
  | 'executive'
  | 'growth'
  | 'marketing'
  | 'retail'
  | 'product'
  | 'operations'
  | 'finance'
  | 'customer_success'
  | 'creative';

export type QuestCategory =
  | 'data_upload'
  | 'integration_connect'
  | 'profile_complete'
  | 'insight_action'
  | 'team_collaboration'
  | 'learning'
  | 'contribution';

export type QuestPriority = 'critical' | 'high' | 'medium' | 'low';

export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'expired';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  department: Department;
  role: string;
  avatarUrl?: string;

  // Onboarding state
  onboardingCompleted: boolean;
  onboardingStep: number;

  // Personalization from questions
  primaryMetrics: string[];
  focusAreas: string[];
  workingHours?: { start: string; end: string };
  communicationStyle: 'detailed' | 'concise' | 'visual';
  notificationPreference: 'all' | 'important' | 'minimal';

  // Gamification
  xp: number;
  level: number;
  achievements: string[];
  questsCompleted: number;
  currentStreak: number;
  longestStreak: number;

  // Activity
  lastActive: Date;
  totalSessions: number;
  totalTimeMinutes: number;
  dataContributions: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  priority: QuestPriority;
  status: QuestStatus;

  // Who can see this quest
  targetDepartments: Department[] | 'all';
  targetRoles?: string[];

  // Requirements
  prerequisites?: string[]; // Quest IDs that must be completed first

  // Rewards
  xpReward: number;
  achievementUnlock?: string;

  // Actions
  actionType: 'upload' | 'connect' | 'answer' | 'review' | 'action' | 'learn';
  actionConfig: Record<string, unknown>;

  // Progress
  progress?: number; // 0-100
  progressSteps?: QuestStep[];

  // Timing
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;

  // Impact tracking
  impactDescription?: string;
  measuredImpact?: string;
}

export interface QuestStep {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'scale';
  options?: { value: string; label: string; description?: string }[];
  placeholder?: string;
  minScale?: number;
  maxScale?: number;
  required: boolean;
  department?: Department | 'all';

  // For personalization
  purpose: 'role_context' | 'metric_preference' | 'focus_area' | 'communication_style' | 'goals';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  condition: {
    type: 'quests_completed' | 'xp_earned' | 'streak_days' | 'data_contributed' | 'specific_action';
    value: number | string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'quest_available' | 'quest_completed' | 'achievement_unlocked' | 'insight_ready' | 'action_needed' | 'team_update';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// XP and Level calculations
export const XP_PER_LEVEL = 100;
export const LEVEL_MULTIPLIER = 1.5;

export function calculateLevel(xp: number): number {
  let level = 1;
  let xpForNextLevel = XP_PER_LEVEL;
  let totalXpNeeded = 0;

  while (totalXpNeeded + xpForNextLevel <= xp) {
    totalXpNeeded += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }

  return level;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(xp);
  let totalXpForCurrentLevel = 0;

  for (let i = 1; i < level; i++) {
    totalXpForCurrentLevel += Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, i - 1));
  }

  const xpInCurrentLevel = xp - totalXpForCurrentLevel;
  const xpNeededForNextLevel = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));

  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNextLevel,
    progress: (xpInCurrentLevel / xpNeededForNextLevel) * 100
  };
}

// Department display names
export const DEPARTMENT_NAMES: Record<Department, string> = {
  executive: 'Executive / Leadership',
  growth: 'Growth & Performance',
  marketing: 'Brand & Marketing',
  retail: 'Retail & Sales',
  product: 'Product & R&D',
  operations: 'Operations & Supply Chain',
  finance: 'Finance & Accounting',
  customer_success: 'Customer Success',
  creative: 'Creative & Design',
};

// Department colors for UI
export const DEPARTMENT_COLORS: Record<Department, string> = {
  executive: '#8B5CF6',    // Purple
  growth: '#e3f98a',       // Lime
  marketing: '#EC4899',    // Pink
  retail: '#06B6D4',       // Cyan
  product: '#F59E0B',      // Amber
  operations: '#10B981',   // Emerald
  finance: '#6366F1',      // Indigo
  customer_success: '#14B8A6', // Teal
  creative: '#F472B6',     // Light pink
};
