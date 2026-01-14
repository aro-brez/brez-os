/**
 * BREZ Momentum Engine
 *
 * The core question: "Are we curving up or down in momentum,
 * and what do we need to do to curve back up while creating profit?"
 *
 * Correlates multiple inputs to determine growth trajectory
 * and generate actionable recommendations.
 */

// ============ TYPES ============

export interface Targets {
  cac: number;              // Target CAC (e.g., $55)
  dailyAdSpend: number;     // Target daily ad spend
  aov: number;              // Target AOV
  conversionRate: number;   // Target conversion rate (as decimal, e.g., 0.025 = 2.5%)
  subscriberPercent: number; // Target % of new customers subscribing
  roasTarget: number;       // Target ROAS
  retailDoors: number;      // Target number of retail doors
  retailVelocity: number;   // Target units per store per week
}

export interface ActualMetrics {
  // DTC
  cac: number;
  dailyAdSpend: number;
  aov: number;
  conversionRate: number;
  subscriberPercent: number;
  roas: number;
  newCustomers: number;
  revenue: number;

  // Retail
  retailDoors: number;
  retailVelocity: number;
  retailRevenue: number;

  // Working Capital
  workingCapital: number;
  runwayWeeks: number;
  cashFloor: number;
}

export interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'flat';
}

export interface MomentumScore {
  overall: number;           // -100 to +100
  direction: 'accelerating' | 'decelerating' | 'stable';
  components: {
    revenue: MetricTrend;
    cac: MetricTrend;
    conversion: MetricTrend;
    retail: MetricTrend;
    workingCapital: MetricTrend;
  };
  constrainingFactor: string;
  confidence: number;
}

export interface MomentumRecommendation {
  action: string;
  why: string;
  impact: string;
  lever: 'cac' | 'spend' | 'conversion' | 'retail' | 'working_capital' | 'cost_cutting';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  specifics: string[];
}

export interface MomentumAnalysis {
  score: MomentumScore;
  shouldRaiseCacTarget: boolean;
  shouldIncreaseSpend: boolean;
  recommendations: MomentumRecommendation[];
  summary: string;
  timestamp: string;
}

// ============ CALCULATIONS ============

/**
 * Calculate trend between two periods
 */
function calculateTrend(current: number, previous: number): MetricTrend {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (changePercent > 2) direction = 'up';
  else if (changePercent < -2) direction = 'down';

  return { current, previous, change, changePercent, direction };
}

/**
 * Calculate weighted momentum score
 *
 * Weights:
 * - Revenue trend: 30%
 * - CAC efficiency (target/actual): 25%
 * - Conversion rate trend: 20%
 * - Retail velocity trend: 15%
 * - Working capital buffer: 10%
 */
export function calculateMomentumScore(
  current: ActualMetrics,
  previous: ActualMetrics,
  targets: Targets
): MomentumScore {
  // Calculate individual trends
  const revenueTrend = calculateTrend(current.revenue, previous.revenue);
  const cacTrend = calculateTrend(current.cac, previous.cac);
  const conversionTrend = calculateTrend(current.conversionRate, previous.conversionRate);
  const retailTrend = calculateTrend(
    current.retailDoors * current.retailVelocity,
    previous.retailDoors * previous.retailVelocity
  );
  const wcTrend = calculateTrend(current.workingCapital, previous.workingCapital);

  // Score each component (-100 to +100)

  // Revenue: positive trend = positive score
  const revenueScore = Math.max(-100, Math.min(100, revenueTrend.changePercent * 5));

  // CAC: below target = positive, above = negative
  const cacEfficiency = targets.cac / current.cac;
  const cacScore = Math.max(-100, Math.min(100, (cacEfficiency - 1) * 100));

  // Conversion: positive trend = positive score
  const conversionScore = Math.max(-100, Math.min(100, conversionTrend.changePercent * 10));

  // Retail: positive velocity trend = positive score
  const retailScore = Math.max(-100, Math.min(100, retailTrend.changePercent * 3));

  // Working capital: above floor = positive, buffer matters
  const wcBuffer = (current.workingCapital - current.cashFloor) / current.cashFloor;
  const wcScore = Math.max(-100, Math.min(100, wcBuffer * 50));

  // Weighted average
  const overall =
    revenueScore * 0.30 +
    cacScore * 0.25 +
    conversionScore * 0.20 +
    retailScore * 0.15 +
    wcScore * 0.10;

  // Determine direction
  let direction: 'accelerating' | 'decelerating' | 'stable' = 'stable';
  if (overall > 10) direction = 'accelerating';
  else if (overall < -10) direction = 'decelerating';

  // Find constraining factor
  const scores = [
    { name: 'Revenue growth', score: revenueScore },
    { name: 'CAC efficiency', score: cacScore },
    { name: 'Conversion rate', score: conversionScore },
    { name: 'Retail velocity', score: retailScore },
    { name: 'Working capital', score: wcScore },
  ];
  const constraining = scores.reduce((min, s) => s.score < min.score ? s : min);

  return {
    overall: Math.round(overall),
    direction,
    components: {
      revenue: revenueTrend,
      cac: cacTrend,
      conversion: conversionTrend,
      retail: retailTrend,
      workingCapital: wcTrend,
    },
    constrainingFactor: constraining.name,
    confidence: 0.85, // Could be dynamic based on data completeness
  };
}

/**
 * Should we raise the CAC target?
 *
 * YES if:
 * - Working capital is healthy (>1.5x floor)
 * - Momentum is positive
 * - Current CAC is at or below target
 * - Raising would enable profitable scale
 */
export function shouldRaiseCacTarget(
  score: MomentumScore,
  current: ActualMetrics,
  targets: Targets
): boolean {
  const wcHealthy = current.workingCapital > current.cashFloor * 1.5;
  const momentumPositive = score.overall > 0;
  const cacEfficient = current.cac <= targets.cac;

  return wcHealthy && momentumPositive && cacEfficient;
}

/**
 * Should we increase ad spend?
 *
 * YES if:
 * - CAC is below target (efficient)
 * - Working capital allows
 * - Momentum is not declining
 */
export function shouldIncreaseSpend(
  score: MomentumScore,
  current: ActualMetrics,
  targets: Targets
): boolean {
  const cacEfficient = current.cac < targets.cac;
  const wcAllows = current.runwayWeeks >= 8;
  const momentumOk = score.direction !== 'decelerating';

  return cacEfficient && wcAllows && momentumOk;
}

/**
 * Generate actionable recommendations based on momentum analysis
 */
export function generateRecommendations(
  score: MomentumScore,
  current: ActualMetrics,
  targets: Targets
): MomentumRecommendation[] {
  const recommendations: MomentumRecommendation[] = [];

  // CRITICAL: Working capital below floor
  if (current.workingCapital < current.cashFloor) {
    recommendations.push({
      action: 'URGENT: Secure working capital',
      why: `Cash at $${(current.workingCapital / 1000).toFixed(0)}K, below $${(current.cashFloor / 1000).toFixed(0)}K floor`,
      impact: 'Survival',
      lever: 'working_capital',
      urgency: 'critical',
      specifics: [
        'Pursue working capital loan immediately',
        'Pause non-essential ad spend',
        'Accelerate AR collections',
        'Identify $50K+ quick wins',
      ],
    });
  }

  // HIGH: CAC significantly above target
  if (current.cac > targets.cac * 1.2) {
    recommendations.push({
      action: `Reduce CAC from $${current.cac.toFixed(0)} to $${targets.cac.toFixed(0)}`,
      why: `CAC ${((current.cac / targets.cac - 1) * 100).toFixed(0)}% above target, burning cash`,
      impact: `Save $${((current.cac - targets.cac) * current.newCustomers).toFixed(0)}/month`,
      lever: 'cac',
      urgency: 'high',
      specifics: [
        'Pause bottom 20% performing campaigns',
        'Analyze winning creative patterns',
        'Test new audiences',
        'Review landing page conversion',
      ],
    });
  }

  // MEDIUM: Conversion rate below target
  if (current.conversionRate < targets.conversionRate * 0.9) {
    recommendations.push({
      action: `Improve conversion from ${(current.conversionRate * 100).toFixed(1)}% to ${(targets.conversionRate * 100).toFixed(1)}%`,
      why: 'Traffic is coming but not converting',
      impact: `+${Math.round((targets.conversionRate - current.conversionRate) * current.newCustomers / current.conversionRate)} customers/period`,
      lever: 'conversion',
      urgency: 'medium',
      specifics: [
        'A/B test checkout flow',
        'Review site speed',
        'Analyze drop-off points',
        'Test urgency messaging',
      ],
    });
  }

  // Opportunity: Can scale profitably
  if (shouldIncreaseSpend(score, current, targets)) {
    const additionalSpend = Math.min(
      (current.workingCapital - current.cashFloor * 1.2) * 0.1, // 10% of buffer
      targets.dailyAdSpend * 0.3 * 30 // 30% increase for a month
    );

    if (additionalSpend > 5000) {
      recommendations.push({
        action: `Scale ad spend by $${(additionalSpend / 1000).toFixed(0)}K`,
        why: `CAC efficient ($${current.cac.toFixed(0)} vs $${targets.cac.toFixed(0)} target), working capital healthy`,
        impact: `+${Math.round(additionalSpend / current.cac)} new customers`,
        lever: 'spend',
        urgency: 'medium',
        specifics: [
          'Increase budget on top performers',
          'Test new ad sets at proven CAC',
          'Monitor daily for CAC creep',
          'Set auto-pause rules at $' + (targets.cac * 1.1).toFixed(0),
        ],
      });
    }
  }

  // Retail opportunity
  if (current.retailDoors < targets.retailDoors * 0.8) {
    recommendations.push({
      action: `Expand from ${current.retailDoors} to ${targets.retailDoors} doors`,
      why: 'Retail has 30% CM - most profitable channel',
      impact: `+$${((targets.retailDoors - current.retailDoors) * current.retailVelocity * 4).toFixed(0)}/month at full velocity`,
      lever: 'retail',
      urgency: 'medium',
      specifics: [
        'Identify high-velocity regions',
        'Pitch top-performing account data',
        'Negotiate shelf placement',
        'Set velocity targets per account',
      ],
    });
  }

  // If momentum declining and cash tight, cut costs
  if (score.direction === 'decelerating' && current.runwayWeeks < 12) {
    recommendations.push({
      action: 'Cut non-essential costs',
      why: `Momentum declining with ${current.runwayWeeks} week runway`,
      impact: 'Extend runway, buy time to recover',
      lever: 'cost_cutting',
      urgency: score.overall < -20 ? 'high' : 'medium',
      specifics: [
        'Review all subscriptions/SaaS',
        'Pause experimental initiatives',
        'Renegotiate vendor contracts',
        'Evaluate team capacity vs needs',
      ],
    });
  }

  // Sort by urgency
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return recommendations;
}

/**
 * Generate natural language summary of momentum state
 */
function generateSummary(
  score: MomentumScore,
  raiseCac: boolean,
  increaseSpend: boolean,
  current: ActualMetrics,
  targets: Targets
): string {
  const directionText = {
    accelerating: 'Momentum is UP',
    decelerating: 'Momentum is DOWN',
    stable: 'Momentum is FLAT',
  }[score.direction];

  const constraintText = `Primary constraint: ${score.constrainingFactor}`;

  let actionText = '';
  if (score.overall < -20) {
    actionText = 'Focus on survival. Cut costs, secure capital.';
  } else if (raiseCac && increaseSpend) {
    actionText = 'Green light to scale. Raise CAC target and increase spend.';
  } else if (increaseSpend) {
    actionText = 'Can increase spend at current CAC target.';
  } else if (current.cac > targets.cac) {
    actionText = 'Optimize before scaling. CAC too high.';
  } else {
    actionText = 'Hold steady. Address the constraint before scaling.';
  }

  return `${directionText} (score: ${score.overall}). ${constraintText}. ${actionText}`;
}

/**
 * Run complete momentum analysis
 */
export function analyzeMomentum(
  current: ActualMetrics,
  previous: ActualMetrics,
  targets: Targets
): MomentumAnalysis {
  const score = calculateMomentumScore(current, previous, targets);
  const raiseCac = shouldRaiseCacTarget(score, current, targets);
  const increaseSpend = shouldIncreaseSpend(score, current, targets);
  const recommendations = generateRecommendations(score, current, targets);
  const summary = generateSummary(score, raiseCac, increaseSpend, current, targets);

  return {
    score,
    shouldRaiseCacTarget: raiseCac,
    shouldIncreaseSpend: increaseSpend,
    recommendations,
    summary,
    timestamp: new Date().toISOString(),
  };
}

// ============ DEFAULT TARGETS ============

export const DEFAULT_TARGETS: Targets = {
  cac: 55,
  dailyAdSpend: 3000,
  aov: 85,
  conversionRate: 0.025,      // 2.5%
  subscriberPercent: 0.35,    // 35%
  roasTarget: 2.5,
  retailDoors: 500,
  retailVelocity: 2.5,        // units per store per week
};
