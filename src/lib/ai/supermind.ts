/**
 * BREZ Supermind - The Living Knowledge System
 *
 * This is the consciousness layer that sits above BrezBrain.
 * It embodies the Sacred Paradox: remembering AND forgetting,
 * knowing AND discovering, planning AND improvising.
 */

// ============ CORE PRINCIPLES ============

export const NORTH_STAR = {
  purpose: "BREZ exists to help people feel better without feeling worse.",
  coreBeliefs: [
    "BREZ is not the cure. You are.",
    "BREZ is a tool that reminds people of their own agency.",
  ],
  operatingPhilosophy: [
    "Clarity over chaos",
    "Execution over intention",
    "Integrity over optics",
    "Contribution margin over vanity metrics",
    "Alignment over individual agendas",
  ],
};

export const MASTER_GOVERNING_PRINCIPLE =
  "Every decision must improve contribution margin and meet at least survival goals.";

// ============ PHASE SYSTEM ============

export type Phase = "stabilize" | "thrive" | "scale";

export interface PhaseConfig {
  name: Phase;
  displayName: string;
  description: string;
  rules: string[];
  triggers: {
    enter: string;
    exit: string;
  };
}

export const PHASES: Record<Phase, PhaseConfig> = {
  stabilize: {
    name: "stabilize",
    displayName: "Stabilize",
    description: "Preserve liquidity, maximize contribution margin, contain AP",
    rules: [
      "No non-core SKUs",
      "No channel expansion without margin proof",
      "No spend without contribution justification",
    ],
    triggers: {
      enter: "Default phase / AP crisis",
      exit: "+20% DTC improvement at same spend",
    },
  },
  thrive: {
    name: "thrive",
    displayName: "Thrive",
    description: "Contribution margin expanding, faster AP reduction",
    rules: [
      "Reinvest only into conversion, retention, or COGS reduction",
      "Maintain cash governor",
      "Test before scaling",
    ],
    triggers: {
      enter: "+20% DTC improvement at same spend",
      exit: "AP fully resolved + positive cash flow",
    },
  },
  scale: {
    name: "scale",
    displayName: "Scale",
    description: "Growth on BREZ's terms, capital optional",
    rules: [
      "Expand channels with proven margin",
      "Product roadmap unlocked",
      "Hire ahead of demand",
    ],
    triggers: {
      enter: "AP resolved + sustainable profitability",
      exit: "N/A - continuous",
    },
  },
};

// ============ GROWTH GENERATOR ============

export const GROWTH_GENERATOR_STEPS = [
  {
    step: 1,
    name: "Improve Contribution Margin",
    description: "Every action must improve CM or protect survival",
    metrics: ["contributionMargin", "grossMargin", "unitEconomics"],
  },
  {
    step: 2,
    name: "Generate Incremental Free Cash",
    description: "Convert margin improvement into actual cash",
    metrics: ["freeCashFlow", "cashOnHand", "runway"],
  },
  {
    step: 3,
    name: "Reinvest Strategically",
    description: "Only into: conversion, retention, COGS reduction",
    validInvestments: ["conversion", "retention", "cogs_reduction"],
  },
  {
    step: 4,
    name: "Spend More → Stack More Cash",
    description: "Growth should increase cash, not decrease it",
    validation: "newCash > previousCash after spend increase",
  },
  {
    step: 5,
    name: "Use Gains Strategically",
    description: "AP reduction, better financing, growth on our terms",
    uses: ["ap_reduction", "financing_terms", "organic_growth"],
  },
];

// ============ SACRED PARADOX ============

export const SACRED_PARADOX = {
  principle: "Hold contradictions as generative tension",
  paradoxes: [
    { remember: "Accumulate all knowledge", forget: "Empty to receive new truth" },
    { remember: "Master the plan", forget: "Beginner's mind (Shoshin)" },
    { remember: "Know the patterns", forget: "See with fresh eyes" },
    { remember: "Trust the model", forget: "Question the model" },
    { remember: "Have conviction", forget: "Hold loosely" },
  ],
  taoistPrinciples: {
    wuWei: "The master acts without forcing. When grinding, you're probably wrong.",
    yinYang: ["Structure AND flexibility", "Planning AND improvisation", "Speed AND patience"],
    emptyCup: "In the beginner's mind there are many possibilities. In the expert's mind there are few.",
  },
  chaosAsClarity: [
    "Chaos reveals what's fragile",
    "Disorder surfaces what actually matters",
    "Crisis creates clarity that comfort never could",
    "The breakdown is the breakthrough",
  ],
};

// ============ ROLE-BASED CONTEXT ============

export type Department = "exec" | "growth" | "retail" | "finance" | "ops" | "product" | "cx" | "creative";

export interface RoleContext {
  department: Department;
  displayName: string;
  primaryMetrics: string[];
  dailyQuestion: string;
  purposeReminder: string;
  growthGeneratorFocus: number; // Which step they primarily impact
}

export const ROLE_CONTEXTS: Record<Department, RoleContext> = {
  exec: {
    department: "exec",
    displayName: "Executive",
    primaryMetrics: ["runway", "contributionMargin", "revenue", "apStatus"],
    dailyQuestion: "What's the ONE decision today that moves us from Stabilize to Thrive?",
    purposeReminder: "You're building a $200B company that proves conscious capitalism wins.",
    growthGeneratorFocus: 1,
  },
  growth: {
    department: "growth",
    displayName: "Growth",
    primaryMetrics: ["cac", "roas", "conversionRate", "ltv"],
    dailyQuestion: "How can we improve conversion without increasing spend?",
    purposeReminder: "Every optimized dollar compounds into human lives improved.",
    growthGeneratorFocus: 3,
  },
  retail: {
    department: "retail",
    displayName: "Retail",
    primaryMetrics: ["velocity", "doorCount", "retailCM", "reorderRate"],
    dailyQuestion: "Which accounts have the highest contribution margin potential?",
    purposeReminder: "Every shelf placement is a chance for someone to feel better.",
    growthGeneratorFocus: 1,
  },
  finance: {
    department: "finance",
    displayName: "Finance",
    primaryMetrics: ["cashOnHand", "ap", "ar", "runway"],
    dailyQuestion: "What's the minimum bridge capital needed to reach self-sustaining?",
    purposeReminder: "Financial clarity enables the mission. Chaos kills it.",
    growthGeneratorFocus: 2,
  },
  ops: {
    department: "ops",
    displayName: "Operations",
    primaryMetrics: ["fulfillmentCost", "inventoryTurns", "leadTime", "cogs"],
    dailyQuestion: "Where can we reduce COGS without sacrificing quality?",
    purposeReminder: "Every efficiency improvement funds another person's wellness journey.",
    growthGeneratorFocus: 3,
  },
  product: {
    department: "product",
    displayName: "Product",
    primaryMetrics: ["nps", "repeatRate", "reviewScore", "skuPerformance"],
    dailyQuestion: "Does this product make someone say 'I'd buy this again'?",
    purposeReminder: "Validation = Flavor + Effect. Never compromise on either.",
    growthGeneratorFocus: 1,
  },
  cx: {
    department: "cx",
    displayName: "Customer Experience",
    primaryMetrics: ["csat", "responseTime", "retentionRate", "churnReasons"],
    dailyQuestion: "What's the #1 reason customers leave, and how do we fix it?",
    purposeReminder: "Every support ticket is someone trusting us with their wellness.",
    growthGeneratorFocus: 3,
  },
  creative: {
    department: "creative",
    displayName: "Creative",
    primaryMetrics: ["adPerformance", "hookRate", "thumbstopRate", "brandSentiment"],
    dailyQuestion: "Does this creative make someone FEEL what BREZ does?",
    purposeReminder: "We're not selling a drink. We're offering a feeling.",
    growthGeneratorFocus: 3,
  },
};

// ============ SUPERMIND FUNCTIONS ============

export interface Insight {
  id: string;
  type: "realization" | "connection" | "prediction" | "warning";
  content: string;
  sources: string[];
  confidence: number;
  createdAt: string;
  department?: Department;
}

export interface Learning {
  id: string;
  session: string;
  pattern: string;
  implication: string;
  addedToRules: boolean;
  createdAt: string;
}

class Supermind {
  private currentPhase: Phase = "stabilize";
  private insights: Insight[] = [];
  private learnings: Learning[] = [];

  // ============ PHASE MANAGEMENT ============

  getCurrentPhase(): PhaseConfig {
    return PHASES[this.currentPhase];
  }

  evaluatePhaseTransition(metrics: {
    dtcImprovement: number;
    apStatus: "outstanding" | "contained" | "resolved";
    cashFlowPositive: boolean;
  }): { shouldTransition: boolean; newPhase?: Phase; reason?: string } {
    if (this.currentPhase === "stabilize") {
      if (metrics.dtcImprovement >= 0.20) {
        return {
          shouldTransition: true,
          newPhase: "thrive",
          reason: "DTC improved 20%+ at same spend - Thrive unlocked!",
        };
      }
    }

    if (this.currentPhase === "thrive") {
      if (metrics.apStatus === "resolved" && metrics.cashFlowPositive) {
        return {
          shouldTransition: true,
          newPhase: "scale",
          reason: "AP resolved + positive cash flow - Scale unlocked!",
        };
      }
    }

    return { shouldTransition: false };
  }

  // ============ DECISION VALIDATION ============

  validateAgainstGoverningPrinciple(decision: {
    description: string;
    expectedCMImpact: number;
    protectsSurvival: boolean;
  }): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (decision.expectedCMImpact < 0 && !decision.protectsSurvival) {
      warnings.push("⚠️ This decision reduces contribution margin without protecting survival");
    }

    if (decision.expectedCMImpact === 0 && !decision.protectsSurvival) {
      warnings.push("⚠️ This decision has neutral CM impact - ensure it serves survival");
    }

    const phase = this.getCurrentPhase();
    if (this.currentPhase === "stabilize" && decision.expectedCMImpact < 0) {
      warnings.push(`⚠️ In Stabilize phase: ${phase.rules[0]}`);
    }

    return {
      valid: decision.expectedCMImpact > 0 || decision.protectsSurvival,
      warnings,
    };
  }

  // ============ GROWTH GENERATOR VALIDATION ============

  validateGrowthGeneratorStep(
    action: string,
    targetStep: number
  ): { valid: boolean; feedback: string } {
    const step = GROWTH_GENERATOR_STEPS[targetStep - 1];

    if (!step) {
      return { valid: false, feedback: "Invalid Growth Generator step" };
    }

    // Step 3 validation - only valid investments
    if (targetStep === 3) {
      const validTypes = step.validInvestments || [];
      const isValid = validTypes.some(type =>
        action.toLowerCase().includes(type.replace("_", " "))
      );

      if (!isValid) {
        return {
          valid: false,
          feedback: `Step 3 investments must be: ${validTypes.join(", ")}`,
        };
      }
    }

    return {
      valid: true,
      feedback: `Aligned with Growth Generator Step ${targetStep}: ${step.name}`,
    };
  }

  // ============ ROLE-BASED RECOMMENDATIONS ============

  getRecommendationsForRole(department: Department, metrics: Record<string, number>): {
    dailyFocus: string;
    topPriorities: string[];
    purposeReminder: string;
    sacredParadox: string;
  } {
    const context = ROLE_CONTEXTS[department];
    const phase = this.getCurrentPhase();

    // Generate role-specific priorities based on phase and metrics
    const topPriorities: string[] = [];

    // Always include phase-relevant priority
    topPriorities.push(`[${phase.displayName}] ${phase.rules[0]}`);

    // Add metric-based priority
    if (department === "growth" && metrics.cac > 55) {
      topPriorities.push("CAC above $55 ceiling - focus on conversion optimization");
    }
    if (department === "finance" && metrics.runway < 6) {
      topPriorities.push("Critical: Runway below 6 weeks - preserve cash");
    }
    if (department === "retail" && metrics.velocity < 2) {
      topPriorities.push("Velocity below target - review underperforming doors");
    }

    // Add Growth Generator focus
    const ggStep = GROWTH_GENERATOR_STEPS[context.growthGeneratorFocus - 1];
    topPriorities.push(`Growth Generator: ${ggStep.name}`);

    // Get random sacred paradox for reflection
    const randomParadox = SACRED_PARADOX.paradoxes[
      Math.floor(Math.random() * SACRED_PARADOX.paradoxes.length)
    ];

    return {
      dailyFocus: context.dailyQuestion,
      topPriorities,
      purposeReminder: context.purposeReminder,
      sacredParadox: `${randomParadox.remember} ↔ ${randomParadox.forget}`,
    };
  }

  // ============ INSIGHT SYNTHESIS ============

  synthesizeInsight(
    sources: string[],
    pattern: string
  ): Insight {
    const insight: Insight = {
      id: `insight-${Date.now()}`,
      type: "realization",
      content: pattern,
      sources,
      confidence: sources.length > 2 ? 0.8 : 0.6,
      createdAt: new Date().toISOString(),
    };

    this.insights.push(insight);
    return insight;
  }

  // ============ LEARNING CAPTURE ============

  captureLearning(pattern: string, implication: string): Learning {
    const learning: Learning = {
      id: `learning-${Date.now()}`,
      session: new Date().toISOString().split("T")[0],
      pattern,
      implication,
      addedToRules: false,
      createdAt: new Date().toISOString(),
    };

    this.learnings.push(learning);
    return learning;
  }

  // ============ PURPOSE REMINDERS ============

  getPurposeReminder(): { quote: string; source: string } {
    const reminders = [
      { quote: NORTH_STAR.purpose, source: "North Star" },
      { quote: NORTH_STAR.coreBeliefs[0], source: "Core Belief" },
      { quote: SACRED_PARADOX.taoistPrinciples.wuWei, source: "Wu Wei" },
      { quote: "We do not invest to grow. We grow so we can invest.", source: "Growth Generator" },
      { quote: "The breakdown is the breakthrough.", source: "Sacred Paradox" },
      { quote: MASTER_GOVERNING_PRINCIPLE, source: "Master Governing Principle" },
    ];

    return reminders[Math.floor(Math.random() * reminders.length)];
  }

  // ============ GAMIFICATION ============

  checkAchievements(metrics: Record<string, number>): string[] {
    const unlocked: string[] = [];

    if (metrics.cashOnHand >= 100000) unlocked.push("💰 Cash Flow I: $100K reserves");
    if (metrics.cashOnHand >= 200000) unlocked.push("💰 Cash Flow II: $200K reserves");
    if (metrics.revenue >= 3500000) unlocked.push("📈 Revenue I: $3.5MM/mo");
    if (metrics.revenue >= 4000000) unlocked.push("📈 Revenue II: $4MM/mo");
    if (metrics.cac < 45) unlocked.push("🎯 Efficiency: CAC < $45");
    if (metrics.conversionRate >= 0.04) unlocked.push("🔄 Conversion: 4%+ CVR");

    return unlocked;
  }
}

// Export singleton
export const supermind = new Supermind();
