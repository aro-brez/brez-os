// =============================================================================
// BREZ AUTO-OPTIMIZER
// =============================================================================
// Automatically generates optimized recommendations when data is updated
// Shows: Current State → Optimized Recommendation → Projected Impact
//
// This is the brain of the Growth Generator
// =============================================================================

import {
  ADS_BY_PLATFORM,
  RETAILER_VELOCITY,
  COGS_CHANGES,
  INVENTORY_DYNAMICS,
  WEEKLY_CM_DOLLARS,
  VALIDATION_STATUS,
} from './data/data-intake';

import {
  UNIT_ECONOMICS,
  CASH_POSITION,
  GROWTH_GENERATOR,
} from './data/source-of-truth';

// =============================================================================
// TYPES
// =============================================================================

export interface CurrentState {
  timestamp: string;
  dataHealth: 'healthy' | 'acceptable' | 'needs_attention' | 'critical';

  // DTC Metrics
  dtc: {
    weeklySpend: number;
    blendedCAC: number;
    bestPlatformCAC: { platform: string; cac: number };
    worstPlatformCAC: { platform: string; cac: number };
    cmPercent: number;
    weeklyNewCustomers: number;
    weeklyCMDollars: number;
  };

  // Retail Metrics
  retail: {
    weeklyVelocity: number;
    alphaLow: number;
    alphaHigh: number;
    topRetailer: { name: string; velocityPerDoor: number };
    totalDoors: number;
  };

  // Inventory & Cash
  inventory: {
    criticalSkus: string[];
    avgWeeksOnHand: number;
    nextProductionCash: { date: string; amount: number };
  };

  cash: {
    onHand: number;
    weeklyBurn: number;
    runwayWeeks: number;
  };
}

export interface OptimizedRecommendation {
  timestamp: string;

  // Spend Reallocation
  spendReallocation: {
    action: string;
    from: { platform: string; currentSpend: number; currentCAC: number };
    to: { platform: string; currentSpend: number; currentCAC: number };
    shiftAmount: number;
    expectedCACImprovement: number;
    expectedAdditionalCustomers: number;
  } | null;

  // CAC Target
  cacTarget: {
    current: number;
    recommended: number;
    rationale: string;
  };

  // Spend Level
  spendLevel: {
    current: number;
    recommended: number;
    rationale: string;
  };

  // Retail Focus
  retailFocus: {
    action: string;
    topPerformers: string[];
    underperformers: string[];
    alphaScenario: 'low' | 'high';
  };

  // Inventory Actions
  inventoryActions: {
    urgentOrders: string[];
    canDefer: string[];
  };

  // Data Requests
  dataRequests: string[];
}

export interface ProjectedImpact {
  // Weekly projections
  weekly: {
    currentCMDollars: number;
    projectedCMDollars: number;
    deltaCMDollars: number;
    deltaPercent: number;
  };

  // Monthly projections (4 weeks)
  monthly: {
    currentCMDollars: number;
    projectedCMDollars: number;
    deltaCMDollars: number;
  };

  // Key metrics change
  metrics: {
    cacChange: number;
    newCustomersChange: number;
    retailVelocityChange: number;
  };

  // Risk assessment
  risk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

export interface OptimizationResult {
  currentState: CurrentState;
  optimizedRecommendation: OptimizedRecommendation;
  projectedImpact: ProjectedImpact;
  confidence: number; // 0-100 based on data freshness
  lastCalculated: string;
}

// =============================================================================
// MAIN AUTO-OPTIMIZER
// =============================================================================

export function runAutoOptimization(): OptimizationResult {
  const now = new Date().toISOString();

  // Get current state from all data sources
  const currentState = calculateCurrentState();

  // Generate optimized recommendations
  const optimizedRecommendation = generateOptimizedRecommendation(currentState);

  // Project impact of recommendations
  const projectedImpact = projectImpact(currentState, optimizedRecommendation);

  // Calculate confidence based on data freshness
  const confidence = calculateConfidence();

  return {
    currentState,
    optimizedRecommendation,
    projectedImpact,
    confidence,
    lastCalculated: now,
  };
}

// =============================================================================
// CALCULATE CURRENT STATE
// =============================================================================

function calculateCurrentState(): CurrentState {
  const adsTotals = ADS_BY_PLATFORM.totals;
  const retailTotals = RETAILER_VELOCITY.totals;
  const cmData = WEEKLY_CM_DOLLARS.trailing4WeekAvg;

  // Find best/worst platform by CAC
  const platforms = [
    { name: 'Meta', ...ADS_BY_PLATFORM.meta },
    { name: 'Google', ...ADS_BY_PLATFORM.google },
    { name: 'AppLovin', ...ADS_BY_PLATFORM.appLovin },
    { name: 'TikTok Shop', ...ADS_BY_PLATFORM.tikTokShop },
  ].sort((a, b) => a.cac - b.cac);

  const bestPlatform = platforms[0];
  const worstPlatform = platforms[platforms.length - 1];

  // Find top retailer by velocity per door
  const topRetailer = [...RETAILER_VELOCITY.retailers].sort(
    (a, b) => b.velocityPerDoor - a.velocityPerDoor
  )[0];

  // Calculate cash runway
  const weeklyBurn = CASH_POSITION.weeklyFixedOpex.totalMonthly / 4.33;

  // Get next production payment
  const nextPayment = INVENTORY_DYNAMICS.productionPayments
    .flatMap(p => [p.payment1, p.payment2])
    .filter(p => new Date(p.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  return {
    timestamp: new Date().toISOString(),
    dataHealth: VALIDATION_STATUS.overallHealth,

    dtc: {
      weeklySpend: adsTotals.spend,
      blendedCAC: adsTotals.blendedCAC,
      bestPlatformCAC: { platform: bestPlatform.name, cac: bestPlatform.cac },
      worstPlatformCAC: { platform: worstPlatform.name, cac: worstPlatform.cac },
      cmPercent: UNIT_ECONOMICS.margins.dtc.contributionMarginActual,
      weeklyNewCustomers: adsTotals.newCustomers,
      weeklyCMDollars: cmData?.avgTotalCM ?? 0,
    },

    retail: {
      weeklyVelocity: retailTotals.weeklyRevenue,
      alphaLow: RETAILER_VELOCITY.lowScenario.alpha,
      alphaHigh: RETAILER_VELOCITY.highScenario.alpha,
      topRetailer: { name: topRetailer.name, velocityPerDoor: topRetailer.velocityPerDoor },
      totalDoors: retailTotals.totalDoors,
    },

    inventory: {
      criticalSkus: INVENTORY_DYNAMICS.criticalSkus.map(s => s.name),
      avgWeeksOnHand: INVENTORY_DYNAMICS.burnRates.reduce((sum, s) => sum + s.weeksOnHand, 0) /
        INVENTORY_DYNAMICS.burnRates.length,
      nextProductionCash: nextPayment
        ? { date: nextPayment.dueDate, amount: nextPayment.amount }
        : { date: 'None scheduled', amount: 0 },
    },

    cash: {
      onHand: CASH_POSITION.cashOnHand,
      weeklyBurn,
      runwayWeeks: Math.floor((CASH_POSITION.cashOnHand - CASH_POSITION.minimumReserve) / weeklyBurn),
    },
  };
}

// =============================================================================
// GENERATE OPTIMIZED RECOMMENDATION
// =============================================================================

function generateOptimizedRecommendation(current: CurrentState): OptimizedRecommendation {
  const dataRequests: string[] = [];

  // Check validation status for data requests
  const validation = VALIDATION_STATUS.current;
  validation.forEach(v => {
    if (v.status !== 'valid') {
      dataRequests.push(`${v.source}: ${v.message}`);
    }
  });

  // Strategy: CM$ over CM% (Dan's guidance)
  const strategy = GROWTH_GENERATOR.strategy;

  // 1. SPEND REALLOCATION
  // Find opportunity to shift from worst to best platform
  const platforms = [
    { name: 'Meta', ...ADS_BY_PLATFORM.meta },
    { name: 'Google', ...ADS_BY_PLATFORM.google },
    { name: 'AppLovin', ...ADS_BY_PLATFORM.appLovin },
    { name: 'TikTok Shop', ...ADS_BY_PLATFORM.tikTokShop },
  ].sort((a, b) => a.cac - b.cac);

  const bestPlatform = platforms[0];
  const worstPlatform = platforms[platforms.length - 1];

  let spendReallocation = null;
  if (worstPlatform.cac > bestPlatform.cac * 1.3) { // 30%+ CAC difference
    const shiftAmount = Math.round(worstPlatform.spend * 0.2); // Shift 20%
    const expectedNewCustomers = Math.round(shiftAmount / bestPlatform.cac);
    const currentCustomers = Math.round(shiftAmount / worstPlatform.cac);

    spendReallocation = {
      action: `Shift 20% from ${worstPlatform.name} to ${bestPlatform.name}`,
      from: {
        platform: worstPlatform.name,
        currentSpend: worstPlatform.spend,
        currentCAC: worstPlatform.cac,
      },
      to: {
        platform: bestPlatform.name,
        currentSpend: bestPlatform.spend,
        currentCAC: bestPlatform.cac,
      },
      shiftAmount,
      expectedCACImprovement: worstPlatform.cac - bestPlatform.cac,
      expectedAdditionalCustomers: expectedNewCustomers - currentCustomers,
    };
  }

  // 2. CAC TARGET
  // Based on cash position and CM$ strategy
  let recommendedCAC = GROWTH_GENERATOR.targets.maxCAC; // $85 aggressive
  let cacRationale = 'Cash healthy - push CAC ceiling for volume. CM$ over CM%.';

  if (current.cash.runwayWeeks < 8) {
    recommendedCAC = 65;
    cacRationale = 'Cash runway tight - moderate CAC to preserve cash.';
  } else if (current.cash.runwayWeeks < 4) {
    recommendedCAC = 55;
    cacRationale = 'Critical cash - conservative CAC only.';
  }

  // 3. SPEND LEVEL
  // Push spend if CAC is below ceiling and CM$ is growing
  const cmTrend = WEEKLY_CM_DOLLARS.trend;
  let recommendedSpend = current.dtc.weeklySpend;
  let spendRationale = 'Maintain current spend level.';

  if (current.dtc.blendedCAC < recommendedCAC * 0.85 && cmTrend !== 'down') {
    recommendedSpend = Math.round(current.dtc.weeklySpend * 1.2); // +20%
    spendRationale = `CAC ($${current.dtc.blendedCAC.toFixed(0)}) well below ceiling ($${recommendedCAC}). Push spend +20% for more CM$.`;
  } else if (current.dtc.blendedCAC > recommendedCAC) {
    recommendedSpend = Math.round(current.dtc.weeklySpend * 0.9); // -10%
    spendRationale = `CAC ($${current.dtc.blendedCAC.toFixed(0)}) above ceiling ($${recommendedCAC}). Optimize before scaling.`;
  }

  // 4. RETAIL FOCUS
  const retailers = [...RETAILER_VELOCITY.retailers].sort(
    (a, b) => b.velocityPerDoor - a.velocityPerDoor
  );
  const topPerformers = retailers.slice(0, 3).map(r => r.name);
  const underperformers = retailers
    .filter(r => r.trend === 'down' || r.velocityPerDoor < 50)
    .map(r => r.name);

  // Use high alpha scenario if CM$ strategy is aggressive
  const alphaScenario = strategy.spendAggressiveness === 'high' ? 'high' : 'low';

  // 5. INVENTORY ACTIONS
  const criticalSkus = INVENTORY_DYNAMICS.criticalSkus;
  const urgentOrders = criticalSkus.filter(s => s.weeksOnHand <= 4).map(s => s.name);
  const canDefer = INVENTORY_DYNAMICS.burnRates
    .filter(s => s.weeksOnHand > 20)
    .map(s => s.name);

  return {
    timestamp: new Date().toISOString(),

    spendReallocation,

    cacTarget: {
      current: current.dtc.blendedCAC,
      recommended: recommendedCAC,
      rationale: cacRationale,
    },

    spendLevel: {
      current: current.dtc.weeklySpend,
      recommended: recommendedSpend,
      rationale: spendRationale,
    },

    retailFocus: {
      action: `Focus on ${alphaScenario} alpha scenario (${alphaScenario === 'high' ? 'sell-thru + wholesale' : 'sell-thru only'})`,
      topPerformers,
      underperformers,
      alphaScenario,
    },

    inventoryActions: {
      urgentOrders,
      canDefer,
    },

    dataRequests,
  };
}

// =============================================================================
// PROJECT IMPACT
// =============================================================================

function projectImpact(
  current: CurrentState,
  recommendation: OptimizedRecommendation
): ProjectedImpact {
  const cmPercent = current.dtc.cmPercent;

  // Calculate current weekly CM$
  const currentWeeklyCM = current.dtc.weeklyCMDollars || current.dtc.weeklySpend * 0.5; // Estimate if no data

  // Project CM$ with recommended changes
  let projectedWeeklyCM = currentWeeklyCM;

  // Impact from spend reallocation
  if (recommendation.spendReallocation) {
    const additionalRevenue =
      recommendation.spendReallocation.expectedAdditionalCustomers * 90; // AOV ~$90
    const additionalCM = additionalRevenue * cmPercent;
    projectedWeeklyCM += additionalCM;
  }

  // Impact from spend level change
  const spendDelta = recommendation.spendLevel.recommended - recommendation.spendLevel.current;
  if (spendDelta > 0) {
    // More spend = more customers = more CM$ (at current CAC)
    const additionalCustomers = spendDelta / current.dtc.blendedCAC;
    const additionalRevenue = additionalCustomers * 90;
    const additionalCM = additionalRevenue * cmPercent;
    projectedWeeklyCM += additionalCM;
  }

  // Calculate deltas
  const deltaWeeklyCM = projectedWeeklyCM - currentWeeklyCM;
  const deltaPercent = ((projectedWeeklyCM - currentWeeklyCM) / currentWeeklyCM) * 100;

  // Monthly projections
  const currentMonthlyCM = currentWeeklyCM * 4.33;
  const projectedMonthlyCM = projectedWeeklyCM * 4.33;

  // Risk assessment
  const riskFactors: string[] = [];
  if (current.cash.runwayWeeks < 8) riskFactors.push('Cash runway below 8 weeks');
  if (current.inventory.criticalSkus.length > 0) riskFactors.push('SKUs at safety stock');
  if (current.dataHealth === 'needs_attention') riskFactors.push('Some data is stale');
  if (recommendation.spendLevel.recommended > current.dtc.weeklySpend * 1.15) {
    riskFactors.push('Aggressive spend increase');
  }

  const riskLevel = riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low';

  return {
    weekly: {
      currentCMDollars: Math.round(currentWeeklyCM),
      projectedCMDollars: Math.round(projectedWeeklyCM),
      deltaCMDollars: Math.round(deltaWeeklyCM),
      deltaPercent: Math.round(deltaPercent * 10) / 10,
    },

    monthly: {
      currentCMDollars: Math.round(currentMonthlyCM),
      projectedCMDollars: Math.round(projectedMonthlyCM),
      deltaCMDollars: Math.round(projectedMonthlyCM - currentMonthlyCM),
    },

    metrics: {
      cacChange: recommendation.cacTarget.recommended - current.dtc.blendedCAC,
      newCustomersChange: recommendation.spendReallocation?.expectedAdditionalCustomers ?? 0,
      retailVelocityChange: 0, // Would need more retail data to project
    },

    risk: {
      level: riskLevel,
      factors: riskFactors,
    },
  };
}

// =============================================================================
// CALCULATE CONFIDENCE
// =============================================================================

function calculateConfidence(): number {
  const summary = VALIDATION_STATUS.summary;

  // Start at 100, deduct for issues
  let confidence = 100;

  // Deduct for stale data
  confidence -= summary.warnings * 10;
  confidence -= summary.errors * 25;

  // Deduct for overall staleness
  if (summary.oldestData > 14) confidence -= 15;
  else if (summary.oldestData > 7) confidence -= 5;

  return Math.max(0, Math.min(100, confidence));
}

// =============================================================================
// FORMATTED OUTPUT FOR UI
// =============================================================================

export function getOptimizationSummary(): string {
  const result = runAutoOptimization();
  const { currentState, optimizedRecommendation, projectedImpact, confidence } = result;

  let summary = `
══════════════════════════════════════════════════════════════
BREZ GROWTH OPTIMIZER - ${new Date().toLocaleDateString()}
Confidence: ${confidence}% | Data Health: ${currentState.dataHealth.toUpperCase()}
══════════════════════════════════════════════════════════════

📊 CURRENT STATE
─────────────────
DTC:
  • Weekly Spend: $${currentState.dtc.weeklySpend.toLocaleString()}
  • Blended CAC: $${currentState.dtc.blendedCAC.toFixed(2)}
  • Best Platform: ${currentState.dtc.bestPlatformCAC.platform} ($${currentState.dtc.bestPlatformCAC.cac.toFixed(2)} CAC)
  • Weekly CM$: $${currentState.dtc.weeklyCMDollars.toLocaleString()}

Retail:
  • Weekly Velocity: $${currentState.retail.weeklyVelocity.toLocaleString()}
  • Alpha Range: ${currentState.retail.alphaLow} - ${currentState.retail.alphaHigh}
  • Top Performer: ${currentState.retail.topRetailer.name} ($${currentState.retail.topRetailer.velocityPerDoor}/door)

Cash:
  • On Hand: $${currentState.cash.onHand.toLocaleString()}
  • Runway: ${currentState.cash.runwayWeeks} weeks

══════════════════════════════════════════════════════════════

🎯 OPTIMIZED RECOMMENDATIONS
─────────────────────────────`;

  if (optimizedRecommendation.spendReallocation) {
    const sr = optimizedRecommendation.spendReallocation;
    summary += `
SPEND SHIFT: ${sr.action}
  • Move $${sr.shiftAmount.toLocaleString()} from ${sr.from.platform} to ${sr.to.platform}
  • Expected: +${sr.expectedAdditionalCustomers} customers at same spend
`;
  }

  summary += `
CAC TARGET: $${optimizedRecommendation.cacTarget.recommended}
  • Current: $${optimizedRecommendation.cacTarget.current.toFixed(2)}
  • ${optimizedRecommendation.cacTarget.rationale}

SPEND LEVEL: $${optimizedRecommendation.spendLevel.recommended.toLocaleString()}/week
  • Current: $${optimizedRecommendation.spendLevel.current.toLocaleString()}/week
  • ${optimizedRecommendation.spendLevel.rationale}

RETAIL: ${optimizedRecommendation.retailFocus.action}
  • Top: ${optimizedRecommendation.retailFocus.topPerformers.join(', ')}
  ${optimizedRecommendation.retailFocus.underperformers.length > 0
    ? `• Watch: ${optimizedRecommendation.retailFocus.underperformers.join(', ')}`
    : ''}

══════════════════════════════════════════════════════════════

📈 PROJECTED IMPACT (If Recommendations Implemented)
────────────────────────────────────────────────────
Weekly CM$:  $${projectedImpact.weekly.currentCMDollars.toLocaleString()} → $${projectedImpact.weekly.projectedCMDollars.toLocaleString()} (${projectedImpact.weekly.deltaPercent > 0 ? '+' : ''}${projectedImpact.weekly.deltaPercent}%)
Monthly CM$: $${projectedImpact.monthly.currentCMDollars.toLocaleString()} → $${projectedImpact.monthly.projectedCMDollars.toLocaleString()} (+$${projectedImpact.monthly.deltaCMDollars.toLocaleString()})

Risk Level: ${projectedImpact.risk.level.toUpperCase()}
${projectedImpact.risk.factors.length > 0 ? `Factors: ${projectedImpact.risk.factors.join(', ')}` : ''}

══════════════════════════════════════════════════════════════
`;

  if (optimizedRecommendation.dataRequests.length > 0) {
    summary += `
⚠️ DATA NEEDED FOR BETTER RECOMMENDATIONS
─────────────────────────────────────────
${optimizedRecommendation.dataRequests.map(r => `• ${r}`).join('\n')}
`;
  }

  return summary;
}
