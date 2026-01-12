// Integration Platforms for BREZ Supermind
// Each integration feeds data into the Supermind for analysis and recommendations

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'syncing';

export type IntegrationCategory =
  | 'ecommerce'
  | 'advertising'
  | 'analytics'
  | 'finance'
  | 'customer'
  | 'retail'
  | 'marketplace'
  | 'social'
  | 'operations';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  status: IntegrationStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';

  // What data this integration provides
  dataTypes: string[];

  // How it impacts the Supermind
  supermindImpact: string;

  // Connection details
  authType: 'oauth' | 'api_key' | 'webhook' | 'csv_upload';
  authUrl?: string;
  scopes?: string[];

  // Last sync info
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  recordCount?: number;

  // Configuration
  config?: Record<string, unknown>;
}

// All available integrations
export const INTEGRATIONS: Integration[] = [
  // ============================================
  // ECOMMERCE
  // ============================================
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Your DTC store - orders, customers, inventory, subscriptions',
    category: 'ecommerce',
    icon: '🛍️',
    status: 'disconnected',
    priority: 'critical',
    dataTypes: ['orders', 'customers', 'products', 'inventory', 'subscriptions', 'discounts'],
    supermindImpact: 'Core DTC metrics, customer LTV, subscription health, revenue tracking',
    authType: 'oauth',
    authUrl: 'https://shopify.com/admin/oauth/authorize',
    scopes: ['read_orders', 'read_customers', 'read_products', 'read_inventory'],
    syncFrequency: 'realtime',
  },
  {
    id: 'recharge',
    name: 'Recharge',
    description: 'Subscription management - churn, retention, MRR',
    category: 'ecommerce',
    icon: '🔄',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['subscriptions', 'churn', 'mrr', 'retention'],
    supermindImpact: 'Subscription metrics, churn prediction, retention optimization',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },

  // ============================================
  // ADVERTISING
  // ============================================
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    description: 'Facebook & Instagram ads - spend, CAC, ROAS, attribution',
    category: 'advertising',
    icon: '📘',
    status: 'disconnected',
    priority: 'critical',
    dataTypes: ['campaigns', 'ad_sets', 'ads', 'spend', 'conversions', 'cac', 'roas'],
    supermindImpact: 'CAC tracking, ROAS optimization, creative performance, audience insights',
    authType: 'oauth',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['ads_read', 'ads_management', 'business_management'],
    syncFrequency: 'hourly',
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Search & display ads - spend, conversions, keywords',
    category: 'advertising',
    icon: '🔍',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['campaigns', 'keywords', 'spend', 'conversions'],
    supermindImpact: 'Search intent data, keyword optimization, brand vs non-brand performance',
    authType: 'oauth',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    syncFrequency: 'hourly',
  },
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'TikTok advertising - spend, engagement, conversions',
    category: 'advertising',
    icon: '🎵',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['campaigns', 'spend', 'engagement', 'conversions'],
    supermindImpact: 'TikTok performance, viral content identification, Gen Z acquisition',
    authType: 'oauth',
    syncFrequency: 'hourly',
  },
  {
    id: 'amazon_advertising',
    name: 'Amazon Advertising',
    description: 'Amazon PPC - sponsored products, brands, display',
    category: 'advertising',
    icon: '📦',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['campaigns', 'spend', 'acos', 'sales'],
    supermindImpact: 'Amazon ad efficiency, keyword targeting, ACOS optimization',
    authType: 'oauth',
    syncFrequency: 'daily',
  },

  // ============================================
  // MARKETPLACES
  // ============================================
  {
    id: 'amazon_seller',
    name: 'Amazon Seller Central',
    description: 'Amazon marketplace - sales, inventory, reviews, buy box',
    category: 'marketplace',
    icon: '📦',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['orders', 'inventory', 'buy_box', 'reviews', 'returns'],
    supermindImpact: 'Amazon channel health, inventory alerts, review sentiment, competitive position',
    authType: 'oauth',
    syncFrequency: 'hourly',
  },
  {
    id: 'tiktok_shop',
    name: 'TikTok Shop',
    description: 'TikTok social commerce - orders, products, affiliates',
    category: 'marketplace',
    icon: '🛒',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['orders', 'products', 'affiliates', 'live_sales'],
    supermindImpact: 'Social commerce metrics, affiliate performance, live shopping data',
    authType: 'oauth',
    syncFrequency: 'hourly',
  },

  // ============================================
  // ANALYTICS
  // ============================================
  {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    description: 'Website analytics - traffic, conversion, user behavior',
    category: 'analytics',
    icon: '📊',
    status: 'disconnected',
    priority: 'critical',
    dataTypes: ['sessions', 'users', 'conversions', 'events', 'funnels'],
    supermindImpact: 'Conversion funnel optimization, traffic source analysis, user journey mapping',
    authType: 'oauth',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    syncFrequency: 'daily',
  },
  {
    id: 'triple_whale',
    name: 'Triple Whale',
    description: 'Attribution & analytics - blended CAC, MER, customer journeys',
    category: 'analytics',
    icon: '🐋',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['attribution', 'blended_cac', 'mer', 'ltv'],
    supermindImpact: 'Cross-channel attribution, true CAC calculation, marketing efficiency',
    authType: 'api_key',
    syncFrequency: 'daily',
  },
  {
    id: 'northbeam',
    name: 'Northbeam',
    description: 'Multi-touch attribution - MMM, incrementality',
    category: 'analytics',
    icon: '🧭',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['attribution', 'incrementality', 'mmm'],
    supermindImpact: 'Incrementality testing, media mix modeling, true channel value',
    authType: 'api_key',
    syncFrequency: 'daily',
  },

  // ============================================
  // FINANCE
  // ============================================
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting - P&L, cash flow, AP/AR, expenses',
    category: 'finance',
    icon: '💰',
    status: 'disconnected',
    priority: 'critical',
    dataTypes: ['transactions', 'invoices', 'bills', 'cash_flow', 'pnl'],
    supermindImpact: 'Cash position, runway calculation, AP management, profitability tracking',
    authType: 'oauth',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    scopes: ['com.intuit.quickbooks.accounting'],
    syncFrequency: 'daily',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing - transactions, refunds, disputes',
    category: 'finance',
    icon: '💳',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['payments', 'refunds', 'disputes', 'payouts'],
    supermindImpact: 'Payment health, chargeback monitoring, cash timing',
    authType: 'api_key',
    syncFrequency: 'realtime',
  },

  // ============================================
  // CUSTOMER
  // ============================================
  {
    id: 'okendo',
    name: 'Okendo',
    description: 'Reviews & UGC - ratings, sentiment, customer photos',
    category: 'customer',
    icon: '⭐',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['reviews', 'ratings', 'sentiment', 'ugc'],
    supermindImpact: 'Customer sentiment analysis, product feedback, social proof optimization',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },
  {
    id: 'gorgias',
    name: 'Gorgias',
    description: 'Customer support - tickets, response time, CSAT',
    category: 'customer',
    icon: '💬',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['tickets', 'csat', 'response_time', 'resolution_time'],
    supermindImpact: 'Support quality metrics, common issues, customer satisfaction',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Email & SMS - campaigns, flows, revenue attribution',
    category: 'customer',
    icon: '📧',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['campaigns', 'flows', 'revenue', 'engagement'],
    supermindImpact: 'Email/SMS revenue, retention flows, lifecycle marketing',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },
  {
    id: 'postscript',
    name: 'Postscript',
    description: 'SMS marketing - campaigns, subscribers, revenue',
    category: 'customer',
    icon: '📱',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['campaigns', 'subscribers', 'revenue'],
    supermindImpact: 'SMS channel performance, subscriber growth, campaign optimization',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },

  // ============================================
  // RETAIL
  // ============================================
  {
    id: 'retail_velocity',
    name: 'Retail Velocity',
    description: 'Store-level sell-through data from distributors/retailers',
    category: 'retail',
    icon: '🏪',
    status: 'disconnected',
    priority: 'critical',
    dataTypes: ['velocity', 'doors', 'reorders', 'inventory'],
    supermindImpact: 'Retail performance by account, market penetration, reorder forecasting',
    authType: 'csv_upload',
    syncFrequency: 'weekly',
  },
  {
    id: 'spins',
    name: 'SPINS',
    description: 'Natural channel syndicated data - market share, trends',
    category: 'retail',
    icon: '📈',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['market_share', 'category_trends', 'competitor_data'],
    supermindImpact: 'Market position, category dynamics, competitive intelligence',
    authType: 'csv_upload',
    syncFrequency: 'monthly',
  },
  {
    id: 'retail_link',
    name: 'Retail Link (Walmart)',
    description: 'Walmart supplier data - sales, inventory, forecasts',
    category: 'retail',
    icon: '🔵',
    status: 'disconnected',
    priority: 'low',
    dataTypes: ['sales', 'inventory', 'forecasts'],
    supermindImpact: 'Walmart channel performance, inventory optimization',
    authType: 'api_key',
    syncFrequency: 'daily',
  },

  // ============================================
  // SOCIAL & PR
  // ============================================
  {
    id: 'sprout_social',
    name: 'Sprout Social',
    description: 'Social media management - engagement, mentions, sentiment',
    category: 'social',
    icon: '🌱',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['engagement', 'mentions', 'sentiment', 'reach'],
    supermindImpact: 'Brand health, social listening, influencer identification',
    authType: 'oauth',
    syncFrequency: 'hourly',
  },
  {
    id: 'meltwater',
    name: 'Meltwater',
    description: 'PR & media monitoring - coverage, sentiment, share of voice',
    category: 'social',
    icon: '📰',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['media_mentions', 'sentiment', 'share_of_voice'],
    supermindImpact: 'PR effectiveness, brand perception, crisis monitoring',
    authType: 'api_key',
    syncFrequency: 'daily',
  },
  {
    id: 'instagram_insights',
    name: 'Instagram Insights',
    description: 'Organic Instagram performance - reach, engagement, followers',
    category: 'social',
    icon: '📸',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['reach', 'engagement', 'followers', 'content_performance'],
    supermindImpact: 'Content optimization, audience insights, organic growth',
    authType: 'oauth',
    syncFrequency: 'daily',
  },

  // ============================================
  // AFFILIATE & PARTNERSHIPS
  // ============================================
  {
    id: 'impact',
    name: 'Impact',
    description: 'Affiliate & partnership management - commissions, performance',
    category: 'marketplace',
    icon: '🤝',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['affiliates', 'commissions', 'conversions'],
    supermindImpact: 'Affiliate channel performance, partner optimization, commission efficiency',
    authType: 'api_key',
    syncFrequency: 'daily',
  },
  {
    id: 'refersion',
    name: 'Refersion',
    description: 'Affiliate tracking - referrals, commissions, influencers',
    category: 'marketplace',
    icon: '📣',
    status: 'disconnected',
    priority: 'medium',
    dataTypes: ['affiliates', 'referrals', 'commissions'],
    supermindImpact: 'Affiliate program health, influencer ROI, referral tracking',
    authType: 'api_key',
    syncFrequency: 'daily',
  },

  // ============================================
  // OPERATIONS
  // ============================================
  {
    id: 'shipbob',
    name: 'ShipBob',
    description: '3PL fulfillment - inventory, shipping, SLAs',
    category: 'operations',
    icon: '📦',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['inventory', 'shipments', 'sla_metrics'],
    supermindImpact: 'Fulfillment health, shipping costs, inventory distribution',
    authType: 'api_key',
    syncFrequency: 'hourly',
  },
  {
    id: 'production_schedule',
    name: 'Production Schedule',
    description: 'Manufacturing schedule - production runs, costs, timing',
    category: 'operations',
    icon: '🏭',
    status: 'disconnected',
    priority: 'high',
    dataTypes: ['production_runs', 'costs', 'schedule'],
    supermindImpact: 'Cash flow planning, inventory forecasting, COGS tracking',
    authType: 'csv_upload',
    syncFrequency: 'weekly',
  },
];

// Get integrations by category
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === category);
}

// Get connected integrations
export function getConnectedIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.status === 'connected');
}

// Get critical integrations that need to be connected
export function getCriticalIntegrations(): Integration[] {
  return INTEGRATIONS.filter((i) => i.priority === 'critical' && i.status !== 'connected');
}

// Calculate integration health score
export function calculateIntegrationHealth(): {
  score: number;
  connected: number;
  total: number;
  criticalMissing: string[];
} {
  const connected = INTEGRATIONS.filter((i) => i.status === 'connected').length;
  const total = INTEGRATIONS.length;
  const criticalMissing = INTEGRATIONS
    .filter((i) => i.priority === 'critical' && i.status !== 'connected')
    .map((i) => i.name);

  // Weight critical integrations more heavily
  const criticalConnected = INTEGRATIONS.filter(
    (i) => i.priority === 'critical' && i.status === 'connected'
  ).length;
  const criticalTotal = INTEGRATIONS.filter((i) => i.priority === 'critical').length;

  const baseScore = (connected / total) * 50;
  const criticalScore = (criticalConnected / criticalTotal) * 50;

  return {
    score: Math.round(baseScore + criticalScore),
    connected,
    total,
    criticalMissing,
  };
}

// Category display info
export const CATEGORY_INFO: Record<IntegrationCategory, { name: string; icon: string }> = {
  ecommerce: { name: 'E-commerce', icon: '🛍️' },
  advertising: { name: 'Advertising', icon: '📢' },
  analytics: { name: 'Analytics', icon: '📊' },
  finance: { name: 'Finance', icon: '💰' },
  customer: { name: 'Customer', icon: '👥' },
  retail: { name: 'Retail', icon: '🏪' },
  marketplace: { name: 'Marketplace', icon: '🛒' },
  social: { name: 'Social & PR', icon: '📱' },
  operations: { name: 'Operations', icon: '⚙️' },
};
