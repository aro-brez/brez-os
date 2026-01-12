/**
 * BREZ Supermind Intelligence Layer
 * This connects the real BREZ data from source-of-truth to actionable recommendations
 * Following the governance rules from CLAUDE.md
 */

import {
  VALIDATED_METRICS,
  UNIT_ECONOMICS,
  CASH_POSITION,
  AP_VENDORS,
  GROWTH_GENERATOR,
  CURRENT_STATE,
  REGULATORY_TIMELINE,
  DECISIONS_NEEDED,
} from '../data/source-of-truth';

// Types for the intelligence layer
export interface SpecificAction {
  id: string;
  action: string;
  steps: string[];
  owner: string;
  department: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  timeEstimate: string;
  metric: string;
  deadline?: string;
  noGateStatus: 'pass' | 'flag' | 'block';
  growthGeneratorStep?: number;
  xpReward: number;
}

export interface DataHealth {
  category: string;
  status: 'fresh' | 'stale' | 'missing';
  lastUpdated?: string;
  freshness: number; // 0-100
  priority: number;
  howToUpdate: string;
  xpReward: number;
}

export interface WeeklyGovernanceCheck {
  question: string;
  currentValue: string | number;
  status: 'good' | 'warning' | 'critical';
  action?: string;
}

/**
 * Get the ONE most important action for Aaron right now
 * Based on governance rules, current phase (STABILIZE), and real data
 */
export function getTheOneThing(): SpecificAction {
  // Check NO-gate triggers in order of priority

  // 1. Cash reserve floor check ($300k minimum)
  if (CASH_POSITION.cashOnHand < CASH_POSITION.minimumReserve) {
    return {
      id: 'cash-crisis',
      action: `URGENT: Cash below $300k floor - currently at $${(CASH_POSITION.cashOnHand / 1000).toFixed(0)}k`,
      steps: [
        '1. Call Dan immediately to confirm exact cash position',
        '2. Review which AP payments can be deferred 7 days',
        '3. Check AR - any invoices that can be collected early?',
        '4. If still short, reduce ad spend to $150k this week',
      ],
      owner: 'Aaron + Dan',
      department: 'finance',
      urgency: 'critical',
      timeEstimate: '30 min',
      metric: 'Cash > $300k',
      noGateStatus: 'block',
      xpReward: 500,
    };
  }

  // 2. AP vendor at stop-ship risk
  const stopShipVendors = AP_VENDORS.filter(v => v.riskLevel === 'stop-ship' && v.status === 'negotiating');
  if (stopShipVendors.length > 0) {
    const vendor = stopShipVendors[0];
    return {
      id: `vendor-${vendor.name.toLowerCase().replace(/\s+/g, '-')}`,
      action: `Resolve ${vendor.name} - STOP-SHIP RISK ($${(vendor.balance / 1000).toFixed(0)}k owed)`,
      steps: [
        `1. Call ${vendor.contact || vendor.name} to discuss payment options`,
        '2. Present Option 1 (full cash) or Option 2 (conversion) per AP playbook',
        '3. Get commitment in writing within 48 hours',
        '4. Log decision in Decision Log with owner and deadline',
      ],
      owner: 'Dan + Abla',
      department: 'operations',
      urgency: 'critical',
      timeEstimate: '1 hour',
      metric: 'Vendor selects payment lane',
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      noGateStatus: 'flag',
      xpReward: 300,
    };
  }

  // 3. CAC payback exceeds threshold (4 months for Stabilize)
  const currentCAC = GROWTH_GENERATOR.currentMetrics.cac;
  const maxPaybackMonths = 4; // Stabilize phase
  const paybackMonths = currentCAC / (UNIT_ECONOMICS.margins.dtc.contributionMarginTarget * 50); // Rough calculation

  if (paybackMonths > maxPaybackMonths) {
    return {
      id: 'cac-throttle',
      action: `CAC payback at ${paybackMonths.toFixed(1)} months - exceeds ${maxPaybackMonths} month threshold`,
      steps: [
        '1. Review last 7 days of Meta/TikTok campaign performance',
        '2. Pause bottom 20% performing ad sets immediately',
        '3. Reduce weekly spend cap by 10% (from $45k to ~$40k)',
        '4. Schedule creative refresh with Andrew for next week',
      ],
      owner: 'Al Huynh',
      department: 'growth',
      urgency: 'high',
      timeEstimate: '45 min',
      metric: 'CAC payback < 4 months',
      noGateStatus: 'flag',
      growthGeneratorStep: 1,
      xpReward: 200,
    };
  }

  // 4. Decisions overdue (from governance)
  const overdueDecisions = DECISIONS_NEEDED.filter(d => {
    if (!d.deadline) return false;
    return new Date(d.deadline) < new Date();
  });

  if (overdueDecisions.length > 0) {
    const decision = overdueDecisions[0];
    return {
      id: `decision-${decision.id}`,
      action: `OVERDUE: ${decision.title} - decision needed NOW`,
      steps: [
        `1. Review context: ${decision.context}`,
        `2. Get data needed from ${decision.owner}`,
        '3. Make decision or accept default action',
        '4. Log in Decision Log with success metric',
      ],
      owner: decision.owner,
      department: decision.department,
      urgency: 'high',
      timeEstimate: '20 min',
      metric: 'Decision logged',
      noGateStatus: 'flag',
      xpReward: 150,
    };
  }

  // 5. Default: Highest leverage action for Stabilize phase
  return {
    id: 'stabilize-focus',
    action: 'Review this week\'s contribution margin vs target',
    steps: [
      '1. Pull DTC CM from Shopify/Triple Whale (should be >35%)',
      '2. Pull Retail CM from latest velocity report',
      '3. Compare to last week - are we trending up?',
      '4. If CM < 35%, identify the top cost drag and create task to fix',
    ],
    owner: 'Abla Jad',
    department: 'finance',
    urgency: 'medium',
    timeEstimate: '30 min',
    metric: 'DTC CM > 35%',
    noGateStatus: 'pass',
    growthGeneratorStep: 1,
    xpReward: 100,
  };
}

/**
 * Get specific actions based on current phase and role
 */
export function getActionsForRole(role: string): SpecificAction[] {
  const actions: SpecificAction[] = [];
  const theOneThing = getTheOneThing();
  actions.push(theOneThing);

  // Add role-specific actions
  if (role === 'exec' || role === 'ceo') {
    // Check for WIP limit violation (Aaron kryptonite)
    if (CURRENT_STATE.activePriorities.length > 3) {
      actions.push({
        id: 'wip-limit',
        action: `WIP LIMIT EXCEEDED: ${CURRENT_STATE.activePriorities.length} active priorities (max 3)`,
        steps: [
          '1. Review current priorities list',
          '2. Pick the ONE that moves the needle most',
          '3. Explicitly PAUSE or DELEGATE the others',
          '4. Update the priorities list to reflect decision',
        ],
        owner: 'Aaron',
        department: 'exec',
        urgency: 'high',
        timeEstimate: '15 min',
        metric: 'Active priorities ≤ 3',
        noGateStatus: 'flag',
        xpReward: 100,
      });
    }
  }

  // Add regulatory check if approaching deadline
  const monthsUntilRegDeadline = Math.floor(
    (new Date('2026-11-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (monthsUntilRegDeadline <= 12 && !REGULATORY_TIMELINE.phase1.completed) {
    actions.push({
      id: 'regulatory-prep',
      action: `Regulatory deadline in ${monthsUntilRegDeadline} months - Phase 1 not started`,
      steps: [
        '1. Schedule meeting with Travis to review compliant formulations',
        '2. Identify top 3 formulation candidates (no cash spend yet)',
        '3. Create timeline for bench testing by April',
        '4. Flag to Andrea for compliance review',
      ],
      owner: 'Travis Duncan',
      department: 'product',
      urgency: 'medium',
      timeEstimate: '1 hour',
      metric: 'Phase 1a: Candidates identified',
      deadline: '2026-02-28',
      noGateStatus: 'pass',
      xpReward: 150,
    });
  }

  return actions;
}

/**
 * Get data health status - what data is missing or stale?
 */
export function getDataHealth(): DataHealth[] {
  const now = new Date();
  const health: DataHealth[] = [];

  // Cash position freshness
  const cashLastUpdated = CURRENT_STATE.lastUpdated?.cash;
  const cashAge = cashLastUpdated
    ? Math.floor((now.getTime() - new Date(cashLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  health.push({
    category: 'Cash Position',
    status: cashAge < 1 ? 'fresh' : cashAge < 3 ? 'stale' : 'missing',
    lastUpdated: cashLastUpdated,
    freshness: Math.max(0, 100 - cashAge * 15),
    priority: 1,
    howToUpdate: 'Check QuickBooks or ask Abla for daily cash report',
    xpReward: cashAge >= 3 ? 50 : 0,
  });

  // DTC metrics freshness
  const dtcLastUpdated = CURRENT_STATE.lastUpdated?.dtcMetrics;
  const dtcAge = dtcLastUpdated
    ? Math.floor((now.getTime() - new Date(dtcLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  health.push({
    category: 'DTC Metrics (CAC, CM, ROAS)',
    status: dtcAge < 7 ? 'fresh' : dtcAge < 14 ? 'stale' : 'missing',
    lastUpdated: dtcLastUpdated,
    freshness: Math.max(0, 100 - dtcAge * 5),
    priority: 2,
    howToUpdate: 'Export from Triple Whale or Shopify Analytics',
    xpReward: dtcAge >= 7 ? 75 : 0,
  });

  // Retail velocity
  const retailLastUpdated = CURRENT_STATE.lastUpdated?.retailVelocity;
  const retailAge = retailLastUpdated
    ? Math.floor((now.getTime() - new Date(retailLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  health.push({
    category: 'Retail Velocity',
    status: retailAge < 7 ? 'fresh' : retailAge < 21 ? 'stale' : 'missing',
    lastUpdated: retailLastUpdated,
    freshness: Math.max(0, 100 - retailAge * 3),
    priority: 3,
    howToUpdate: 'Get weekly velocity report from Niall',
    xpReward: retailAge >= 7 ? 50 : 0,
  });

  // AP aging
  const apLastUpdated = CURRENT_STATE.lastUpdated?.apAging;
  const apAge = apLastUpdated
    ? Math.floor((now.getTime() - new Date(apLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  health.push({
    category: 'AP Vendor Status',
    status: apAge < 7 ? 'fresh' : apAge < 14 ? 'stale' : 'missing',
    lastUpdated: apLastUpdated,
    freshness: Math.max(0, 100 - apAge * 5),
    priority: 2,
    howToUpdate: 'Update vendor statuses in AP tracker with Dan',
    xpReward: apAge >= 7 ? 100 : 0,
  });

  return health.sort((a, b) => {
    // Sort by: missing first, then stale, then fresh; within that by priority
    const statusOrder = { missing: 0, stale: 1, fresh: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.priority - b.priority;
  });
}

/**
 * Weekly governance check questions
 */
export function getWeeklyGovernanceCheck(): WeeklyGovernanceCheck[] {
  return [
    {
      question: 'Are there any overdue decisions?',
      currentValue: DECISIONS_NEEDED.filter(d => d.deadline && new Date(d.deadline) < new Date()).length,
      status: DECISIONS_NEEDED.filter(d => d.deadline && new Date(d.deadline) < new Date()).length === 0 ? 'good' : 'critical',
      action: 'Review Decision Log and apply defaults or decide',
    },
    {
      question: 'Does current CAC payback exceed the scenario threshold?',
      currentValue: `${(GROWTH_GENERATOR.currentMetrics.cac / 15).toFixed(1)} months`,
      status: GROWTH_GENERATOR.currentMetrics.cac / 15 <= 4 ? 'good' : 'warning',
      action: 'Throttle spend if payback > 4 months',
    },
    {
      question: 'Are any actions flagged by the NO-gate this week?',
      currentValue: 'Check pending decisions',
      status: 'good',
    },
    {
      question: "What's the cash position vs reserve floor?",
      currentValue: `$${(CASH_POSITION.cashOnHand / 1000).toFixed(0)}k vs $300k floor`,
      status: CASH_POSITION.cashOnHand >= CASH_POSITION.minimumReserve ? 'good' : 'critical',
      action: CASH_POSITION.cashOnHand < CASH_POSITION.minimumReserve ? 'IMMEDIATE: Reduce spend or accelerate AR' : undefined,
    },
    {
      question: 'Which scenario are we in? Any trigger changes?',
      currentValue: CURRENT_STATE.currentScenario.toUpperCase(),
      status: CURRENT_STATE.currentScenario === 'stabilize' ? 'warning' : 'good',
      action: 'Review Thrive exit criteria progress',
    },
  ];
}

/**
 * Calculate total XP available from data updates
 */
export function getAvailableXP(): { total: number; breakdown: { category: string; xp: number }[] } {
  const health = getDataHealth();
  const breakdown = health
    .filter(h => h.xpReward > 0)
    .map(h => ({ category: h.category, xp: h.xpReward }));

  return {
    total: breakdown.reduce((sum, b) => sum + b.xp, 0),
    breakdown,
  };
}

/**
 * Get real BREZ metrics for dashboard
 */
export function getRealMetrics() {
  return {
    cash: {
      onHand: CASH_POSITION.cashOnHand,
      floor: CASH_POSITION.minimumReserve,
      runway: Math.floor(CASH_POSITION.cashOnHand / (CASH_POSITION.weeklyFixedOpex.totalMonthly / 4.33)),
      status: CASH_POSITION.cashOnHand >= CASH_POSITION.minimumReserve ? 'healthy' : 'critical',
    },
    dtc: {
      contributionMargin: GROWTH_GENERATOR.currentMetrics.dtcCM,
      target: 0.35,
      cac: GROWTH_GENERATOR.currentMetrics.cac,
      maxCAC: 65, // Stabilize phase
      subConversion: UNIT_ECONOMICS.subscription.conversionRate,
    },
    retail: {
      alpha: VALIDATED_METRICS.alpha,
      velocity2025: VALIDATED_METRICS.revenue2025.sellThrough,
      doors: 2103, // Peak doors from metrics
    },
    ap: {
      total: AP_VENDORS.reduce((sum, v) => sum + v.balance, 0),
      stopShipRisks: AP_VENDORS.filter(v => v.riskLevel === 'stop-ship').length,
      onPaymentPlan: AP_VENDORS.filter(v => v.status === 'payment-plan').length,
    },
    scenario: CURRENT_STATE.currentScenario,
    phase: 'Stabilize', // Current phase
  };
}
