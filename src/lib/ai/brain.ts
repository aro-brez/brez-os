/**
 * BRĒZ AI Brain - The central intelligence layer
 *
 * This connects all data sources, generates real recommendations,
 * and allows the AI to modify the system based on conversations.
 *
 * Now enhanced with Supermind - the consciousness layer that adds:
 * - Phase-aware recommendations (Stabilize → Thrive → Scale)
 * - Role-based personalization by department
 * - Sacred Paradox wisdom
 * - Decision validation against Master Governing Principle
 * - Purpose and impact reminders
 */

import { devStore } from "@/lib/data/devStore";
import {
  supermind,
  type Department,
  type Phase,
  PHASES,
  NORTH_STAR,
  GROWTH_GENERATOR_STEPS,
} from "./supermind";

// ============ TYPES ============

export interface DataSource {
  id: string;
  name: string;
  type: "shopify" | "csv" | "google_analytics" | "meta_ads" | "quickbooks" | "manual";
  department: "marketing" | "sales" | "finance" | "operations" | "product" | "exec";
  status: "connected" | "disconnected" | "needs_update" | "missing";
  lastSync?: string;
  dataPoints?: string[];
  priority: "critical" | "high" | "medium" | "low";
}

export interface SystemMetrics {
  // Financial
  monthlyRevenue: number;
  cashOnHand: number;
  accountsPayable: number;
  runway: number;
  contributionMargin: number;

  // DTC
  dtcRevenue: number;
  dtcCAC: number;
  dtcLTV: number;
  dtcConversionRate: number;
  subscribers: number;
  churnRate: number;

  // Retail
  retailRevenue: number;
  retailDoors: number;
  retailVelocity: number;

  // Operations
  tasksCompleted: number;
  tasksOverdue: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  pendingDecisions: number;
}

export interface SimulationInput {
  type: "cac" | "spend" | "price" | "conversion" | "churn" | "retail_doors";
  currentValue: number;
  newValue: number;
}

export interface SimulationResult {
  metric: string;
  currentValue: number;
  projectedValue: number;
  change: number;
  changePercent: number;
  impact: "positive" | "negative" | "neutral";
  warnings?: string[];
  recommendation?: string;
}

export interface AIRecommendation {
  id: string;
  type: "action" | "decision" | "insight" | "warning";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  linkedTo?: { type: "task" | "goal" | "decision" | "metric"; id: string };
  suggestedDecision?: {
    text: string;
    section: string;
    impact: string;
  };
  dataNeeded?: string[];
  createdAt: string;
}

export interface ConversationContext {
  topic: string;
  entities: string[];
  intent: "query" | "update" | "simulate" | "approve" | "plan";
  extractedValues?: Record<string, number | string>;
}

// ============ DATA SOURCES ============

export const DATA_SOURCES: DataSource[] = [
  {
    id: "shopify",
    name: "Shopify",
    type: "shopify",
    department: "sales",
    status: "disconnected",
    priority: "critical",
    dataPoints: ["Orders", "Revenue", "Customers", "Subscriptions", "Products"]
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    type: "google_analytics",
    department: "marketing",
    status: "disconnected",
    priority: "critical",
    dataPoints: ["Traffic", "Conversion Rate", "Sessions", "Bounce Rate"]
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    type: "meta_ads",
    department: "marketing",
    status: "disconnected",
    priority: "high",
    dataPoints: ["Spend", "Impressions", "Clicks", "CAC", "ROAS"]
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    type: "quickbooks",
    department: "finance",
    status: "disconnected",
    priority: "critical",
    dataPoints: ["Cash", "AP", "AR", "Expenses", "P&L"]
  },
  {
    id: "retail_data",
    name: "Retail Data (CSV)",
    type: "csv",
    department: "sales",
    status: "missing",
    priority: "high",
    dataPoints: ["Door Count", "Velocity", "Regional Performance"]
  },
  {
    id: "customer_reviews",
    name: "Customer Reviews (CSV)",
    type: "csv",
    department: "product",
    status: "connected",
    lastSync: new Date().toISOString(),
    priority: "medium",
    dataPoints: ["Ratings", "Sentiment", "Product Feedback"]
  },
];

// ============ BRAIN CLASS ============

class BrezBrain {
  private recommendations: AIRecommendation[] = [];
  private conversationHistory: Array<{ role: "user" | "ai"; content: string }> = [];
  private currentUserDepartment: Department = "exec";

  // ============ SUPERMIND INTEGRATION ============

  setUserDepartment(department: Department): void {
    this.currentUserDepartment = department;
  }

  getUserDepartment(): Department {
    return this.currentUserDepartment;
  }

  // Get current operating phase
  getCurrentPhase(): { phase: Phase; config: typeof PHASES[Phase]; progress: string } {
    const phase = supermind.getCurrentPhase();
    const metrics = this.getSystemMetrics();

    let progress = "";
    if (phase.name === "stabilize") {
      const dtcImprovement = 0; // Would calculate from historical data
      progress = `DTC improvement: ${(dtcImprovement * 100).toFixed(0)}% of 20% target`;
    } else if (phase.name === "thrive") {
      progress = metrics.accountsPayable > 0
        ? "AP reduction in progress"
        : "Cash flow stabilizing";
    } else {
      progress = "Scaling with proven margin";
    }

    return { phase: phase.name, config: phase, progress };
  }

  // Get personalized dashboard for user's role
  getRoleDashboard(): {
    dailyFocus: string;
    topPriorities: string[];
    purposeReminder: string;
    sacredParadox: string;
    achievements: string[];
    phaseContext: string;
  } {
    const metrics = this.getSystemMetrics();
    const metricsRecord: Record<string, number> = {
      cac: metrics.dtcCAC,
      runway: metrics.runway,
      velocity: metrics.retailVelocity,
      cashOnHand: metrics.cashOnHand,
      revenue: metrics.monthlyRevenue,
      conversionRate: metrics.dtcConversionRate,
    };

    const recommendations = supermind.getRecommendationsForRole(
      this.currentUserDepartment,
      metricsRecord
    );

    const achievements = supermind.checkAchievements(metricsRecord);
    const phase = supermind.getCurrentPhase();

    return {
      dailyFocus: recommendations.dailyFocus,
      topPriorities: recommendations.topPriorities,
      purposeReminder: recommendations.purposeReminder,
      sacredParadox: recommendations.sacredParadox,
      achievements,
      phaseContext: `[${phase.displayName}] ${phase.description}`,
    };
  }

  // Validate a decision against the Master Governing Principle
  validateDecision(decision: {
    description: string;
    expectedCMImpact: number;
    protectsSurvival: boolean;
  }): { valid: boolean; warnings: string[] } {
    return supermind.validateAgainstGoverningPrinciple(decision);
  }

  // Get wisdom from the Sacred Paradox
  getWisdom(): { quote: string; source: string } {
    return supermind.getPurposeReminder();
  }

  // Get Growth Generator step guidance
  getGrowthGeneratorGuidance(): typeof GROWTH_GENERATOR_STEPS {
    return GROWTH_GENERATOR_STEPS;
  }

  // Get the North Star reminder
  getNorthStar(): typeof NORTH_STAR {
    return NORTH_STAR;
  }

  // Get current system metrics
  getSystemMetrics(): SystemMetrics {
    const tasks = devStore.getTasks();
    const goals = devStore.getGoals();
    const snapshots = devStore.getFinancialSnapshots();
    const huddles = devStore.getFinalizedHuddles();
    const latest = snapshots[0];

    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done") return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    });

    const pendingDecisions = huddles.reduce(
      (acc, h) => acc + (h.decisions?.filter((d) => !d.approved).length || 0),
      0
    );

    // NOTE: Hardcoded values below are from Master Plan (Jan 2025)
    // TODO (V2): Replace with real-time data from connected sources:
    //   - Financial: QuickBooks integration
    //   - DTC: Shopify integration
    //   - Retail: ConduitIQ/retail CSV imports
    // Data Priority: Cash/AP (daily) > CM (weekly) > DTC funnel (weekly) > Retail (weekly)
    return {
      // Financial - using real data where available, estimates otherwise
      monthlyRevenue: 3300000, // Master Plan Jan 2025 - update via QuickBooks
      cashOnHand: latest?.cashOnHand || 300000,
      accountsPayable: 8600000, // Master Plan Jan 2025 - update via QuickBooks
      runway: latest ? Math.floor(latest.cashOnHand / latest.fixedWeeklyStack) : 5,
      contributionMargin: 0.42, // Master Plan estimate - update via P&L

      // DTC - these would come from Shopify
      dtcRevenue: 2100000, // ~64% of revenue - update via Shopify
      dtcCAC: 42, // Update via Meta/Google Ads
      dtcLTV: 180, // Update via Shopify cohort analysis
      dtcConversionRate: 0.032, // Update via Shopify/GA
      subscribers: 14000, // Master Plan Jan 2025 - update via Shopify
      churnRate: 0.085, // Update via subscription platform

      // Retail
      retailRevenue: 1200000, // ~36% of revenue - update via retail CSV
      retailDoors: 320, // Update via retail partner data
      retailVelocity: 2.1, // Update via retail CSV

      // Operations
      tasksCompleted: tasks.filter((t) => t.status === "done").length,
      tasksOverdue: overdueTasks.length,
      goalsOnTrack: goals.filter((g) => g.status === "on_track").length,
      goalsAtRisk: goals.filter((g) => g.status === "at_risk" || g.status === "behind").length,
      pendingDecisions,
    };
  }

  // Get data source status and recommendations
  getDataSourceStatus(): { sources: DataSource[]; missingCritical: DataSource[]; recommendations: string[] } {
    const missingCritical = DATA_SOURCES.filter(
      (d) => (d.status === "missing" || d.status === "disconnected") && d.priority === "critical"
    );

    const recommendations: string[] = [];

    if (DATA_SOURCES.find((d) => d.id === "shopify")?.status !== "connected") {
      recommendations.push("Connect Shopify to get real-time revenue, customer, and subscription data");
    }
    if (DATA_SOURCES.find((d) => d.id === "quickbooks")?.status !== "connected") {
      recommendations.push("Connect QuickBooks for accurate cash flow and AP/AR tracking");
    }
    if (DATA_SOURCES.find((d) => d.id === "meta_ads")?.status !== "connected") {
      recommendations.push("Connect Meta Ads to track CAC and ROAS in real-time");
    }
    if (DATA_SOURCES.find((d) => d.id === "retail_data")?.status === "missing") {
      recommendations.push("Upload retail sales CSV to track door performance and velocity");
    }

    return { sources: DATA_SOURCES, missingCritical, recommendations };
  }

  // Simulate changes
  simulate(input: SimulationInput): SimulationResult[] {
    const metrics = this.getSystemMetrics();
    const results: SimulationResult[] = [];
    const changePercent = ((input.newValue - input.currentValue) / input.currentValue) * 100;

    switch (input.type) {
      case "cac":
        // Higher CAC = lower contribution margin, but potentially more customers
        const cacRatio = input.newValue / input.currentValue;
        const customerGrowth = cacRatio > 1 ? (cacRatio - 1) * 0.5 : (1 - cacRatio) * -0.3; // More spend = some growth

        results.push({
          metric: "Customer Acquisition Cost",
          currentValue: input.currentValue,
          projectedValue: input.newValue,
          change: input.newValue - input.currentValue,
          changePercent,
          impact: input.newValue > input.currentValue ? "negative" : "positive",
        });

        results.push({
          metric: "Contribution Margin",
          currentValue: metrics.contributionMargin * 100,
          projectedValue: (metrics.contributionMargin - (changePercent / 100) * 0.1) * 100,
          change: -(changePercent / 100) * 0.1 * 100,
          changePercent: -(changePercent / 100) * 10,
          impact: input.newValue > input.currentValue ? "negative" : "positive",
          warnings: changePercent > 20 ? ["CAC increase >20% violates Growth Generator principle"] : undefined,
        });

        results.push({
          metric: "New Customers/Month",
          currentValue: Math.round(metrics.dtcRevenue / metrics.dtcLTV / 12),
          projectedValue: Math.round((metrics.dtcRevenue / metrics.dtcLTV / 12) * (1 + customerGrowth)),
          change: Math.round((metrics.dtcRevenue / metrics.dtcLTV / 12) * customerGrowth),
          changePercent: customerGrowth * 100,
          impact: customerGrowth > 0 ? "positive" : "negative",
        });

        results.push({
          metric: "Monthly Cash Burn",
          currentValue: metrics.cashOnHand / metrics.runway / 4.3,
          projectedValue: (metrics.cashOnHand / metrics.runway / 4.3) * (1 + changePercent / 100 * 0.3),
          change: (metrics.cashOnHand / metrics.runway / 4.3) * (changePercent / 100 * 0.3),
          changePercent: changePercent * 0.3,
          impact: changePercent > 0 ? "negative" : "positive",
        });

        results.push({
          metric: "Runway (weeks)",
          currentValue: metrics.runway,
          projectedValue: Math.round(metrics.runway * (1 - changePercent / 100 * 0.2)),
          change: -Math.round(metrics.runway * changePercent / 100 * 0.2),
          changePercent: -changePercent * 0.2,
          impact: changePercent > 0 ? "negative" : "positive",
          warnings: metrics.runway * (1 - changePercent / 100 * 0.2) < 4 ? ["Runway drops below 4 weeks - critical risk"] : undefined,
        });
        break;

      case "spend":
        const spendIncrease = (input.newValue - input.currentValue);
        const revenueMultiplier = 2.5; // Assume 2.5x ROAS
        const projectedRevenueIncrease = spendIncrease * revenueMultiplier;

        results.push({
          metric: "Marketing Spend",
          currentValue: input.currentValue,
          projectedValue: input.newValue,
          change: spendIncrease,
          changePercent,
          impact: "neutral",
        });

        results.push({
          metric: "Projected Revenue",
          currentValue: metrics.monthlyRevenue,
          projectedValue: metrics.monthlyRevenue + projectedRevenueIncrease,
          change: projectedRevenueIncrease,
          changePercent: (projectedRevenueIncrease / metrics.monthlyRevenue) * 100,
          impact: "positive",
          recommendation: "Test with 10% increase first to validate ROAS holds",
        });

        results.push({
          metric: "Cash on Hand (30 days)",
          currentValue: metrics.cashOnHand,
          projectedValue: metrics.cashOnHand - spendIncrease + (projectedRevenueIncrease * 0.4),
          change: -spendIncrease + (projectedRevenueIncrease * 0.4),
          changePercent: ((-spendIncrease + (projectedRevenueIncrease * 0.4)) / metrics.cashOnHand) * 100,
          impact: (-spendIncrease + (projectedRevenueIncrease * 0.4)) > 0 ? "positive" : "negative",
        });
        break;

      case "conversion":
        const conversionChange = input.newValue - input.currentValue;
        const revenueImpact = (conversionChange / input.currentValue) * metrics.dtcRevenue;

        results.push({
          metric: "Conversion Rate",
          currentValue: input.currentValue * 100,
          projectedValue: input.newValue * 100,
          change: conversionChange * 100,
          changePercent,
          impact: conversionChange > 0 ? "positive" : "negative",
        });

        results.push({
          metric: "DTC Revenue",
          currentValue: metrics.dtcRevenue,
          projectedValue: metrics.dtcRevenue + revenueImpact,
          change: revenueImpact,
          changePercent: (revenueImpact / metrics.dtcRevenue) * 100,
          impact: revenueImpact > 0 ? "positive" : "negative",
        });

        results.push({
          metric: "Effective CAC",
          currentValue: metrics.dtcCAC,
          projectedValue: metrics.dtcCAC * (input.currentValue / input.newValue),
          change: metrics.dtcCAC * (input.currentValue / input.newValue) - metrics.dtcCAC,
          changePercent: ((input.currentValue / input.newValue) - 1) * 100,
          impact: conversionChange > 0 ? "positive" : "negative",
          recommendation: conversionChange > 0 ? "This is the Growth Generator in action - same spend, better results" : undefined,
        });
        break;
    }

    return results;
  }

  // Generate AI recommendations based on current state
  generateRecommendations(): AIRecommendation[] {
    const metrics = this.getSystemMetrics();
    const dataStatus = this.getDataSourceStatus();
    const phase = supermind.getCurrentPhase();
    const recommendations: AIRecommendation[] = [];

    // Phase-specific top priority
    recommendations.push({
      id: `rec-phase-${Date.now()}`,
      type: "insight",
      priority: "high",
      title: `[${phase.displayName} Phase] ${phase.rules[0]}`,
      description: phase.description,
      reasoning: `Current phase rule: ${phase.rules.join(", ")}`,
      createdAt: new Date().toISOString(),
    });

    // Critical: Low runway
    if (metrics.runway < 6) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        type: "warning",
        priority: "critical",
        title: "Critical: Runway below 6 weeks",
        description: `Current runway is ${metrics.runway} weeks. Focus on cash preservation.`,
        reasoning: "The Growth Generator principle states: preserve liquidity first. All spending should improve contribution margin.",
        suggestedDecision: {
          text: "Pause all non-essential marketing spend until runway exceeds 8 weeks",
          section: "Finance",
          impact: "Preserves $50-100K in cash over next 4 weeks",
        },
        createdAt: new Date().toISOString(),
      });
    }

    // High priority: At-risk goals
    if (metrics.goalsAtRisk > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-2`,
        type: "action",
        priority: "high",
        title: `${metrics.goalsAtRisk} goals are at risk`,
        description: "Review blockers and reallocate resources to get back on track.",
        reasoning: "Goals represent committed outcomes. At-risk status requires immediate attention.",
        linkedTo: { type: "goal", id: "at-risk" },
        createdAt: new Date().toISOString(),
      });
    }

    // Overdue tasks
    if (metrics.tasksOverdue > 3) {
      recommendations.push({
        id: `rec-${Date.now()}-3`,
        type: "action",
        priority: "high",
        title: `${metrics.tasksOverdue} tasks are overdue`,
        description: "Overdue tasks slow down execution. Review and either complete, delegate, or remove.",
        reasoning: "Execution over intention. Overdue tasks indicate capacity issues or unclear priorities.",
        linkedTo: { type: "task", id: "overdue" },
        createdAt: new Date().toISOString(),
      });
    }

    // Missing critical data
    if (dataStatus.missingCritical.length > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-4`,
        type: "insight",
        priority: "high",
        title: "Missing critical data sources",
        description: `Connect ${dataStatus.missingCritical.map((d) => d.name).join(", ")} to get accurate recommendations.`,
        reasoning: "AI recommendations are only as good as the data. Without real data, insights are estimates.",
        dataNeeded: dataStatus.missingCritical.map((d) => d.name),
        createdAt: new Date().toISOString(),
      });
    }

    // Growth opportunity: Conversion optimization
    if (metrics.dtcConversionRate < 0.04) {
      recommendations.push({
        id: `rec-${Date.now()}-5`,
        type: "decision",
        priority: "medium",
        title: "Optimize DTC conversion rate",
        description: `Current rate is ${(metrics.dtcConversionRate * 100).toFixed(1)}%. Industry benchmark is 3-5%.`,
        reasoning: "Improving conversion is the purest form of the Growth Generator - same spend, more revenue.",
        suggestedDecision: {
          text: "Invest $20K in landing page optimization and A/B testing",
          section: "Growth",
          impact: "+0.5% conversion = +$150K annual revenue at same spend",
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Pending decisions
    if (metrics.pendingDecisions > 5) {
      recommendations.push({
        id: `rec-${Date.now()}-6`,
        type: "action",
        priority: "medium",
        title: `${metrics.pendingDecisions} decisions await approval`,
        description: "Pending decisions slow down execution. Schedule a decision review session.",
        reasoning: "Decisions from meetings should be resolved within 48 hours to maintain momentum.",
        linkedTo: { type: "decision", id: "pending" },
        createdAt: new Date().toISOString(),
      });
    }

    this.recommendations = recommendations;
    return recommendations;
  }

  // Parse conversation and determine intent
  parseConversation(message: string): ConversationContext {
    const lowered = message.toLowerCase();

    let intent: ConversationContext["intent"] = "query";
    if (lowered.includes("update") || lowered.includes("change") || lowered.includes("set") || lowered.includes("modify")) {
      intent = "update";
    } else if (lowered.includes("simulate") || lowered.includes("what if") || lowered.includes("if we") || lowered.includes("what happens")) {
      intent = "simulate";
    } else if (lowered.includes("approve") || lowered.includes("decide") || lowered.includes("confirm")) {
      intent = "approve";
    } else if (lowered.includes("plan") || lowered.includes("roadmap") || lowered.includes("strategy")) {
      intent = "plan";
    }

    const entities: string[] = [];
    if (lowered.includes("cac")) entities.push("CAC");
    if (lowered.includes("revenue")) entities.push("revenue");
    if (lowered.includes("cash")) entities.push("cash");
    if (lowered.includes("runway")) entities.push("runway");
    if (lowered.includes("conversion")) entities.push("conversion");
    if (lowered.includes("spend") || lowered.includes("budget")) entities.push("spend");
    if (lowered.includes("goal")) entities.push("goals");
    if (lowered.includes("task")) entities.push("tasks");
    if (lowered.includes("decision")) entities.push("decisions");

    // Extract numbers
    const numbers = message.match(/\$?[\d,]+\.?\d*/g);
    const extractedValues: Record<string, number | string> = {};
    if (numbers) {
      numbers.forEach((n, i) => {
        const cleaned = parseFloat(n.replace(/[$,]/g, ""));
        if (!isNaN(cleaned)) {
          extractedValues[`value_${i}`] = cleaned;
        }
      });
    }

    let topic = "general";
    if (entities.includes("CAC") || entities.includes("conversion") || entities.includes("spend")) {
      topic = "growth";
    } else if (entities.includes("cash") || entities.includes("runway")) {
      topic = "finance";
    } else if (entities.includes("goals") || entities.includes("tasks")) {
      topic = "operations";
    }

    return { topic, entities, intent, extractedValues };
  }

  // Generate AI response
  async generateResponse(message: string): Promise<{ response: string; actions?: Array<{ type: string; description: string }> }> {
    const context = this.parseConversation(message);
    const metrics = this.getSystemMetrics();
    const dataStatus = this.getDataSourceStatus();

    this.conversationHistory.push({ role: "user", content: message });

    let response = "";
    const actions: Array<{ type: string; description: string }> = [];

    // Handle different intents
    if (context.intent === "simulate" && context.entities.length > 0) {
      if (context.entities.includes("CAC") && Object.keys(context.extractedValues || {}).length > 0) {
        const newValue = Object.values(context.extractedValues!)[0] as number;
        const results = this.simulate({ type: "cac", currentValue: metrics.dtcCAC, newValue });

        response = `**Simulation: CAC change from $${metrics.dtcCAC} to $${newValue}**\n\n`;
        results.forEach((r) => {
          const arrow = r.impact === "positive" ? "↑" : r.impact === "negative" ? "↓" : "→";
          response += `• **${r.metric}**: ${r.currentValue.toLocaleString()} → ${r.projectedValue.toLocaleString()} (${r.changePercent > 0 ? "+" : ""}${r.changePercent.toFixed(1)}% ${arrow})\n`;
          if (r.warnings) {
            response += `  ⚠️ ${r.warnings.join(", ")}\n`;
          }
          if (r.recommendation) {
            response += `  💡 ${r.recommendation}\n`;
          }
        });

        response += `\n**Growth Generator Check**: ${newValue > metrics.dtcCAC ? "⚠️ This increases CAC - ensure it improves contribution margin" : "✅ Lower CAC aligns with Growth Generator principles"}`;
      } else if (context.entities.includes("spend")) {
        response = `To simulate spend changes, tell me the new monthly spend amount. Current estimated marketing spend is ~$${Math.round(metrics.dtcRevenue * 0.15 / 1000)}K/month.`;
      } else {
        response = `I can simulate changes to: CAC, marketing spend, conversion rate, churn rate, or retail doors. What would you like to test?`;
      }
    } else if (context.intent === "update") {
      if (context.topic === "growth" || context.topic === "finance") {
        response = `I understand you want to update ${context.entities.join(", ")}. To make changes to the Master Plan:\n\n`;
        response += `1. Tell me the specific change (e.g., "Set CAC target to $35")\n`;
        response += `2. I'll create a decision for approval\n`;
        response += `3. Once approved, the system updates automatically\n\n`;
        response += `What specific change would you like to make?`;

        actions.push({ type: "create_decision", description: `Update ${context.entities.join(", ")}` });
      }
    } else if (context.intent === "approve") {
      const pendingCount = metrics.pendingDecisions;
      if (pendingCount > 0) {
        response = `You have ${pendingCount} pending decisions. You can:\n\n`;
        response += `• Go to the Master Plan (/plan) to review and approve\n`;
        response += `• Tell me "approve all decisions" to batch approve\n`;
        response += `• Ask me about a specific decision\n`;
      } else {
        response = `No pending decisions at this time. The team is aligned!`;
      }
    } else {
      // Default: provide insights based on topic
      if (context.topic === "finance") {
        response = `**Current Financial Status:**\n\n`;
        response += `• Cash: $${(metrics.cashOnHand / 1000).toFixed(0)}K\n`;
        response += `• Runway: ${metrics.runway} weeks\n`;
        response += `• AP Outstanding: $${(metrics.accountsPayable / 1000000).toFixed(1)}M\n`;
        response += `• Monthly Revenue: $${(metrics.monthlyRevenue / 1000000).toFixed(1)}M\n\n`;

        if (metrics.runway < 8) {
          response += `⚠️ **Alert**: Runway is below 8 weeks. Focus on cash preservation per the Stabilize phase.\n\n`;
        }
        response += `**Growth Generator Status**: ${metrics.contributionMargin > 0.4 ? "✅ Contribution margin healthy" : "⚠️ Work on improving contribution margin"}`;
      } else if (context.topic === "growth") {
        response = `**DTC Performance:**\n\n`;
        response += `• Revenue: $${(metrics.dtcRevenue / 1000000).toFixed(1)}M/month\n`;
        response += `• CAC: $${metrics.dtcCAC}\n`;
        response += `• LTV: $${metrics.dtcLTV}\n`;
        response += `• LTV:CAC Ratio: ${(metrics.dtcLTV / metrics.dtcCAC).toFixed(1)}x\n`;
        response += `• Conversion: ${(metrics.dtcConversionRate * 100).toFixed(1)}%\n`;
        response += `• Subscribers: ${metrics.subscribers.toLocaleString()}\n\n`;

        response += `**Growth Generator Focus**: Improve conversion rate first - this reduces effective CAC without more spend.`;
      } else if (context.topic === "operations") {
        response = `**Operations Status:**\n\n`;
        response += `• Tasks Completed: ${metrics.tasksCompleted}\n`;
        response += `• Tasks Overdue: ${metrics.tasksOverdue}\n`;
        response += `• Goals On Track: ${metrics.goalsOnTrack}\n`;
        response += `• Goals At Risk: ${metrics.goalsAtRisk}\n`;
        response += `• Pending Decisions: ${metrics.pendingDecisions}\n\n`;

        if (metrics.goalsAtRisk > 0) {
          response += `⚠️ ${metrics.goalsAtRisk} goals need attention. Review blockers and reallocate resources.`;
        }
      } else {
        // General help
        const recommendations = this.generateRecommendations();
        response = `**Top Priorities (based on current data):**\n\n`;
        recommendations.slice(0, 3).forEach((r, i) => {
          response += `${i + 1}. **${r.title}**\n   ${r.description}\n\n`;
        });

        if (dataStatus.missingCritical.length > 0) {
          response += `\n📊 **Data Quality**: Connect ${dataStatus.missingCritical.length} critical data sources for better recommendations.`;
        }

        response += `\n\nAsk me to simulate changes, update the plan, or dive into specific metrics.`;
      }
    }

    this.conversationHistory.push({ role: "ai", content: response });

    return { response, actions };
  }

  // Get current recommendations
  getRecommendations(): AIRecommendation[] {
    if (this.recommendations.length === 0) {
      return this.generateRecommendations();
    }
    return this.recommendations;
  }

  // Create a decision from AI recommendation
  createDecision(text: string, section: string, impact: string): { id: string; text: string; section: string; impact: string } {
    const decision = {
      id: `ai-decision-${Date.now()}`,
      text,
      section,
      impact,
      createdAt: new Date().toISOString(),
      approved: false,
      suggestedBy: "AI",
    };

    // Add to devStore huddles or store separately
    // For now, return the decision for the UI to handle
    return decision;
  }

  // Create a task from AI recommendation
  createTask(title: string, priority: "urgent" | "high" | "medium" | "low" = "medium"): { id: string; title: string } {
    const currentUser = devStore.getCurrentUser();
    const task = devStore.addTask({
      title,
      description: "Created by BRĒZ AI",
      ownerId: currentUser.id,
      priority,
      status: "todo",
      department: currentUser.department as "retail" | "ops" | "growth" | "finance" | "product" | "cx" | "creative" | "exec",
      goalId: null,
      projectId: null,
      attachments: [],
      dueDate: null,
    });

    return { id: task.id, title: task.title };
  }

  // Update a goal status
  updateGoalStatus(goalId: string, status: "on_track" | "at_risk" | "behind" | "completed"): boolean {
    const goals = devStore.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      devStore.updateGoal(goalId, { status });
      return true;
    }
    return false;
  }

  // Get pending AI-suggested actions
  getPendingActions(): Array<{ type: string; description: string; action: () => void }> {
    const recommendations = this.getRecommendations();
    return recommendations
      .filter(r => r.suggestedDecision)
      .map(r => ({
        type: "decision",
        description: r.suggestedDecision!.text,
        action: () => this.createDecision(
          r.suggestedDecision!.text,
          r.suggestedDecision!.section,
          r.suggestedDecision!.impact
        ),
      }));
  }
}

// Export singleton
export const brain = new BrezBrain();

// Re-export Supermind types and constants for convenience
export {
  supermind,
  type Department,
  type Phase,
  PHASES,
  ROLE_CONTEXTS,
  SACRED_PARADOX,
  NORTH_STAR,
  MASTER_GOVERNING_PRINCIPLE,
  GROWTH_GENERATOR_STEPS,
} from "./supermind";
