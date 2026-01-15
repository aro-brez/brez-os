/**
 * SEED Adapter — Data transformation layer
 * Bridges BREZ OS UnifiedMetrics to SEED Learning Engine BusinessDecision format
 */

import type { UnifiedMetrics, DynamicAction } from '@/lib/integrations/unified';

// Re-export types from seed-integration for convenience
export interface BusinessContext {
  currentMetrics: {
    cac?: number;
    ltv?: number;
    conversionRate?: number;
    retentionRate?: number;
    contributionMargin?: number;
    cashPosition?: number;
  };
  constraints: {
    phase: 'STABILIZE' | 'THRIVE' | 'SCALE';
    bottleneck: string;
    budgetLimit?: number;
  };
  historicalData: any;
}

export type DecisionType = 'cac_optimization' | 'spend_allocation' | 'product_launch' | 'retail_expansion' | 'pricing';

/**
 * Transform UnifiedMetrics to BusinessDecision context
 */
export function unifiedMetricsToBusinessContext(metrics: UnifiedMetrics): BusinessContext {
  // Calculate LTV estimate from subscription data
  const estimatedLTV = calculateLTV(metrics);

  // Calculate retention rate from subscription churn
  const retentionRate = metrics.subscriptions.churnRate
    ? (1 - metrics.subscriptions.churnRate / 100)
    : undefined;

  return {
    currentMetrics: {
      cac: metrics.dtc.cac,
      ltv: estimatedLTV,
      conversionRate: metrics.dtc.conversionRate,
      retentionRate,
      contributionMargin: metrics.dtc.contributionMargin,
      cashPosition: metrics.cash.balance,
    },
    constraints: {
      phase: determinePhase(metrics),
      bottleneck: determinePrimaryBottleneck(metrics),
      budgetLimit: calculateBudgetLimit(metrics),
    },
    historicalData: {
      // For now, empty — will be populated as we track outcomes
      lastUpdated: metrics.lastUpdated,
      sources: metrics.sources,
    },
  };
}

/**
 * Determine current business phase based on metrics
 */
function determinePhase(metrics: UnifiedMetrics): 'STABILIZE' | 'THRIVE' | 'SCALE' {
  // STABILIZE if cash is critical or at watch level
  if (metrics.cash.status === 'critical' || metrics.cash.status === 'watch') {
    return 'STABILIZE';
  }

  // STABILIZE if high AP risk
  if (metrics.ap.stopShipRisks > 0 || metrics.ap.critical > 100000) {
    return 'STABILIZE';
  }

  // THRIVE if healthy cash and growing
  if (metrics.cash.status === 'healthy' && metrics.revenue.trend === 'up') {
    return 'THRIVE';
  }

  // Default to STABILIZE (conservative)
  return 'STABILIZE';
}

/**
 * Determine primary bottleneck (from BREZ OS bottleneck stack)
 * Priority order: CASH → DEMAND → CLARITY → FOCUS → TEAM → SUPPLY → COMPLIANCE
 */
export function determinePrimaryBottleneck(metrics: UnifiedMetrics): string {
  // #1 CASH - if below floor or in critical state
  if (metrics.cash.status === 'critical' || metrics.cash.balance < metrics.cash.floor) {
    return 'CASH';
  }

  // #1 CASH - if runway < 8 weeks
  if (metrics.cash.runway < 8) {
    return 'CASH';
  }

  // #2 DEMAND - if revenue trend is down or flat
  if (metrics.revenue.trend === 'down' || metrics.revenue.trend === 'flat') {
    return 'DEMAND';
  }

  // #2 DEMAND - if CAC is too high relative to contribution margin
  if (metrics.dtc.cac > 0 && metrics.dtc.contributionMargin > 0) {
    const paybackMonths = metrics.dtc.cac / metrics.dtc.contributionMargin;
    if (paybackMonths > 4) {
      return 'DEMAND';
    }
  }

  // #3 FOCUS - if multiple data sources disconnected (signals lack of clarity)
  const disconnectedSources = Object.values(metrics.sources).filter(s => !s.connected).length;
  if (disconnectedSources >= 2) {
    return 'CLARITY';
  }

  // Default to DEMAND if cash is healthy (always optimizing growth)
  return 'DEMAND';
}

/**
 * Calculate budget limit based on cash position and phase
 */
function calculateBudgetLimit(metrics: UnifiedMetrics): number {
  const phase = determinePhase(metrics);

  if (phase === 'STABILIZE') {
    // Conservative: 10% of cash above floor
    const cashAboveFloor = Math.max(0, metrics.cash.balance - metrics.cash.floor);
    return cashAboveFloor * 0.1;
  }

  if (phase === 'THRIVE') {
    // Moderate: 20% of cash above floor
    const cashAboveFloor = Math.max(0, metrics.cash.balance - metrics.cash.floor);
    return cashAboveFloor * 0.2;
  }

  // SCALE: 30% of cash above floor
  const cashAboveFloor = Math.max(0, metrics.cash.balance - metrics.cash.floor);
  return cashAboveFloor * 0.3;
}

/**
 * Estimate LTV from subscription data
 */
function calculateLTV(metrics: UnifiedMetrics): number {
  if (!metrics.subscriptions.active || metrics.subscriptions.active === 0) {
    return 0;
  }

  // Simple LTV estimate: (AOV * CM) / churnRate
  // If churn is 5%/month, customer lifetime is 1/0.05 = 20 months
  const churnRate = metrics.subscriptions.churnRate || 5; // default 5%
  const avgLifetimeMonths = 100 / churnRate;
  const monthlyValue = metrics.dtc.aov * (metrics.dtc.contributionMargin / 100);

  return monthlyValue * avgLifetimeMonths;
}

/**
 * Infer decision type from current metrics and bottleneck
 */
export function inferDecisionType(metrics: UnifiedMetrics): DecisionType {
  const bottleneck = determinePrimaryBottleneck(metrics);

  // Cash bottleneck → spend allocation decisions
  if (bottleneck === 'CASH') {
    return 'spend_allocation';
  }

  // Demand bottleneck → CAC optimization or retail expansion
  if (bottleneck === 'DEMAND') {
    // If high CAC, optimize it
    if (metrics.dtc.cac > 60) {
      return 'cac_optimization';
    }
    // Otherwise consider retail expansion
    return 'retail_expansion';
  }

  // Default to CAC optimization (most common)
  return 'cac_optimization';
}

/**
 * Generate decision options based on type and context
 * These options will be scored by SEED Learning Engine
 */
export function generateOptionsForDecision(
  type: DecisionType,
  context: BusinessContext
): any[] {
  switch (type) {
    case 'cac_optimization':
      return generateCACOptions(context);

    case 'spend_allocation':
      return generateSpendOptions(context);

    case 'retail_expansion':
      return generateRetailOptions(context);

    case 'product_launch':
      return generateProductOptions(context);

    case 'pricing':
      return generatePricingOptions(context);

    default:
      return [];
  }
}

/**
 * Generate CAC optimization options
 */
function generateCACOptions(context: BusinessContext): any[] {
  const currentCAC = context.currentMetrics.cac || 60;

  return [
    {
      action: 'increase_spend',
      description: 'Scale spend to test volume elasticity',
      impact: 0.7,
      feasibility: 0.8,
      discoveryPotential: 0.6,
      expectedCAC: currentCAC * 1.1,
      expectedRevenue: 1.3,
      risk: 'CAC may increase with volume',
    },
    {
      action: 'optimize_creative',
      description: 'Test new creative angles and messaging',
      impact: 0.8,
      feasibility: 0.9,
      discoveryPotential: 0.9,
      expectedCAC: currentCAC * 0.85,
      expectedRevenue: 1.15,
      risk: 'Creative testing takes time to validate',
    },
    {
      action: 'reallocate_channels',
      description: 'Shift budget to better-performing channels',
      impact: 0.6,
      feasibility: 0.9,
      discoveryPotential: 0.5,
      expectedCAC: currentCAC * 0.9,
      expectedRevenue: 1.1,
      risk: 'May lose volume in shifted channels',
    },
    {
      action: 'optimize_landing_pages',
      description: 'Improve conversion rate on landing pages',
      impact: 0.9,
      feasibility: 0.7,
      discoveryPotential: 0.7,
      expectedCAC: currentCAC * 0.8,
      expectedRevenue: 1.2,
      risk: 'Requires design/dev resources',
    },
  ];
}

/**
 * Generate spend allocation options (cash-constrained)
 */
function generateSpendOptions(context: BusinessContext): any[] {
  const budgetLimit = context.constraints.budgetLimit || 50000;

  return [
    {
      action: 'reduce_spend',
      description: 'Cut ad spend to preserve cash',
      impact: 0.5,
      feasibility: 1.0,
      discoveryPotential: 0.2,
      savingsPotential: budgetLimit * 0.3,
      revenueImpact: -0.2,
      risk: 'Lose momentum and market share',
    },
    {
      action: 'maintain_efficient_spend',
      description: 'Keep spend at current CAC, no scaling',
      impact: 0.7,
      feasibility: 0.9,
      discoveryPotential: 0.4,
      savingsPotential: 0,
      revenueImpact: 0,
      risk: 'No growth acceleration',
    },
    {
      action: 'reallocate_to_retention',
      description: 'Shift budget from acquisition to retention',
      impact: 0.8,
      feasibility: 0.8,
      discoveryPotential: 0.7,
      savingsPotential: budgetLimit * 0.1,
      revenueImpact: 0.15,
      risk: 'Lower new customer volume',
    },
  ];
}

/**
 * Generate retail expansion options
 */
function generateRetailOptions(context: BusinessContext): any[] {
  return [
    {
      action: 'expand_doors',
      description: 'Add new retail doors in validated markets',
      impact: 0.8,
      feasibility: 0.6,
      discoveryPotential: 0.5,
      expectedRevenue: 1.4,
      cashTiming: '8-week lag',
      risk: 'Inventory and cash timing pressure',
    },
    {
      action: 'optimize_existing',
      description: 'Improve velocity in current doors',
      impact: 0.7,
      feasibility: 0.9,
      discoveryPotential: 0.6,
      expectedRevenue: 1.2,
      cashTiming: '4-week lag',
      risk: 'Requires field marketing investment',
    },
    {
      action: 'exit_low_performers',
      description: 'Cut underperforming retail accounts',
      impact: 0.6,
      feasibility: 0.8,
      discoveryPotential: 0.3,
      expectedRevenue: 0.95,
      cashTiming: 'immediate',
      risk: 'Relationship damage, brand perception',
    },
  ];
}

/**
 * Generate product launch options
 */
function generateProductOptions(context: BusinessContext): any[] {
  return [
    {
      action: 'launch_new_sku',
      description: 'Introduce new product variant',
      impact: 0.9,
      feasibility: 0.5,
      discoveryPotential: 0.8,
      expectedRevenue: 1.5,
      timeToMarket: '12 weeks',
      risk: 'Inventory complexity, formulation risk',
    },
    {
      action: 'optimize_existing_sku',
      description: 'Improve current product performance',
      impact: 0.7,
      feasibility: 0.9,
      discoveryPotential: 0.6,
      expectedRevenue: 1.15,
      timeToMarket: '4 weeks',
      risk: 'Lower upside potential',
    },
    {
      action: 'rationalize_skus',
      description: 'Cut underperforming SKUs to simplify',
      impact: 0.8,
      feasibility: 0.8,
      discoveryPotential: 0.4,
      expectedRevenue: 0.98,
      timeToMarket: '2 weeks',
      risk: 'Lose niche customers',
    },
  ];
}

/**
 * Generate pricing options
 */
function generatePricingOptions(context: BusinessContext): any[] {
  const currentAOV = context.currentMetrics.contributionMargin || 30;

  return [
    {
      action: 'increase_price',
      description: 'Raise price to improve margin',
      impact: 0.7,
      feasibility: 0.7,
      discoveryPotential: 0.5,
      expectedMargin: currentAOV * 1.15,
      volumeImpact: -0.1,
      risk: 'Price sensitivity, competitive pressure',
    },
    {
      action: 'bundle_pricing',
      description: 'Create bundles to increase AOV',
      impact: 0.8,
      feasibility: 0.8,
      discoveryPotential: 0.7,
      expectedMargin: currentAOV * 1.2,
      volumeImpact: 0.05,
      risk: 'Inventory complexity',
    },
    {
      action: 'subscription_discount',
      description: 'Offer discount for subscription to lock in LTV',
      impact: 0.9,
      feasibility: 0.9,
      discoveryPotential: 0.6,
      expectedMargin: currentAOV * 0.95,
      volumeImpact: 0.2,
      risk: 'Lower immediate margin',
    },
  ];
}

/**
 * Convert SEED decision result to DynamicAction format
 * Used when SEED provides the recommendation
 */
export function seedDecisionToDynamicAction(
  decision: any,
  confidence: number,
  reasoning: string,
  type: DecisionType
): DynamicAction {
  return {
    action: formatActionTitle(decision.action, decision.description),
    why: reasoning,
    steps: generateStepsForAction(decision, type),
    impact: estimateImpactDescription(decision),
    urgency: determineUrgency(confidence, decision),
    dataSource: 'SEED Learning Engine',
    confidence,
  };
}

/**
 * Format action title for display
 */
function formatActionTitle(action: string, description: string): string {
  // Convert snake_case to Title Case
  const title = action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${title}: ${description}`;
}

/**
 * Generate action steps based on decision and type
 */
function generateStepsForAction(decision: any, type: DecisionType): string[] {
  // Default steps based on action type
  const baseSteps: Record<string, string[]> = {
    increase_spend: [
      'Review current CAC and payback period',
      'Identify best-performing channels for scaling',
      'Set spend increase target (suggest 20-30%)',
      'Monitor CAC daily for 7 days',
      'Adjust if CAC exceeds acceptable threshold',
    ],
    optimize_creative: [
      'Analyze top-performing creative from last 30 days',
      'Brief creative team on new angle/messaging',
      'Produce 3-5 new creative variants',
      'Launch A/B test with 20% budget allocation',
      'Scale winning creative after 7-day validation',
    ],
    reallocate_channels: [
      'Calculate ROAS by channel (last 30 days)',
      'Identify underperformers (ROAS < 2.0)',
      'Identify overperformers (ROAS > 3.5)',
      'Shift 15-20% budget from low to high performers',
      'Monitor for 14 days before further adjustments',
    ],
    reduce_spend: [
      'Calculate minimum spend to maintain momentum',
      'Identify lowest-performing campaigns',
      'Pause bottom 20% by ROAS',
      'Preserve top performers at current spend',
      'Review weekly to prevent over-cutting',
    ],
    expand_doors: [
      'Review DTC demand by market (zip codes)',
      'Identify retail markets with high DTC penetration',
      'Contact distributors in target markets',
      'Negotiate door expansion terms',
      'Plan inventory allocation for 8-week lead time',
    ],
  };

  return baseSteps[decision.action] || [
    'Review current metrics and targets',
    'Plan implementation with relevant team',
    'Execute change incrementally',
    'Monitor results daily for 7 days',
    'Adjust based on early signals',
  ];
}

/**
 * Estimate impact description from decision metrics
 */
function estimateImpactDescription(decision: any): string {
  if (decision.expectedRevenue && decision.expectedRevenue > 1.2) {
    return `Potential revenue uplift: +${((decision.expectedRevenue - 1) * 100).toFixed(0)}%`;
  }

  if (decision.expectedCAC && decision.expectedCAC < 55) {
    return `Expected CAC improvement to $${decision.expectedCAC.toFixed(0)}`;
  }

  if (decision.savingsPotential) {
    return `Cash savings: $${(decision.savingsPotential / 1000).toFixed(0)}K`;
  }

  return 'Improves contribution margin and efficiency';
}

/**
 * Determine urgency based on confidence and decision characteristics
 */
function determineUrgency(confidence: number, decision: any): 'critical' | 'high' | 'medium' | 'low' {
  // High confidence + high impact = high urgency
  if (confidence > 0.8 && decision.impact > 0.8) {
    return 'high';
  }

  // Cash-saving actions are high urgency in constrained phases
  if (decision.savingsPotential && decision.savingsPotential > 50000) {
    return 'high';
  }

  // Lower confidence = lower urgency (test first)
  if (confidence < 0.5) {
    return 'low';
  }

  return 'medium';
}
