import { Inputs, SimulationOutputs } from "./types";

export interface Insight {
  id: string;
  type: "opportunity" | "warning" | "milestone" | "trend" | "action";
  severity: "info" | "success" | "warning" | "critical";
  title: string;
  description: string;
  metric?: string;
  value?: number | string;
  icon: string;
  action?: string;
}

/**
 * Generate simplified, actionable insights
 */
export function generateInsights(
  actualsOutput: SimulationOutputs,
  scenarioOutput: SimulationOutputs,
  inputs: Inputs
): Insight[] {
  const insights: Insight[] = [];
  const now = Date.now();

  // 1. Cash Status - Most Important
  if (!scenarioOutput.goNoGo) {
    insights.push({
      id: `cash-${now}`,
      type: "warning",
      severity: "critical",
      title: "Cash Below Reserve",
      description: `Hits $${(scenarioOutput.minCash / 1000).toFixed(0)}K in Week ${scenarioOutput.troughWeek}`,
      metric: "Action Needed",
      value: "Reduce spend or raise capital",
      icon: "🚨",
    });
  } else {
    const cushion = scenarioOutput.minCash - inputs.cash.reserveFloor;
    if (cushion > 100000) {
      insights.push({
        id: `cash-${now}`,
        type: "milestone",
        severity: "success",
        title: "Strong Cash Position",
        description: `$${(cushion / 1000).toFixed(0)}K above reserve floor`,
        metric: "Opportunity",
        value: "Room to invest in growth",
        icon: "💪",
      });
    }
  }

  // 2. CAC Performance
  const avgCAC = actualsOutput.impliedCAC.reduce((a, b) => a + b, 0) / 52;
  const targetCAC = inputs.dtc.cacModel.cac;
  const cacDiff = avgCAC - targetCAC;

  if (Math.abs(cacDiff) > 5) {
    insights.push({
      id: `cac-${now}`,
      type: cacDiff < 0 ? "opportunity" : "warning",
      severity: cacDiff < 0 ? "success" : "warning",
      title: cacDiff < 0 ? "CAC Beating Target" : "CAC Above Target",
      description: `$${avgCAC.toFixed(0)} avg vs $${targetCAC} target`,
      metric: cacDiff < 0 ? "Opportunity" : "Action",
      value: cacDiff < 0 ? "Scale spend efficiently" : "Optimize conversion",
      icon: cacDiff < 0 ? "🎯" : "📈",
    });
  }

  // 3. Subscriber Trend
  const startSubs = inputs.subs.startingActiveSubs;
  const endSubs = actualsOutput.activeSubs[51];
  const subGrowthPct = ((endSubs - startSubs) / startSubs) * 100;

  if (Math.abs(subGrowthPct) > 20) {
    insights.push({
      id: `subs-${now}`,
      type: subGrowthPct > 0 ? "milestone" : "warning",
      severity: subGrowthPct > 0 ? "success" : "warning",
      title: subGrowthPct > 0 ? "Subs Growing" : "Subs Declining",
      description: `${subGrowthPct > 0 ? "+" : ""}${subGrowthPct.toFixed(0)}% over 52 weeks`,
      metric: "Projected",
      value: `${Math.round(endSubs).toLocaleString()} subs`,
      icon: subGrowthPct > 0 ? "📈" : "📉",
    });
  }

  // 4. Revenue Mix (only if notable)
  const totalDTC = actualsOutput.dtcRevenueTotal.reduce((a, b) => a + b, 0);
  const totalRetail = actualsOutput.retailCashIn.reduce((a, b) => a + b, 0);
  const retailPct = (totalRetail / (totalDTC + totalRetail)) * 100;

  if (retailPct > 75 || retailPct < 25) {
    insights.push({
      id: `mix-${now}`,
      type: "trend",
      severity: "info",
      title: retailPct > 75 ? "Retail Dominant" : "DTC Dominant",
      description: `${retailPct.toFixed(0)}% retail / ${(100 - retailPct).toFixed(0)}% DTC`,
      metric: "Consider",
      value: retailPct > 75 ? "Grow DTC margin" : "Expand retail reach",
      icon: retailPct > 75 ? "🏪" : "🛒",
    });
  }

  // Sort and limit to 3 most important
  const severityOrder = { critical: 0, warning: 1, success: 2, info: 3 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights.slice(0, 3);
}

/**
 * Get the single most important insight
 */
export function getKeyInsight(insights: Insight[]): Insight | null {
  return insights[0] || null;
}
