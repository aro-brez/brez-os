// =============================================================================
// BREZ DATA DISCOVERY ENGINE
// =============================================================================
// Auto-discovers the next best piece of data to collect from each team member.
// Prioritizes based on:
// 1. Impact on model accuracy
// 2. Staleness (how old is current data)
// 3. Dependencies (what data is needed first)
// 4. Current business priorities
//
// When Brittani uploads data, this engine recalculates and surfaces the NEXT
// most valuable piece of data to collect.
// =============================================================================

import {
  UPLOAD_ARCHIVE,
  getStalenessDays,
  needsUpdate,
  getCurrentData,
  type DataCategory,
  type TeamMember,
} from './data-memory';

// =============================================================================
// DATA REQUEST DEFINITIONS
// =============================================================================

export interface DataRequest {
  id: string;
  category: DataCategory;
  owner: TeamMember;
  title: string;
  description: string;
  format: string;
  example?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impactScore: number; // 0-100, how much this improves the model
  dependsOn: string[]; // Other request IDs that should be fulfilled first
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  currentStatus: 'missing' | 'stale' | 'current';
  lastFulfilled?: string;
  nextDueDate?: string;
}

// Master list of all possible data requests
export const ALL_DATA_REQUESTS: DataRequest[] = [
  // ===================
  // DAN (COO) - Highest Impact
  // ===================
  {
    id: 'dan_cash_flow_13week',
    category: 'cash_flow',
    owner: 'dan',
    title: '13-Week Cash Flow Forecast',
    description: 'Weekly cash in, cash out, ending balance for next 13 weeks. This is the backbone of the entire model.',
    format: 'Spreadsheet with columns: Week, Cash In, Cash Out, Ending Balance',
    example: 'Week 1: In $450K, Out $380K, End $370K',
    priority: 'critical',
    impactScore: 100,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'dan_production_payments',
    category: 'production',
    owner: 'dan',
    title: 'Production Payment Exact Dates',
    description: 'For each production run: exact date and amount for 50% deposit, exact date and amount for final payment.',
    format: 'List: Run Name, Deposit Date, Deposit $, Final Date, Final $',
    example: 'April Run: Deposit 4/1 $816K, Final 4/21 $816K',
    priority: 'critical',
    impactScore: 90,
    dependsOn: ['dan_cash_flow_13week'],
    frequency: 'monthly',
    currentStatus: 'missing',
  },
  {
    id: 'dan_inventory_burn',
    category: 'inventory',
    owner: 'dan',
    title: 'Weekly Inventory Burn by SKU',
    description: 'Actual units shipped per week for each SKU (last 4 weeks). Validates safety stock timing.',
    format: 'Table: SKU, Week 1 units, Week 2 units, Week 3 units, Week 4 units',
    priority: 'high',
    impactScore: 75,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'dan_ap_waterfall',
    category: 'ap_aging',
    owner: 'dan',
    title: 'AP Payment Waterfall',
    description: 'By vendor: scheduled payment dates, amounts, and running balance. Shows when AP pressure releases.',
    format: 'Table: Vendor, Current Balance, Payment Date 1, Amount 1, Payment Date 2, Amount 2...',
    priority: 'high',
    impactScore: 80,
    dependsOn: ['dan_cash_flow_13week'],
    frequency: 'weekly',
    currentStatus: 'missing',
  },

  // ===================
  // CRAMER (Finance)
  // ===================
  {
    id: 'cramer_weekly_cm',
    category: 'cm_dollars',
    owner: 'cramer',
    title: 'Weekly CM$ by Segment',
    description: 'Actual contribution margin DOLLARS (not %) broken out by: New Customer, Subscriber, Non-Sub Returning. Last 8 weeks.',
    format: 'Table: Week, New CM$, Sub CM$, NonSub CM$, Total CM$, Ad Spend, Net CM$',
    example: 'Jan 6: New $66K, Sub $125K, NonSub $68K, Total $259K, Spend $85K, Net $174K',
    priority: 'critical',
    impactScore: 95,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'cramer_cash_actual',
    category: 'cash_flow',
    owner: 'cramer',
    title: 'Weekly Cash Position Actual',
    description: 'Ending cash balance each Friday. Ground truth for model validation.',
    format: 'List: Date, Cash Balance',
    priority: 'high',
    impactScore: 70,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'cramer_dso_actual',
    category: 'ar_collections',
    owner: 'cramer',
    title: 'Current DSO (Days Sales Outstanding)',
    description: 'Actual days to collect retail AR. Model assumes 50 days - need validation.',
    format: 'Single number: Current DSO',
    priority: 'medium',
    impactScore: 50,
    dependsOn: [],
    frequency: 'monthly',
    currentStatus: 'missing',
  },

  // ===================
  // BRIAN (CRO - Retail)
  // ===================
  {
    id: 'brian_retailer_velocity',
    category: 'retail_velocity',
    owner: 'brian',
    title: 'Weekly Velocity by Retailer (8 weeks)',
    description: 'Top 10 retailers with weekly revenue for last 8 weeks. Shows trends, not just snapshot.',
    format: 'Table: Retailer, Week 1 $, Week 2 $, ... Week 8 $, Trend (up/down/flat)',
    priority: 'high',
    impactScore: 85,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'brian_alpha_scenarios',
    category: 'retail_velocity',
    owner: 'brian',
    title: 'LOW and HIGH Alpha Values',
    description: 'LOW = sell-thru scanner data only. HIGH = sell-thru + online wholesale tagged orders. Two numbers.',
    format: 'LOW alpha: X.XXX, HIGH alpha: X.XXX',
    example: 'LOW: 0.137, HIGH: 0.172',
    priority: 'critical',
    impactScore: 90,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'brian_q1_pipeline',
    category: 'retail_velocity',
    owner: 'brian',
    title: 'Q1 2026 Retail Order Pipeline',
    description: 'Expected orders by retailer for Jan/Feb/Mar. Forward visibility for cash planning.',
    format: 'Table: Retailer, Jan Expected $, Feb Expected $, Mar Expected $',
    priority: 'medium',
    impactScore: 60,
    dependsOn: ['brian_retailer_velocity'],
    frequency: 'monthly',
    currentStatus: 'missing',
  },

  // ===================
  // DAVID (Paid Ads)
  // ===================
  {
    id: 'david_platform_cac',
    category: 'dtc_ads',
    owner: 'david',
    title: 'Weekly CAC by Platform (8 weeks)',
    description: 'Meta, Google, AppLovin, TikTok: Spend + New Customers + CAC for last 8 weeks.',
    format: 'Table: Platform, Week, Spend, New Customers, CAC',
    priority: 'critical',
    impactScore: 90,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'david_daily_spend',
    category: 'dtc_ads',
    owner: 'david',
    title: 'Daily Spend Actuals (30 days)',
    description: 'Total spend by day for pacing against targets.',
    format: 'List: Date, Total Spend',
    priority: 'medium',
    impactScore: 50,
    dependsOn: [],
    frequency: 'weekly',
    currentStatus: 'missing',
  },
  {
    id: 'david_creative_performance',
    category: 'dtc_ads',
    owner: 'david',
    title: 'Top 5 / Bottom 5 Creatives by CAC',
    description: 'Which creatives are winning and losing. Optimization insights.',
    format: 'List: Creative Name, Spend, Customers, CAC, Status (Top/Bottom)',
    priority: 'low',
    impactScore: 30,
    dependsOn: ['david_platform_cac'],
    frequency: 'weekly',
    currentStatus: 'missing',
  },

  // ===================
  // NICK (Retention)
  // ===================
  {
    id: 'nick_cohort_curves',
    category: 'retention',
    owner: 'nick',
    title: 'Cohort Retention Curves',
    description: 'By acquisition month (Jan-Dec 2025): % retained at Month 1, 2, 3, 6, 12. Validates LTV assumptions.',
    format: 'Table: Cohort Month, M1%, M2%, M3%, M6%, M12%',
    example: 'Jan 2025: M1 85%, M2 72%, M3 65%, M6 52%, M12 41%',
    priority: 'critical',
    impactScore: 85,
    dependsOn: [],
    frequency: 'monthly',
    currentStatus: 'missing',
  },
  {
    id: 'nick_monthly_churn',
    category: 'retention',
    owner: 'nick',
    title: 'Monthly Subscription Churn Rate',
    description: 'Subscribers lost / Starting subscribers for each month.',
    format: 'List: Month, Starting Subs, Lost Subs, Churn Rate %',
    priority: 'high',
    impactScore: 75,
    dependsOn: [],
    frequency: 'monthly',
    currentStatus: 'missing',
  },
  {
    id: 'nick_repeat_frequency',
    category: 'retention',
    owner: 'nick',
    title: 'Repeat Purchase Frequency Distribution',
    description: 'How many customers purchased 1x, 2x, 3x, 4x+ times. Validates non-sub returning model.',
    format: 'Distribution: 1x: X%, 2x: X%, 3x: X%, 4x+: X%',
    priority: 'medium',
    impactScore: 55,
    dependsOn: ['nick_cohort_curves'],
    frequency: 'monthly',
    currentStatus: 'missing',
  },

  // ===================
  // TRAVIS (Product)
  // ===================
  {
    id: 'travis_sku_cogs',
    category: 'cogs',
    owner: 'travis',
    title: 'COGS by SKU',
    description: 'Full list of SKUs with current COGS per can and per 4-pack.',
    format: 'Table: SKU, Name, COGS/Can, COGS/4-Pack',
    priority: 'high',
    impactScore: 70,
    dependsOn: [],
    frequency: 'monthly',
    currentStatus: 'missing',
  },
  {
    id: 'travis_cogs_changes',
    category: 'cogs',
    owner: 'travis',
    title: 'Upcoming COGS Changes',
    description: 'Any cost changes coming: SKU, current cost, new cost, effective date.',
    format: 'List: SKU, Current $, New $, Effective Date, Reason',
    priority: 'medium',
    impactScore: 60,
    dependsOn: ['travis_sku_cogs'],
    frequency: 'monthly',
    currentStatus: 'missing',
  },
  {
    id: 'travis_regulatory_cost',
    category: 'cogs',
    owner: 'travis',
    title: 'Regulatory Reformulation Cost Estimate',
    description: 'Estimated COGS increase for 0.4mg THC compliant formulas. Nov 2026 deadline.',
    format: 'Estimated increase per can: $X.XX',
    priority: 'medium',
    impactScore: 55,
    dependsOn: [],
    frequency: 'once',
    currentStatus: 'missing',
  },
];

// =============================================================================
// DISCOVERY ENGINE
// =============================================================================

/**
 * Calculate current status of each data request
 */
function updateRequestStatuses(): void {
  for (const request of ALL_DATA_REQUESTS) {
    const currentData = getCurrentData(request.category);
    const staleDays = getStalenessDays(request.category);

    if (!currentData) {
      request.currentStatus = 'missing';
      request.lastFulfilled = undefined;
    } else if (needsUpdate(request.category)) {
      request.currentStatus = 'stale';
      request.lastFulfilled = currentData.uploadedAt;
    } else {
      request.currentStatus = 'current';
      request.lastFulfilled = currentData.uploadedAt;
    }

    // Calculate next due date
    if (request.frequency !== 'once') {
      const lastDate = request.lastFulfilled ? new Date(request.lastFulfilled) : new Date();
      const daysToAdd = request.frequency === 'daily' ? 1 : request.frequency === 'weekly' ? 7 : 30;
      const nextDue = new Date(lastDate);
      nextDue.setDate(nextDue.getDate() + daysToAdd);
      request.nextDueDate = nextDue.toISOString();
    }
  }
}

/**
 * Get the next best data request for a specific team member
 */
export function getNextRequestForMember(member: TeamMember): DataRequest | null {
  updateRequestStatuses();

  const memberRequests = ALL_DATA_REQUESTS.filter(r => r.owner === member);

  // Filter out requests with unfulfilled dependencies
  const availableRequests = memberRequests.filter(r => {
    if (r.currentStatus === 'current') return false; // Already have current data

    // Check dependencies
    for (const depId of r.dependsOn) {
      const dep = ALL_DATA_REQUESTS.find(d => d.id === depId);
      if (dep && dep.currentStatus !== 'current') {
        return false; // Dependency not fulfilled
      }
    }
    return true;
  });

  if (availableRequests.length === 0) return null;

  // Sort by priority then impact score
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  availableRequests.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impactScore - a.impactScore;
  });

  return availableRequests[0];
}

/**
 * Get all pending requests for a team member, sorted by priority
 */
export function getAllRequestsForMember(member: TeamMember): DataRequest[] {
  updateRequestStatuses();

  return ALL_DATA_REQUESTS
    .filter(r => r.owner === member)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusOrder = { missing: 0, stale: 1, current: 2 };

      const statusDiff = statusOrder[a.currentStatus] - statusOrder[b.currentStatus];
      if (statusDiff !== 0) return statusDiff;

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return b.impactScore - a.impactScore;
    });
}

/**
 * Get the single highest-impact data request across all team members
 */
export function getHighestImpactRequest(): DataRequest | null {
  updateRequestStatuses();

  const pending = ALL_DATA_REQUESTS.filter(r => r.currentStatus !== 'current');

  if (pending.length === 0) return null;

  // Check dependencies and sort
  const available = pending.filter(r => {
    for (const depId of r.dependsOn) {
      const dep = ALL_DATA_REQUESTS.find(d => d.id === depId);
      if (dep && dep.currentStatus !== 'current') return false;
    }
    return true;
  });

  if (available.length === 0) return pending[0]; // Return first pending even if deps not met

  return available.sort((a, b) => b.impactScore - a.impactScore)[0];
}

/**
 * Get Brittani's priority queue - what to collect next from each person
 */
export function getBrittaniQueue(): { member: TeamMember; memberName: string; request: DataRequest }[] {
  const members: { id: TeamMember; name: string }[] = [
    { id: 'dan', name: 'Dan (COO)' },
    { id: 'cramer', name: 'Cramer (Finance)' },
    { id: 'brian', name: 'Brian (CRO/Retail)' },
    { id: 'david', name: 'David (Ads)' },
    { id: 'nick', name: 'Nick (Retention)' },
    { id: 'travis', name: 'Travis (Product)' },
  ];

  const queue: { member: TeamMember; memberName: string; request: DataRequest }[] = [];

  for (const m of members) {
    const nextRequest = getNextRequestForMember(m.id);
    if (nextRequest) {
      queue.push({ member: m.id, memberName: m.name, request: nextRequest });
    }
  }

  // Sort by request priority and impact
  queue.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.request.priority] - priorityOrder[b.request.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.request.impactScore - a.request.impactScore;
  });

  return queue;
}

/**
 * Get overall data collection progress
 */
export function getDataCollectionProgress(): {
  total: number;
  current: number;
  stale: number;
  missing: number;
  percentComplete: number;
  topPriorities: DataRequest[];
} {
  updateRequestStatuses();

  const current = ALL_DATA_REQUESTS.filter(r => r.currentStatus === 'current').length;
  const stale = ALL_DATA_REQUESTS.filter(r => r.currentStatus === 'stale').length;
  const missing = ALL_DATA_REQUESTS.filter(r => r.currentStatus === 'missing').length;
  const total = ALL_DATA_REQUESTS.length;

  const topPriorities = ALL_DATA_REQUESTS
    .filter(r => r.currentStatus !== 'current')
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5);

  return {
    total,
    current,
    stale,
    missing,
    percentComplete: Math.round((current / total) * 100),
    topPriorities,
  };
}

// =============================================================================
// FORMATTED OUTPUT FOR BRITTANI
// =============================================================================

export function generateBrittaniReport(): string {
  const queue = getBrittaniQueue();
  const progress = getDataCollectionProgress();

  let report = `
══════════════════════════════════════════════════════════════
BRITTANI'S DATA COLLECTION QUEUE
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
══════════════════════════════════════════════════════════════

PROGRESS: ${progress.percentComplete}% Complete
├── Current: ${progress.current}/${progress.total} data points
├── Stale: ${progress.stale} (need refresh)
└── Missing: ${progress.missing} (never collected)

══════════════════════════════════════════════════════════════
NEXT DATA TO COLLECT FROM EACH TEAM MEMBER
══════════════════════════════════════════════════════════════
`;

  for (const item of queue) {
    const r = item.request;
    report += `
┌─ ${item.memberName.toUpperCase()}
│  Priority: ${r.priority.toUpperCase()} | Impact: ${r.impactScore}/100
│
│  📋 ${r.title}
│  ${r.description}
│
│  Format: ${r.format}
${r.example ? `│  Example: ${r.example}` : ''}
│
│  Status: ${r.currentStatus.toUpperCase()}${r.lastFulfilled ? ` (last: ${new Date(r.lastFulfilled).toLocaleDateString()})` : ''}
└──────────────────────────────────────────────────────────────
`;
  }

  report += `
══════════════════════════════════════════════════════════════
TOP 5 HIGHEST IMPACT DATA POINTS MISSING
══════════════════════════════════════════════════════════════
`;

  for (let i = 0; i < progress.topPriorities.length; i++) {
    const r = progress.topPriorities[i];
    const owner = r.owner.charAt(0).toUpperCase() + r.owner.slice(1);
    report += `${i + 1}. [${r.impactScore}] ${r.title} (from ${owner})
`;
  }

  return report;
}
