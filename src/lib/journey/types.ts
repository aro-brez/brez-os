/**
 * BREZ Customer Journey & Impact System
 *
 * The unified model that tracks:
 * - X-axis: Customer journey from first touch → lifelong advocate
 * - Y-axis: Marketing moments, campaigns, events that intersect the journey
 * - Impact: Correlation between activities and business outcomes
 */

// ============ CUSTOMER JOURNEY STAGES ============

/**
 * The 7 Universal Stages every customer passes through
 * (Kept minimal - all paths map to these stages)
 */
export type JourneyStage =
  | "awareness"      // First heard of BREZ
  | "consideration"  // Researching, comparing
  | "trial"          // First purchase / sample
  | "activation"     // Experienced the product
  | "retention"      // Repeat purchase / subscription
  | "advocacy"       // Referring others, reviewing
  | "expansion";     // Trying new products, increasing order size

export interface JourneyStageConfig {
  id: JourneyStage;
  name: string;
  description: string;
  keyMetrics: string[];
  targetConversion: number; // % who should move to next stage
  avgDaysInStage: number;
}

export const JOURNEY_STAGES: JourneyStageConfig[] = [
  {
    id: "awareness",
    name: "Awareness",
    description: "First discovers BREZ exists",
    keyMetrics: ["impressions", "reach", "brandSearches"],
    targetConversion: 0.05, // 5% move to consideration
    avgDaysInStage: 14,
  },
  {
    id: "consideration",
    name: "Consideration",
    description: "Actively researching, visited site",
    keyMetrics: ["siteVisits", "timeOnSite", "pagesViewed", "addToCart"],
    targetConversion: 0.15, // 15% convert to trial
    avgDaysInStage: 7,
  },
  {
    id: "trial",
    name: "Trial",
    description: "First purchase or sample received",
    keyMetrics: ["firstPurchase", "sampleReceived", "eventTrial"],
    targetConversion: 0.60, // 60% activate
    avgDaysInStage: 3,
  },
  {
    id: "activation",
    name: "Activation",
    description: "Consumed product, experienced effect",
    keyMetrics: ["productConsumed", "effectExperienced", "satisfaction"],
    targetConversion: 0.50, // 50% become repeat
    avgDaysInStage: 14,
  },
  {
    id: "retention",
    name: "Retention",
    description: "Repeat purchaser or subscriber",
    keyMetrics: ["repeatPurchases", "subscriptionActive", "ltv", "frequency"],
    targetConversion: 0.20, // 20% become advocates
    avgDaysInStage: 90,
  },
  {
    id: "advocacy",
    name: "Advocacy",
    description: "Actively recommending to others",
    keyMetrics: ["referrals", "reviews", "socialMentions", "nps"],
    targetConversion: 0.30, // 30% expand
    avgDaysInStage: 180,
  },
  {
    id: "expansion",
    name: "Expansion",
    description: "Trying new products, gifting, increasing volume",
    keyMetrics: ["skuDiversity", "giftPurchases", "orderSize", "frequency"],
    targetConversion: 1.0, // Stay here
    avgDaysInStage: 365,
  },
];

// ============ ENTRY POINTS (First Touch) ============

export type EntryChannel =
  | "paid_meta"
  | "paid_google"
  | "paid_tiktok"
  | "organic_social"
  | "organic_search"
  | "influencer"
  | "event_sampling"
  | "retail_discovery"
  | "referral"
  | "podcast"
  | "pr_press"
  | "direct";

export interface EntryPoint {
  id: string;
  channel: EntryChannel;
  campaign?: string;
  creative?: string;
  offer?: string;
  link: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// ============ MARKETING MOMENTS (Y-Axis) ============

export type MarketingMomentType =
  | "campaign"       // Planned marketing push
  | "event"          // Physical event / sampling
  | "product_launch" // New product release
  | "promotion"      // Sale / discount period
  | "content"        // Major content piece
  | "partnership"    // Brand collab / influencer
  | "pr"             // Press / media coverage
  | "seasonal";      // Holiday / seasonal moment

export interface MarketingMoment {
  id: string;
  type: MarketingMomentType;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  channels: EntryChannel[];
  targetStages: JourneyStage[];
  budget?: number;
  expectedReach?: number;
  offers?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============ EVENTS & SAMPLING (Cans in Hands) ============

export interface SamplingEvent {
  id: string;
  name: string;
  type: "festival" | "sports" | "retail" | "corporate" | "community" | "trade_show";
  location: string;
  date: string;

  // Core Metrics
  cansDistributed: number;
  costTotal: number; // All-in cost (product, staff, booth, travel)
  costPerCan: number; // Calculated: costTotal / cansDistributed

  // Reach & Quality
  estimatedReach: number; // People who saw/interacted
  emailsCollected: number;
  qrScans: number;
  socialMentions: number;

  // Tracking
  utmCampaign: string;
  promoCode?: string;

  // Impact Attribution (filled in later)
  attributedSales?: number;
  attributedNewCustomers?: number;
  attributedRetailVelocityLift?: number;
  roi?: number;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ IMPACT MEASUREMENT ============

export interface ImpactMetric {
  id: string;
  name: string;
  category: "acquisition" | "retention" | "revenue" | "efficiency" | "brand";
  unit: string;
  direction: "higher_better" | "lower_better";
  currentValue: number;
  previousValue: number;
  targetValue: number;
  measurementPeriod: "daily" | "weekly" | "monthly";
  lastUpdated: string;
}

export interface ImpactCorrelation {
  id: string;
  activityType: "event" | "campaign" | "change" | "goal_achieved";
  activityId: string;
  activityName: string;
  activityDate: string;

  // Measured Impact
  metrics: {
    metricId: string;
    metricName: string;
    beforeValue: number;
    afterValue: number;
    percentChange: number;
    confidence: "high" | "medium" | "low";
    attributionWindow: number; // days
  }[];

  // Calculated
  estimatedRevenueImpact: number;
  estimatedProfitImpact: number;

  notes?: string;
  createdAt: string;
}

// ============ CHANGE LOG ============

export type ChangeCategory =
  | "product"
  | "marketing"
  | "operations"
  | "team"
  | "technology"
  | "strategy"
  | "finance"
  | "retail";

export interface ChangeLogEntry {
  id: string;
  title: string;
  description: string;
  category: ChangeCategory;
  significance: "major" | "minor" | "routine";

  // What changed
  changedBy: string;
  department: string;
  relatedGoalId?: string;
  relatedTaskId?: string;

  // Business correlation
  expectedImpact: string;
  actualImpact?: string;
  impactCorrelations?: ImpactCorrelation[];

  // Timestamps
  changedAt: string;
  measuredAt?: string;

  // Learning
  lessonsLearned?: string;
  shouldRepeat?: boolean;
}

// ============ DATA CONTRIBUTION SYSTEM ============

export interface DataRequest {
  id: string;
  title: string;
  description: string;
  whyItMatters: string; // Explain the impact

  // Who should provide
  targetDepartment: string;
  targetUserId?: string;

  // What's needed
  dataType: "number" | "csv" | "text" | "date" | "selection";
  schema?: Record<string, string>; // For CSV
  options?: string[]; // For selection

  // Priority & Status
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "skipped";

  // Gamification
  xpReward: number;
  impactPreview: string; // What unlocks when provided

  // Tracking
  requestedAt: string;
  completedAt?: string;
  completedBy?: string;
}

export interface DataContribution {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  department: string;

  // The data
  dataType: DataRequest["dataType"];
  value: unknown;

  // Impact
  systemImprovements: string[]; // What got better
  insightsUnlocked: string[];
  xpAwarded: number;

  // Celebration
  celebrationMessage: string;

  contributedAt: string;
}

// ============ USER JOURNEY TRACKING ============

export interface CustomerJourneyRecord {
  id: string;
  customerId: string;
  email?: string;

  // Current state
  currentStage: JourneyStage;
  stageEnteredAt: string;

  // History
  stageHistory: {
    stage: JourneyStage;
    enteredAt: string;
    exitedAt?: string;
    touchpoints: string[];
  }[];

  // Entry
  entryPoint: EntryPoint;
  firstTouchDate: string;

  // Value
  totalSpend: number;
  orderCount: number;
  ltv: number;
  predictedLtv: number;

  // Engagement
  lastActivityDate: string;
  engagementScore: number; // 0-100
  churnRisk: "low" | "medium" | "high";

  // Attribution
  attributedCampaigns: string[];
  attributedEvents: string[];
}

// ============ COHORT MEASUREMENT ============

/**
 * Every change affects: Retail Velocity | DTC CM | Retention
 * We measure in cohorts to isolate impact.
 */

export type CohortDimension =
  | "event"           // Customers from specific event
  | "optimization"    // Before/after a change
  | "entry_channel"   // Meta vs TikTok vs Event vs Retail
  | "first_product"   // Drift vs Chill vs Elevate
  | "geography"       // Market/DMA
  | "url_path"        // Landing page / attribution
  | "offer_type"      // Discount vs full price
  | "date_range"      // Seasonal / time-based
  | "cac_tier";       // High vs low acquisition cost

export interface Cohort {
  id: string;
  name: string;
  dimension: CohortDimension;
  criteria: Record<string, string | number | boolean>;

  // Cohort size
  customerCount: number;
  createdAt: string;

  // The three universal metrics
  metrics: {
    // Retail Velocity impact
    retailVelocityBefore?: number;
    retailVelocityAfter?: number;
    retailVelocityChange?: number;

    // DTC Contribution Margin impact
    dtcCMBefore?: number;
    dtcCMAfter?: number;
    dtcCMChange?: number;

    // Retention impact
    day7Retention?: number;
    day30Retention?: number;
    day90Retention?: number;
    subscriptionConversion?: number;
    churnRate?: number;
  };

  // Attribution windows
  measurementPeriod: {
    start: string;
    end: string;
    windowDays: number;
  };

  // Learnings
  insight?: string;
  shouldRepeat?: boolean;
  confidenceLevel: "high" | "medium" | "low";
}

export interface OptimizationExperiment {
  id: string;
  name: string;
  description: string;
  type: "creative" | "landing_page" | "offer" | "product" | "targeting" | "channel" | "event";

  // What changed
  changeDescription: string;
  hypothesis: string;

  // Cohorts
  controlCohortId?: string;
  treatmentCohortId: string;

  // Timeline
  startedAt: string;
  endedAt?: string;
  status: "running" | "completed" | "paused" | "abandoned";

  // Results
  results?: {
    retailVelocityImpact: number;
    dtcCMImpact: number;
    retentionImpact: number;
    statisticalSignificance: number;
    recommendation: "scale" | "iterate" | "abandon";
  };

  // Learning
  learning?: string;
  addedToSupermind: boolean;
}

// ============ AGGREGATED JOURNEY VIEW ============

export interface JourneyStageMetrics {
  stage: JourneyStage;

  // Counts
  customersInStage: number;
  customersEnteredThisMonth: number;
  customersExitedThisMonth: number;

  // Conversion
  conversionToNextStage: number;
  avgDaysInStage: number;

  // Value
  avgLtv: number;
  totalRevenue: number;

  // By Entry Channel
  byChannel: Record<EntryChannel, {
    count: number;
    conversionRate: number;
    avgLtv: number;
  }>;
}

export interface JourneyMarketingMatrix {
  // X: Journey stages
  // Y: Marketing moments
  // Cell: Impact at intersection

  matrix: Record<JourneyStage, Record<string, {
    momentId: string;
    momentName: string;
    customersReached: number;
    conversionsGenerated: number;
    revenueAttributed: number;
  }>>;
}
