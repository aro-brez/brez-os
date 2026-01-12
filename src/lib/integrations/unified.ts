/**
 * BREZ Unified Metrics - Single source of truth for all data
 * Pulls from Shopify + QuickBooks, generates dynamic guidance
 */

import { getShopifyMetrics, type ShopifyMetrics } from "./shopify";
import { getQuickBooksMetrics, type QuickBooksMetrics } from "./quickbooks";

export interface UnifiedMetrics {
  cash: { balance: number; runway: number; status: "healthy" | "watch" | "critical"; floor: number };
  ap: { total: number; critical: number; stopShipRisks: number };
  revenue: { today: number; mtd: number; monthlyRun: number; trend: string };
  dtc: { orders: number; aov: number; cac: number; conversionRate: number; contributionMargin: number };
  subscriptions: { active: number; newThisWeek: number; churnRate: number };
  sources: { shopify: { connected: boolean; lastUpdated: string }; quickbooks: { connected: boolean; lastUpdated: string } };
  lastUpdated: string;
}

export interface DynamicAction {
  action: string;
  why: string;
  steps: string[];
  impact: string;
  urgency: "critical" | "high" | "medium" | "low";
  dataSource: string;
  confidence: number;
}

function getCashStatus(balance: number, floor: number): "healthy" | "watch" | "critical" {
  if (balance >= floor * 1.67) return "healthy";
  if (balance >= floor) return "watch";
  return "critical";
}

export async function getUnifiedMetrics(): Promise<UnifiedMetrics> {
  const [shopify, quickbooks] = await Promise.all([
    getShopifyMetrics().catch(() => null),
    getQuickBooksMetrics().catch(() => null),
  ]);

  const CASH_FLOOR = 300000;
  const cashBalance = quickbooks?.cash.balance || 0;
  const runwayWeeks = quickbooks?.runway.weeks || 0;
  const apTotal = quickbooks?.ap.total || 0;
  const apCritical = (quickbooks?.ap.overdue60 || 0) + (quickbooks?.ap.overdue90Plus || 0);
  const revenueMTD = shopify?.revenue.mtd || 0;
  const revenueToday = shopify?.revenue.today || 0;
  const dayOfMonth = new Date().getDate();
  const monthlyRunRate = dayOfMonth > 0 ? (revenueMTD / dayOfMonth) * 30 : 0;
  const trend = shopify?.revenue.yesterday ? `${((revenueToday - shopify.revenue.yesterday) / shopify.revenue.yesterday * 100).toFixed(0)}%` : "+0%";
  const cm = revenueMTD > 0 ? (revenueMTD - revenueMTD * 0.4 - (shopify?.cac.current || 55) * (shopify?.orders.last30Days || 0)) / revenueMTD : 0;

  return {
    cash: { balance: cashBalance, runway: runwayWeeks, status: getCashStatus(cashBalance, CASH_FLOOR), floor: CASH_FLOOR },
    ap: { total: apTotal, critical: apCritical, stopShipRisks: apCritical > 500000 ? Math.ceil(apCritical / 500000) : 0 },
    revenue: { today: revenueToday, mtd: revenueMTD, monthlyRun: monthlyRunRate, trend },
    dtc: { orders: shopify?.orders.last30Days || 0, aov: shopify?.orders.aov || 0, cac: shopify?.cac.current || 55, conversionRate: shopify?.subscriptions.conversionRate || 0, contributionMargin: cm },
    subscriptions: { active: shopify?.subscriptions.active || 0, newThisWeek: shopify?.subscriptions.newThisWeek || 0, churnRate: 0 },
    sources: { shopify: { connected: !!shopify, lastUpdated: shopify?.lastUpdated || "" }, quickbooks: { connected: !!quickbooks, lastUpdated: quickbooks?.lastUpdated || "" } },
    lastUpdated: new Date().toISOString(),
  };
}

export function generateDynamicOneThing(metrics: UnifiedMetrics, department: string): DynamicAction {
  // CRITICAL: Cash below floor
  if (metrics.cash.status === "critical") {
    return {
      action: "URGENT: Cash below $300K floor",
      why: `Cash at $${(metrics.cash.balance / 1000).toFixed(0)}K. ${metrics.cash.runway} weeks runway. Survival mode.`,
      steps: ["Pause all non-essential spend immediately", "Identify $50K+ quick cash sources", "Contact top AR accounts for early payment", "Escalate to Aaron + Dan NOW"],
      impact: "Protect survival", urgency: "critical", dataSource: "QuickBooks", confidence: 0.95,
    };
  }
  // HIGH: AP critical
  if (metrics.ap.critical > 1000000) {
    return {
      action: `Resolve $${(metrics.ap.critical / 1000000).toFixed(1)}M critical AP`,
      why: `${metrics.ap.stopShipRisks} vendors at stop-ship risk. Relationships degrading.`,
      steps: ["Pull AP aging from QuickBooks", "Identify stop-ship risk vendors", "Propose payment plan or equity conversion", "Document and track"],
      impact: "Prevent supply disruption", urgency: "high", dataSource: "QuickBooks", confidence: 0.90,
    };
  }
  // Return department-specific action
  return getDepartmentAction(metrics, department);
}

function getDepartmentAction(metrics: UnifiedMetrics, dept: string): DynamicAction {
  const actions: Record<string, DynamicAction> = {
    exec: { action: "Review metrics and make one strategic decision", why: `Revenue $${(metrics.revenue.monthlyRun / 1e6).toFixed(1)}M run. Cash $${(metrics.cash.balance / 1e3).toFixed(0)}K.`, steps: ["Check Shopify revenue trend", "Review cash vs last week", "Identify one Thrive-accelerating decision", "Document and communicate"], impact: "Strategic clarity", urgency: "medium", dataSource: "All", confidence: 0.85 },
    growth: { action: `Reduce CAC from $${metrics.dtc.cac} toward $55`, why: `Every $5 saved = ${Math.round(metrics.dtc.orders / 30 * 5 / metrics.dtc.cac)} more customers/day.`, steps: ["Pull ad performance by campaign", "Cut bottom 20% performers", "Scale top 20% performers", "Document patterns"], impact: `-$5 CAC = +$${(metrics.dtc.orders * 5 / 1000).toFixed(0)}K/mo`, urgency: "medium", dataSource: "Shopify", confidence: 0.80 },
    finance: { action: "Update cash forecast", why: `${metrics.cash.runway} week runway. Clarity enables decisions.`, steps: ["Reconcile QB to bank", "Update 4-week inflows", "Update 4-week outflows", "Flag if runway <6 weeks"], impact: "Decision confidence", urgency: "medium", dataSource: "QuickBooks", confidence: 0.90 },
    retail: { action: "Verify top accounts are stocked", why: "Retail CM 30% - most profitable. Empty shelves = lost revenue.", steps: ["Pull velocity top 10", "Check inventory levels", "Reorder if <2 weeks supply", "Log at-risk accounts"], impact: "Protect retail revenue", urgency: "medium", dataSource: "Retail", confidence: 0.75 },
    ops: { action: "Find one COGS reduction", why: "Every $0.05/unit compounds.", steps: ["Pull fulfillment costs", "Find highest cost item", "Research alternative", "Model savings"], impact: "+$30K/year potential", urgency: "low", dataSource: "Ops", confidence: 0.70 },
    product: { action: "Read 5 reviews, find 1 insight", why: "Customer voice = product truth.", steps: ["Read 5 recent reviews", "Note patterns", "Identify insight", "Share with team"], impact: "+2% retention potential", urgency: "low", dataSource: "Reviews", confidence: 0.65 },
    cx: { action: "Resolve 3 oldest tickets", why: "Each unresolved = churn risk.", steps: ["Sort by age", "Resolve 3 oldest", "Document root cause", "Flag patterns"], impact: "Save 3 customers", urgency: "medium", dataSource: "Support", confidence: 0.80 },
    creative: { action: "Analyze winning ad, create 2 variants", why: "Scale what works.", steps: ["Find best ROAS ad", "Analyze what worked", "Create 2 variants", "Launch test"], impact: "Lower CAC at scale", urgency: "low", dataSource: "Ads", confidence: 0.70 },
  };
  return actions[dept] || actions.exec;
}
