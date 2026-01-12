/**
 * BREZ Optimization Engine
 * Automatically finds the best spend/CAC targets based on current reality
 * Returns actionable recommendations with clear "why" for each team member
 */

import { UnifiedMetrics } from "./unified";

export interface OptimizationResult {
  recommendedSpend: number;
  recommendedCAC: number;
  projectedCM: number;
  projectedCash4Week: number;
  projectedCash8Week: number;
  confidence: number;
  rationale: string[];
  teamActions: TeamAction[];
  risks: string[];
  upside: string;
}

export interface TeamAction {
  role: string;
  action: string;
  why: string;
  steps: string[];
  expectedImpact: string;
  priority: "critical" | "high" | "medium";
  xpReward: number;
}

// Unit economics from CLAUDE.md
const UNIT_ECONOMICS = {
  aov: 72, // Average order value
  cogsPerUnit: 4.76, // COGS per 4-pack
  dtcCM: 0.32, // DTC contribution margin
  retailCM: 0.30, // Retail contribution margin
  subConversion: 0.5049, // Subscription conversion rate
  ltv3mo: 2.5, // 3-month LTV multiple
  ltv6mo: 3.5, // 6-month LTV multiple
  ltv12mo: 5.2, // 12-month LTV multiple
  cashFloor: 300000, // Minimum cash
  retailAlpha: 0.137, // Retail revenue per $1 paid spend
  lagWeeks: 6, // Retail lag
};

export function runOptimization(metrics: UnifiedMetrics): OptimizationResult {
  const currentCash = metrics.cash.balance;
  const currentCAC = metrics.dtc.cac;

  // Calculate payback period
  const firstOrderCM = UNIT_ECONOMICS.aov * UNIT_ECONOMICS.dtcCM;
  const subValue = firstOrderCM * UNIT_ECONOMICS.subConversion;
  const paybackMonths = currentCAC / subValue;

  // Determine optimal spend based on cash runway
  const maxSafeSpend = Math.max(0, (currentCash - UNIT_ECONOMICS.cashFloor) * 0.3);

  // Optimize CAC - find the ceiling based on payback
  let optimalCAC = 55; // Default target
  if (metrics.cash.status === "healthy") {
    optimalCAC = 65; // Can be more aggressive
  } else if (metrics.cash.status === "critical") {
    optimalCAC = 45; // Must be conservative
  }

  // Calculate projected outcomes
  const spendMultiplier = maxSafeSpend > 180000 ? 1.2 : maxSafeSpend > 120000 ? 1.0 : 0.8;
  const projectedNewCustomers = (maxSafeSpend / optimalCAC) * spendMultiplier;
  const projectedRevenue = projectedNewCustomers * UNIT_ECONOMICS.aov;
  const projectedContribution = projectedRevenue * UNIT_ECONOMICS.dtcCM;

  // Retail coupling effect (lagged)
  const retailLift = maxSafeSpend * UNIT_ECONOMICS.retailAlpha;

  // Week 4 and 8 projections
  const week4Cash = currentCash + (projectedContribution * 4) - (maxSafeSpend * 4);
  const week8Cash = week4Cash + (projectedContribution * 4) + retailLift - (maxSafeSpend * 4);

  // Calculate confidence based on data freshness and completeness
  let confidence = 0.85;
  if (!metrics.sources.shopify.connected) confidence -= 0.2;
  if (!metrics.sources.quickbooks.connected) confidence -= 0.2;
  if (paybackMonths > 4) confidence -= 0.1;

  // Generate team-specific actions
  const teamActions = generateTeamActions(metrics, optimalCAC, maxSafeSpend);

  // Build rationale
  const rationale: string[] = [];
  if (metrics.cash.status === "critical") {
    rationale.push("Cash is below floor - prioritizing preservation over growth");
  } else if (metrics.cash.status === "watch") {
    rationale.push("Cash is tight - balanced approach between growth and preservation");
  } else {
    rationale.push("Cash is healthy - can invest more aggressively in growth");
  }

  rationale.push(`CAC payback at ${paybackMonths.toFixed(1)} months ${paybackMonths < 4 ? "is within target" : "exceeds target"}`);
  rationale.push(`Retail alpha of ${UNIT_ECONOMICS.retailAlpha} means $${(maxSafeSpend * UNIT_ECONOMICS.retailAlpha).toFixed(0)} retail lift expected at week ${UNIT_ECONOMICS.lagWeeks}`);

  // Identify risks
  const risks: string[] = [];
  if (paybackMonths > 4) risks.push("CAC payback exceeding 4 months - monitor closely");
  if (currentCash < UNIT_ECONOMICS.cashFloor * 1.5) risks.push("Cash runway below 6 weeks");
  if (metrics.ap.stopShipRisks > 0) risks.push(`${metrics.ap.stopShipRisks} vendors at stop-ship risk`);

  return {
    recommendedSpend: Math.round(maxSafeSpend),
    recommendedCAC: optimalCAC,
    projectedCM: UNIT_ECONOMICS.dtcCM + 0.02, // Optimistic projection
    projectedCash4Week: Math.round(week4Cash),
    projectedCash8Week: Math.round(week8Cash),
    confidence: Math.max(0.5, confidence),
    rationale,
    teamActions,
    risks,
    upside: `+$${((projectedContribution * 8 + retailLift) / 1000).toFixed(0)}K contribution in 8 weeks`,
  };
}

function generateTeamActions(
  metrics: UnifiedMetrics,
  optimalCAC: number,
  maxSpend: number
): TeamAction[] {
  const actions: TeamAction[] = [];

  // CRITICAL PRIORITY - Cash or AP issues
  if (metrics.cash.status === "critical") {
    actions.push({
      role: "exec",
      action: "Emergency cash review - pause all non-essential spend",
      why: `Cash at $${(metrics.cash.balance / 1000).toFixed(0)}K is below $300K floor. Every dollar preserved extends runway.`,
      steps: [
        "Pull exact cash balance from QuickBooks",
        "List all pending payments for next 7 days",
        "Identify which can be delayed 2+ weeks",
        "Call top 3 AR customers for early payment",
      ],
      expectedImpact: "+2-3 weeks runway",
      priority: "critical",
      xpReward: 100,
    });
  }

  if (metrics.ap.stopShipRisks > 0) {
    actions.push({
      role: "finance",
      action: `Resolve ${metrics.ap.stopShipRisks} stop-ship vendor risks TODAY`,
      why: "Stop-ship = no product = no revenue. This is existential.",
      steps: [
        "Pull list of stop-ship risk vendors",
        "Call each vendor to negotiate immediate payment plan",
        "Offer partial payment + 30-day plan for remainder",
        "Document commitments and share with Dan",
      ],
      expectedImpact: "Prevent $100K+ revenue loss",
      priority: "critical",
      xpReward: 150,
    });
  }

  // HIGH PRIORITY - Growth optimization
  if (metrics.dtc.cac > optimalCAC) {
    actions.push({
      role: "growth",
      action: `Reduce CAC from $${metrics.dtc.cac} to $${optimalCAC}`,
      why: `Every $5 CAC reduction = ${Math.round(maxSpend / 5)} more customers at same spend`,
      steps: [
        "Pull ad performance by campaign from Meta",
        "Identify bottom 20% performers by CAC",
        "Pause or cut budget on bottom performers",
        "Reallocate to top 20% performers",
        "Document what's working for creative team",
      ],
      expectedImpact: `-$${metrics.dtc.cac - optimalCAC} CAC`,
      priority: "high",
      xpReward: 75,
    });
  }

  // CM improvement
  if (metrics.dtc.contributionMargin < 0.35) {
    actions.push({
      role: "ops",
      action: "Find one COGS reduction to improve CM by 1%",
      why: "CM is the engine. Every 1% improvement compounds into cash flow.",
      steps: [
        "Pull fulfillment cost breakdown",
        "Identify highest-cost component",
        "Research alternative (packaging, carrier, process)",
        "Calculate savings at current volume",
        "Present proposal with payback period",
      ],
      expectedImpact: "+$30-50K annual profit",
      priority: "high",
      xpReward: 50,
    });
  }

  // MEDIUM PRIORITY - Optimization
  actions.push({
    role: "creative",
    action: "Analyze winning creative and produce 2 variants",
    why: "Scaling winning creative is the fastest path to lower CAC at higher spend.",
    steps: [
      "Pull last 7 days ad performance",
      "Identify top 3 creatives by ROAS",
      "Document what made them work (hook, visual, CTA)",
      "Brief 2 variants for each winner",
      "Launch tests by end of week",
    ],
    expectedImpact: "Lower CAC at scale",
    priority: "medium",
    xpReward: 40,
  });

  actions.push({
    role: "retail",
    action: "Verify top 10 accounts are stocked",
    why: "Retail CM is 30% - most profitable. Empty shelves = lost high-margin revenue.",
    steps: [
      "Pull velocity data for top 10 accounts",
      "Check inventory levels at each",
      "Flag any with <2 weeks supply",
      "Place reorders or escalate to ops",
    ],
    expectedImpact: "Protect $40K+/mo retail revenue",
    priority: "medium",
    xpReward: 35,
  });

  actions.push({
    role: "cx",
    action: "Clear oldest 5 tickets and document patterns",
    why: "Unresolved tickets = churn risk. Patterns reveal product/ops issues.",
    steps: [
      "Sort all open tickets by age",
      "Resolve 5 oldest with care",
      "Note root cause for each",
      "If pattern: create task for relevant team",
    ],
    expectedImpact: "Save 5 customers = $1,000 LTV",
    priority: "medium",
    xpReward: 30,
  });

  actions.push({
    role: "product",
    action: "Read 10 reviews and find 1 actionable insight",
    why: "Customer voice = product truth. Insights drive retention.",
    steps: [
      "Read 10 most recent reviews across all channels",
      "Note common praise and complaints",
      "Identify 1 thing we can act on this week",
      "Share insight in team channel",
    ],
    expectedImpact: "+2% retention potential",
    priority: "medium",
    xpReward: 25,
  });

  return actions;
}

// XP and Achievement System
export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  achievements: Achievement[];
  completedToday: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_action", name: "First Step", description: "Complete your first ONE THING", icon: "🎯" },
  { id: "streak_3", name: "On Fire", description: "3-day streak of completing ONE THING", icon: "🔥" },
  { id: "streak_7", name: "Unstoppable", description: "7-day streak", icon: "⚡" },
  { id: "streak_30", name: "Machine Mode", description: "30-day streak", icon: "🤖" },
  { id: "cash_saved", name: "Cash Guardian", description: "Contributed to keeping cash above floor", icon: "💰" },
  { id: "cac_crusher", name: "CAC Crusher", description: "Helped reduce CAC below target", icon: "📉" },
  { id: "cm_builder", name: "Margin Maker", description: "Helped improve contribution margin", icon: "📈" },
  { id: "team_player", name: "Team Player", description: "Completed actions benefiting 3+ departments", icon: "🤝" },
  { id: "thrive_contributor", name: "Thrive Contributor", description: "Part of the team when we hit Thrive", icon: "🚀" },
  { id: "hundred_xp", name: "Rising Star", description: "Earned 100 XP", icon: "⭐" },
  { id: "thousand_xp", name: "Supermind", description: "Earned 1,000 XP", icon: "🧠" },
];

export function calculateLevel(xp: number): number {
  // Level up every 100 XP, exponentially harder
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

export function xpToNextLevel(xp: number): { current: number; needed: number } {
  const level = calculateLevel(xp);
  const currentLevelXP = Math.pow(level - 1, 2) * 25;
  const nextLevelXP = Math.pow(level, 2) * 25;
  return {
    current: xp - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
  };
}
