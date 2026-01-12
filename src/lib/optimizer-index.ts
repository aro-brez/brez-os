// =============================================================================
// BREZ OPTIMIZER - Main Entry Point
// =============================================================================
// Import this file to access the auto-optimization system
//
// Usage:
//   import { runAutoOptimization, getOptimizationSummary } from '@/lib/optimizer-index';
//
//   // Get full optimization result (for programmatic use)
//   const result = runAutoOptimization();
//
//   // Get formatted summary (for display)
//   const summary = getOptimizationSummary();
//
// =============================================================================

// Core optimizer functions
export {
  runAutoOptimization,
  getOptimizationSummary,
  type OptimizationResult,
  type CurrentState,
  type OptimizedRecommendation,
  type ProjectedImpact,
} from './auto-optimizer';

// Data intake - for updating data
export {
  ADS_BY_PLATFORM,
  RETAILER_VELOCITY,
  COGS_CHANGES,
  INVENTORY_DYNAMICS,
  WEEKLY_CM_DOLLARS,
  VALIDATION_STATUS,
  validateAllData,
} from './data/data-intake';

// Source of truth - for reference
export {
  GROWTH_GENERATOR,
  UNIT_ECONOMICS,
  CASH_POSITION,
} from './data/source-of-truth';

// =============================================================================
// QUICK ACCESS FUNCTIONS
// =============================================================================

import { runAutoOptimization as _runOptimization } from './auto-optimizer';
import { VALIDATION_STATUS as _validationStatus } from './data/data-intake';

/**
 * Get quick status of the optimization system
 */
export function getQuickStatus() {
  const result = _runOptimization();

  return {
    confidence: result.confidence,
    dataHealth: result.currentState.dataHealth,
    topRecommendation: result.optimizedRecommendation.spendReallocation?.action
      ?? result.optimizedRecommendation.spendLevel.rationale,
    projectedWeeklyCMGain: result.projectedImpact.weekly.deltaCMDollars,
    dataNeeded: result.optimizedRecommendation.dataRequests.length,
  };
}

/**
 * Check if data needs updating
 */
export function getDataFreshness() {
  return _validationStatus.current.map(v => ({
    source: v.source,
    status: v.status,
    daysSinceUpdate: v.staleDays,
  }));
}

/**
 * Get the single most impactful recommendation
 */
export function getOneThingToDo() {
  const result = _runOptimization();
  const rec = result.optimizedRecommendation;

  // Priority: spend reallocation > spend level > CAC adjustment
  if (rec.spendReallocation && rec.spendReallocation.expectedAdditionalCustomers > 50) {
    return {
      action: rec.spendReallocation.action,
      impact: `+${rec.spendReallocation.expectedAdditionalCustomers} customers/week`,
      owner: 'David (Ads)',
    };
  }

  if (Math.abs(rec.spendLevel.recommended - rec.spendLevel.current) > 10000) {
    const direction = rec.spendLevel.recommended > rec.spendLevel.current ? 'Increase' : 'Decrease';
    const delta = Math.abs(rec.spendLevel.recommended - rec.spendLevel.current);
    return {
      action: `${direction} weekly spend by $${delta.toLocaleString()}`,
      impact: `+$${result.projectedImpact.weekly.deltaCMDollars.toLocaleString()} CM$/week`,
      owner: 'David (Ads)',
    };
  }

  // Default: focus on data freshness
  const staleData = result.optimizedRecommendation.dataRequests[0];
  if (staleData) {
    return {
      action: `Update ${staleData.split(':')[0]} data`,
      impact: 'Improve recommendation confidence',
      owner: 'Brittani',
    };
  }

  return {
    action: 'Hold steady - current strategy is optimal',
    impact: 'Maintain current trajectory',
    owner: 'All',
  };
}
