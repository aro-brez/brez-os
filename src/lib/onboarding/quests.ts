// Quest Generation & Management System

import { Quest, QuestCategory, Department, UserProfile, Achievement } from './types';

// Pre-defined quests that the system can assign
export const QUEST_TEMPLATES: Omit<Quest, 'id' | 'status' | 'createdAt'>[] = [
  // ============================================
  // DATA UPLOAD QUESTS
  // ============================================
  {
    title: 'Upload Retail Velocity Data',
    description: 'Import your weekly retail velocity reports so we can track store performance and identify opportunities.',
    category: 'data_upload',
    priority: 'critical',
    targetDepartments: ['retail', 'executive'],
    xpReward: 50,
    actionType: 'upload',
    actionConfig: {
      fileTypes: ['csv', 'xlsx'],
      dataType: 'retail_velocity',
      sampleFields: ['store_name', 'week', 'units_sold', 'revenue'],
    },
    impactDescription: 'Enables retail velocity tracking and market analysis',
  },
  {
    title: 'Connect Shopify Store',
    description: 'Link your Shopify account to automatically sync orders, revenue, and customer data.',
    category: 'integration_connect',
    priority: 'critical',
    targetDepartments: 'all',
    xpReward: 100,
    achievementUnlock: 'data_pioneer',
    actionType: 'connect',
    actionConfig: {
      integration: 'shopify',
      scopes: ['orders', 'customers', 'products', 'inventory'],
    },
    impactDescription: 'Real-time DTC metrics, customer data, and order tracking',
  },
  {
    title: 'Connect Meta Ads',
    description: 'Link your Meta Business account to track ad performance, CAC, and ROAS automatically.',
    category: 'integration_connect',
    priority: 'high',
    targetDepartments: ['growth', 'marketing', 'executive'],
    xpReward: 75,
    actionType: 'connect',
    actionConfig: {
      integration: 'meta_ads',
      scopes: ['ads_read', 'insights'],
    },
    impactDescription: 'Automated CAC tracking and ad performance insights',
  },
  {
    title: 'Connect QuickBooks',
    description: 'Link your QuickBooks account for automatic financial data sync.',
    category: 'integration_connect',
    priority: 'critical',
    targetDepartments: ['finance', 'executive'],
    xpReward: 100,
    actionType: 'connect',
    actionConfig: {
      integration: 'quickbooks',
      scopes: ['accounting', 'payments'],
    },
    impactDescription: 'Real-time cash position, P&L, and AP/AR tracking',
  },
  {
    title: 'Connect Okendo Reviews',
    description: 'Link your Okendo account to track customer reviews and sentiment.',
    category: 'integration_connect',
    priority: 'high',
    targetDepartments: ['customer_success', 'marketing', 'executive'],
    xpReward: 50,
    actionType: 'connect',
    actionConfig: {
      integration: 'okendo',
      scopes: ['reviews', 'ratings'],
    },
    impactDescription: 'Customer sentiment analysis and review tracking',
  },
  {
    title: 'Connect TikTok Shop',
    description: 'Link your TikTok Shop to track social commerce performance.',
    category: 'integration_connect',
    priority: 'medium',
    targetDepartments: ['growth', 'marketing', 'executive'],
    xpReward: 50,
    actionType: 'connect',
    actionConfig: {
      integration: 'tiktok_shop',
      scopes: ['orders', 'analytics'],
    },
    impactDescription: 'TikTok Shop sales and engagement tracking',
  },
  {
    title: 'Connect Amazon Seller Central',
    description: 'Link your Amazon account to track marketplace performance.',
    category: 'integration_connect',
    priority: 'high',
    targetDepartments: ['retail', 'growth', 'executive'],
    xpReward: 75,
    actionType: 'connect',
    actionConfig: {
      integration: 'amazon',
      scopes: ['orders', 'inventory', 'advertising'],
    },
    impactDescription: 'Amazon sales, inventory, and advertising metrics',
  },
  {
    title: 'Upload Customer List',
    description: 'Import your customer email list for cohort analysis and retention tracking.',
    category: 'data_upload',
    priority: 'high',
    targetDepartments: ['growth', 'customer_success', 'executive'],
    xpReward: 40,
    actionType: 'upload',
    actionConfig: {
      fileTypes: ['csv'],
      dataType: 'customers',
      sampleFields: ['email', 'first_order_date', 'total_orders', 'ltv'],
    },
    impactDescription: 'Customer cohort analysis and retention curves',
  },
  {
    title: 'Upload Production Schedule',
    description: 'Import your production and inventory schedule for supply planning.',
    category: 'data_upload',
    priority: 'high',
    targetDepartments: ['operations', 'finance', 'executive'],
    xpReward: 50,
    actionType: 'upload',
    actionConfig: {
      fileTypes: ['csv', 'xlsx'],
      dataType: 'production',
      sampleFields: ['sku', 'week', 'units_planned', 'cost'],
    },
    impactDescription: 'Inventory forecasting and cash planning',
  },

  // ============================================
  // PROFILE COMPLETION QUESTS
  // ============================================
  {
    title: 'Complete Your Profile',
    description: 'Tell us about your role and preferences so we can personalize your experience.',
    category: 'profile_complete',
    priority: 'high',
    targetDepartments: 'all',
    xpReward: 25,
    achievementUnlock: 'profile_complete',
    actionType: 'answer',
    actionConfig: {
      questions: ['department', 'role_title', 'primary_metrics'],
    },
    impactDescription: 'Personalized dashboard and recommendations',
  },
  {
    title: 'Set Your KPI Targets',
    description: 'Define your personal KPI targets for this quarter.',
    category: 'profile_complete',
    priority: 'medium',
    targetDepartments: 'all',
    xpReward: 30,
    actionType: 'answer',
    actionConfig: {
      questions: ['kpi_targets'],
    },
    impactDescription: 'Track progress against your goals',
  },

  // ============================================
  // CONTRIBUTION QUESTS
  // ============================================
  {
    title: 'Share a Customer Insight',
    description: 'Share a customer insight, feedback, or pattern you\'ve noticed.',
    category: 'contribution',
    priority: 'medium',
    targetDepartments: ['customer_success', 'marketing'],
    xpReward: 20,
    actionType: 'answer',
    actionConfig: {
      type: 'insight_contribution',
      category: 'customer',
    },
    impactDescription: 'Help the team understand customer needs better',
  },
  {
    title: 'Document a Decision',
    description: 'Log a recent decision you made and the reasoning behind it.',
    category: 'contribution',
    priority: 'medium',
    targetDepartments: 'all',
    xpReward: 25,
    actionType: 'answer',
    actionConfig: {
      type: 'decision_log',
    },
    impactDescription: 'Build organizational knowledge and decision history',
  },
  {
    title: 'Add a Retail Contact',
    description: 'Add contact information for a retail buyer or account manager.',
    category: 'contribution',
    priority: 'medium',
    targetDepartments: ['retail'],
    xpReward: 15,
    actionType: 'answer',
    actionConfig: {
      type: 'contact_add',
      category: 'retail',
    },
    impactDescription: 'Build our retail relationship database',
  },

  // ============================================
  // INSIGHT ACTION QUESTS
  // ============================================
  {
    title: 'Review Weekly Insights',
    description: 'Review this week\'s AI-generated insights and mark actions taken.',
    category: 'insight_action',
    priority: 'high',
    targetDepartments: 'all',
    xpReward: 15,
    actionType: 'review',
    actionConfig: {
      type: 'weekly_insights',
    },
    impactDescription: 'Stay on top of business trends and opportunities',
  },
  {
    title: 'Respond to Alert',
    description: 'A critical metric has changed. Review and take action.',
    category: 'insight_action',
    priority: 'critical',
    targetDepartments: 'all',
    xpReward: 30,
    actionType: 'action',
    actionConfig: {
      type: 'alert_response',
    },
    impactDescription: 'Address issues before they become problems',
  },

  // ============================================
  // LEARNING QUESTS
  // ============================================
  {
    title: 'Explore the Dashboard',
    description: 'Take a tour of the main dashboard and discover key features.',
    category: 'learning',
    priority: 'medium',
    targetDepartments: 'all',
    xpReward: 15,
    actionType: 'learn',
    actionConfig: {
      tour: 'dashboard',
    },
    impactDescription: 'Learn how to get the most from the system',
  },
  {
    title: 'Ask Your First AI Question',
    description: 'Use the AI assistant to ask a question about your metrics.',
    category: 'learning',
    priority: 'medium',
    targetDepartments: 'all',
    xpReward: 20,
    achievementUnlock: 'ai_curious',
    actionType: 'learn',
    actionConfig: {
      type: 'ai_chat',
    },
    impactDescription: 'Discover AI-powered insights',
  },
];

// Achievements that can be unlocked
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'profile_complete',
    name: 'Identity Established',
    description: 'Completed your profile setup',
    icon: '🎭',
    xpBonus: 10,
    rarity: 'common',
    condition: { type: 'specific_action', value: 'profile_complete' },
  },
  {
    id: 'data_pioneer',
    name: 'Data Pioneer',
    description: 'Connected your first integration',
    icon: '🔌',
    xpBonus: 25,
    rarity: 'common',
    condition: { type: 'specific_action', value: 'first_integration' },
  },
  {
    id: 'ai_curious',
    name: 'AI Curious',
    description: 'Asked your first question to the AI',
    icon: '🤖',
    xpBonus: 15,
    rarity: 'common',
    condition: { type: 'specific_action', value: 'first_ai_chat' },
  },
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Logged in 3 days in a row',
    icon: '🔥',
    xpBonus: 25,
    rarity: 'common',
    condition: { type: 'streak_days', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Logged in 7 days in a row',
    icon: '⚡',
    xpBonus: 50,
    rarity: 'rare',
    condition: { type: 'streak_days', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Logged in 30 days in a row',
    icon: '👑',
    xpBonus: 200,
    rarity: 'epic',
    condition: { type: 'streak_days', value: 30 },
  },
  {
    id: 'quests_5',
    name: 'Quest Beginner',
    description: 'Completed 5 quests',
    icon: '🎯',
    xpBonus: 30,
    rarity: 'common',
    condition: { type: 'quests_completed', value: 5 },
  },
  {
    id: 'quests_25',
    name: 'Quest Champion',
    description: 'Completed 25 quests',
    icon: '🏆',
    xpBonus: 100,
    rarity: 'rare',
    condition: { type: 'quests_completed', value: 25 },
  },
  {
    id: 'quests_100',
    name: 'Quest Legend',
    description: 'Completed 100 quests',
    icon: '🌟',
    xpBonus: 500,
    rarity: 'legendary',
    condition: { type: 'quests_completed', value: 100 },
  },
  {
    id: 'data_hero',
    name: 'Data Hero',
    description: 'Contributed data that improved team insights',
    icon: '📊',
    xpBonus: 75,
    rarity: 'rare',
    condition: { type: 'data_contributed', value: 10 },
  },
  {
    id: 'supermind_contributor',
    name: 'Supermind Contributor',
    description: 'Your contributions have become part of the Supermind',
    icon: '🧠',
    xpBonus: 150,
    rarity: 'epic',
    condition: { type: 'data_contributed', value: 50 },
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reached Level 5',
    icon: '⭐',
    xpBonus: 50,
    rarity: 'common',
    condition: { type: 'xp_earned', value: 500 },
  },
  {
    id: 'level_10',
    name: 'Supermind Operator',
    description: 'Reached Level 10',
    icon: '💫',
    xpBonus: 150,
    rarity: 'rare',
    condition: { type: 'xp_earned', value: 1500 },
  },
];

// Generate personalized quests for a user based on their profile
export function generateQuestsForUser(
  userProfile: Partial<UserProfile>,
  completedQuestIds: string[] = [],
  connectedIntegrations: string[] = []
): Quest[] {
  const department = userProfile.department || 'executive';
  const now = new Date();

  return QUEST_TEMPLATES
    .filter(template => {
      // Filter by department
      if (template.targetDepartments !== 'all') {
        if (!template.targetDepartments.includes(department)) {
          return false;
        }
      }

      // Filter out already completed (by matching title/category for now)
      const questId = `${template.category}_${template.title.toLowerCase().replace(/\s/g, '_')}`;
      if (completedQuestIds.includes(questId)) {
        return false;
      }

      // Filter out integrations that are already connected
      if (template.category === 'integration_connect') {
        const integration = template.actionConfig.integration as string;
        if (connectedIntegrations.includes(integration)) {
          return false;
        }
      }

      return true;
    })
    .map(template => {
      const questId = `${template.category}_${template.title.toLowerCase().replace(/\s/g, '_')}`;
      return {
        ...template,
        id: questId,
        status: 'available' as const,
        createdAt: now,
      };
    })
    // Sort by priority
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

// Check if user earned any new achievements
export function checkAchievements(
  userProfile: UserProfile,
  currentAchievements: string[]
): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already earned
    if (currentAchievements.includes(achievement.id)) {
      continue;
    }

    let earned = false;

    switch (achievement.condition.type) {
      case 'streak_days':
        earned = userProfile.currentStreak >= (achievement.condition.value as number);
        break;
      case 'quests_completed':
        earned = userProfile.questsCompleted >= (achievement.condition.value as number);
        break;
      case 'xp_earned':
        earned = userProfile.xp >= (achievement.condition.value as number);
        break;
      case 'data_contributed':
        earned = userProfile.dataContributions >= (achievement.condition.value as number);
        break;
      // specific_action achievements are handled elsewhere
    }

    if (earned) {
      newAchievements.push({
        ...achievement,
        unlockedAt: new Date(),
      });
    }
  }

  return newAchievements;
}

// Get quest recommendations with AI reasoning
export function getQuestRecommendations(
  userProfile: Partial<UserProfile>,
  availableQuests: Quest[]
): { quest: Quest; reason: string }[] {
  const recommendations: { quest: Quest; reason: string }[] = [];
  const focusAreas = userProfile.focusAreas || [];
  const metrics = userProfile.primaryMetrics || [];

  for (const quest of availableQuests.slice(0, 5)) {
    let reason = '';

    // Critical quests
    if (quest.priority === 'critical') {
      reason = 'Critical for system functionality';
    }
    // Alignment with focus areas
    else if (quest.category === 'data_upload' && focusAreas.includes('scale_paid')) {
      reason = 'Will help optimize your paid acquisition focus';
    }
    else if (quest.category === 'integration_connect') {
      reason = `Enables automated tracking for ${quest.impactDescription}`;
    }
    else if (quest.category === 'contribution') {
      reason = 'Your unique perspective adds value to the whole team';
    }
    else {
      reason = quest.impactDescription || 'Helps improve system intelligence';
    }

    recommendations.push({ quest, reason });
  }

  return recommendations;
}
