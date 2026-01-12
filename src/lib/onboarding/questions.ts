// Onboarding Questions for Team Member Personalization

import { OnboardingQuestion, Department } from './types';

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // Step 1: Role & Department
  {
    id: 'department',
    question: 'What team are you on?',
    type: 'single',
    options: [
      { value: 'executive', label: 'Executive / Leadership', description: 'CEO, COO, strategic leadership' },
      { value: 'growth', label: 'Growth & Performance', description: 'Paid media, analytics, CRO' },
      { value: 'marketing', label: 'Brand & Marketing', description: 'Brand, content, social, PR' },
      { value: 'retail', label: 'Retail & Sales', description: 'Retail partnerships, field sales' },
      { value: 'product', label: 'Product & R&D', description: 'Product development, formulation' },
      { value: 'operations', label: 'Operations & Supply Chain', description: 'Manufacturing, logistics, inventory' },
      { value: 'finance', label: 'Finance & Accounting', description: 'Finance, accounting, AP/AR' },
      { value: 'customer_success', label: 'Customer Success', description: 'Support, retention, community' },
      { value: 'creative', label: 'Creative & Design', description: 'Design, video, photography' },
    ],
    required: true,
    purpose: 'role_context',
  },
  {
    id: 'role_title',
    question: 'What\'s your role title?',
    type: 'text',
    placeholder: 'e.g., Performance Marketing Manager',
    required: true,
    purpose: 'role_context',
  },

  // Step 2: What metrics matter to you
  {
    id: 'primary_metrics',
    question: 'Which metrics do you care about most? (Select up to 3)',
    type: 'multiple',
    options: [
      { value: 'revenue', label: 'Revenue & Sales', description: 'Total revenue, MRR, order volume' },
      { value: 'cac_roas', label: 'CAC & ROAS', description: 'Customer acquisition cost, ad efficiency' },
      { value: 'retention', label: 'Retention & LTV', description: 'Repeat rate, churn, customer lifetime value' },
      { value: 'velocity', label: 'Retail Velocity', description: 'Units per store per week, reorder rates' },
      { value: 'margin', label: 'Contribution Margin', description: 'Profit per order, gross margin' },
      { value: 'inventory', label: 'Inventory & Supply', description: 'Stock levels, production schedule' },
      { value: 'engagement', label: 'Engagement & Brand', description: 'Social engagement, NPS, reviews' },
      { value: 'cash', label: 'Cash & Runway', description: 'Cash position, burn rate, AP/AR' },
    ],
    required: true,
    purpose: 'metric_preference',
  },

  // Step 3: Current focus
  {
    id: 'current_focus',
    question: 'What are you focused on this quarter?',
    type: 'multiple',
    options: [
      { value: 'scale_paid', label: 'Scaling paid acquisition', description: 'Growing ad spend efficiently' },
      { value: 'improve_retention', label: 'Improving retention', description: 'Reducing churn, increasing repeat' },
      { value: 'retail_expansion', label: 'Retail expansion', description: 'New accounts, improving velocity' },
      { value: 'new_products', label: 'Launching new products', description: 'SKU development, formulation' },
      { value: 'ops_efficiency', label: 'Operations efficiency', description: 'Cost reduction, process improvement' },
      { value: 'brand_awareness', label: 'Brand awareness', description: 'PR, social, content marketing' },
      { value: 'team_building', label: 'Team building', description: 'Hiring, training, culture' },
      { value: 'profitability', label: 'Path to profitability', description: 'Margin improvement, cost control' },
    ],
    required: true,
    purpose: 'focus_area',
  },

  // Step 4: Communication preference
  {
    id: 'communication_style',
    question: 'How do you prefer information delivered?',
    type: 'single',
    options: [
      { value: 'detailed', label: 'Detailed & thorough', description: 'Give me all the context and data' },
      { value: 'concise', label: 'Concise & actionable', description: 'Just the key points and next steps' },
      { value: 'visual', label: 'Visual & charts', description: 'Show me graphs and dashboards' },
    ],
    required: true,
    purpose: 'communication_style',
  },

  // Step 5: Notification preference
  {
    id: 'notification_preference',
    question: 'How often do you want to be notified?',
    type: 'single',
    options: [
      { value: 'all', label: 'Everything', description: 'All updates, insights, and opportunities' },
      { value: 'important', label: 'Important only', description: 'Key metrics changes and urgent items' },
      { value: 'minimal', label: 'Minimal', description: 'Only critical alerts' },
    ],
    required: true,
    purpose: 'communication_style',
  },

  // Step 6: Goals and challenges
  {
    id: 'biggest_challenge',
    question: 'What\'s your biggest challenge right now?',
    type: 'text',
    placeholder: 'e.g., Getting reliable data on retail velocity by account...',
    required: false,
    purpose: 'goals',
  },

  // Step 7: What would help most
  {
    id: 'most_helpful',
    question: 'What would be most helpful from this system?',
    type: 'multiple',
    options: [
      { value: 'dashboards', label: 'Real-time dashboards', description: 'See all my metrics in one place' },
      { value: 'alerts', label: 'Proactive alerts', description: 'Know when something needs attention' },
      { value: 'recommendations', label: 'AI recommendations', description: 'Get suggested actions and priorities' },
      { value: 'collaboration', label: 'Team collaboration', description: 'Stay aligned with teammates' },
      { value: 'reporting', label: 'Easy reporting', description: 'Generate reports quickly' },
      { value: 'forecasting', label: 'Forecasting', description: 'Predict future outcomes' },
    ],
    required: true,
    purpose: 'goals',
  },
];

// Department-specific follow-up questions
export const DEPARTMENT_QUESTIONS: Partial<Record<Department, OnboardingQuestion[]>> = {
  growth: [
    {
      id: 'growth_channels',
      question: 'Which channels do you manage?',
      type: 'multiple',
      options: [
        { value: 'meta', label: 'Meta (Facebook/Instagram)' },
        { value: 'google', label: 'Google Ads' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'influencer', label: 'Influencer' },
        { value: 'email', label: 'Email/SMS' },
        { value: 'affiliate', label: 'Affiliate' },
        { value: 'amazon', label: 'Amazon Ads' },
      ],
      required: true,
      purpose: 'role_context',
    },
    {
      id: 'growth_target_cac',
      question: 'What\'s your target CAC?',
      type: 'text',
      placeholder: 'e.g., $45',
      required: false,
      purpose: 'goals',
    },
  ],
  retail: [
    {
      id: 'retail_accounts',
      question: 'Which retail accounts do you manage?',
      type: 'text',
      placeholder: 'e.g., Erewhon, Bristol Farms, Sprouts...',
      required: false,
      purpose: 'role_context',
    },
    {
      id: 'retail_regions',
      question: 'Which regions are you focused on?',
      type: 'multiple',
      options: [
        { value: 'west', label: 'West Coast' },
        { value: 'southwest', label: 'Southwest' },
        { value: 'midwest', label: 'Midwest' },
        { value: 'southeast', label: 'Southeast' },
        { value: 'northeast', label: 'Northeast' },
        { value: 'national', label: 'National' },
      ],
      required: false,
      purpose: 'role_context',
    },
  ],
  marketing: [
    {
      id: 'marketing_channels',
      question: 'Which marketing channels do you own?',
      type: 'multiple',
      options: [
        { value: 'social', label: 'Social Media' },
        { value: 'content', label: 'Content & Blog' },
        { value: 'pr', label: 'PR & Press' },
        { value: 'partnerships', label: 'Partnerships' },
        { value: 'events', label: 'Events & Sampling' },
        { value: 'email', label: 'Email Marketing' },
      ],
      required: true,
      purpose: 'role_context',
    },
  ],
  customer_success: [
    {
      id: 'cs_focus',
      question: 'What\'s your primary focus?',
      type: 'multiple',
      options: [
        { value: 'support', label: 'Customer Support' },
        { value: 'retention', label: 'Retention & Win-back' },
        { value: 'community', label: 'Community Management' },
        { value: 'reviews', label: 'Reviews & UGC' },
        { value: 'subscriptions', label: 'Subscription Management' },
      ],
      required: true,
      purpose: 'role_context',
    },
  ],
  finance: [
    {
      id: 'finance_systems',
      question: 'What financial systems do you use?',
      type: 'multiple',
      options: [
        { value: 'quickbooks', label: 'QuickBooks' },
        { value: 'netsuite', label: 'NetSuite' },
        { value: 'xero', label: 'Xero' },
        { value: 'excel', label: 'Excel/Sheets' },
        { value: 'other', label: 'Other' },
      ],
      required: false,
      purpose: 'role_context',
    },
  ],
};

// Get all questions for a specific department
export function getQuestionsForDepartment(department: Department): OnboardingQuestion[] {
  const baseQuestions = ONBOARDING_QUESTIONS;
  const departmentQuestions = DEPARTMENT_QUESTIONS[department] || [];

  // Insert department-specific questions after the general ones
  return [...baseQuestions, ...departmentQuestions];
}

// Process answers and create user profile data
export function processOnboardingAnswers(
  answers: Record<string, string | string[]>
): Partial<import('./types').UserProfile> {
  return {
    department: answers.department as Department,
    role: answers.role_title as string,
    primaryMetrics: Array.isArray(answers.primary_metrics)
      ? answers.primary_metrics
      : [answers.primary_metrics],
    focusAreas: Array.isArray(answers.current_focus)
      ? answers.current_focus
      : [answers.current_focus],
    communicationStyle: answers.communication_style as 'detailed' | 'concise' | 'visual',
    notificationPreference: answers.notification_preference as 'all' | 'important' | 'minimal',
    onboardingCompleted: true,
  };
}
