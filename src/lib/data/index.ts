// =============================================================================
// BREZ DATA LAYER - Main Export
// =============================================================================
// This is the central hub for all data operations.
//
// For Brittani:
//   import { uploadData, getBrittaniDashboard } from '@/lib/data';
//
// For Team Portals:
//   import { renderPortal, getActionCard } from '@/lib/data';
//
// For Optimizer:
//   import { getCurrentState, getOptimizedRecommendation } from '@/lib/data';
// =============================================================================

// KPIs (legacy, excluding UNIT_ECONOMICS - use source-of-truth version)
export {
  CURRENT_KPIS,
  getKPIsByDepartment,
  getKPIsByCategory,
  getKPIsByStatus,
  getCriticalKPIs,
  getWarningKPIs,
  formatKPIValue,
  formatVariance,
  getKPISummary,
} from './kpis';
export type { KPIMetric } from './kpis';

// Retail Goals & COGS
export * from './retail-goals';
export * from './cogs';

// Source of Truth - validated business data
export {
  VALIDATED_METRICS,
  UNIT_ECONOMICS,
  CASH_POSITION,
  INVENTORY,
  PRODUCTION_SCHEDULE,
  AD_SPEND_2025,
  DTC_YTD_2025,
  RETAIL_VELOCITY_2025,
  GROWTH_GENERATOR,
  STABILIZATION_PLAN,
  ORG_CHART,
  TEAM_STRUCTURE,
  CURRENT_STATE,
} from './source-of-truth';

// Memory System - stores all data permanently
export {
  storeUpload,
  getCurrentData,
  getUploadHistory,
  getLearnings,
  testLearning,
  getMemorySummary,
  getStalenessDays,
  needsUpdate,
  DATA_MEMORY,
  UPLOAD_ARCHIVE,
  type DataUpload,
  type LearnedContext,
  type DataCategory,
  type TeamMember,
} from './data-memory';

// Discovery Engine - finds next best data to collect
export {
  getNextRequestForMember,
  getAllRequestsForMember,
  getHighestImpactRequest,
  getBrittaniQueue,
  getDataCollectionProgress,
  generateBrittaniReport,
  ALL_DATA_REQUESTS,
  type DataRequest,
} from './data-discovery';

// Team Portals - personalized views for each team member
export {
  getPortalView,
  renderPortal,
  getActionCard,
  getAllActionCards,
  TEAM_PROFILES,
  type PortalView,
  type TeamMemberProfile,
} from './team-portals';

// Data Intake - where new data gets added
export {
  ADS_BY_PLATFORM,
  RETAILER_VELOCITY,
  COGS_CHANGES,
  INVENTORY_DYNAMICS,
  WEEKLY_CM_DOLLARS,
  VALIDATION_STATUS,
  validateAllData,
} from './data-intake';

// Trademark Portfolio - legal/brand IP data
export {
  REGISTERED_TRADEMARKS,
  PENDING_TRADEMARKS,
  ABANDONED_TRADEMARKS,
  ACQUISITION_TARGETS,
  RECOMMENDED_STRATEGIES,
  COST_SUMMARY,
  DEADLINES,
  USE_LEGEND,
  CONTACTS,
  getTrademarksByStatus,
  getTrademarksByJurisdiction,
  getTotalCostToFight,
  getHighPriorityMarks,
} from './trademark-portfolio';
export type {
  TrademarkStatus,
  RefusalReason,
  Jurisdiction,
  TrademarkRecord,
  AcquisitionTarget,
  TrademarkStrategy,
} from './trademark-portfolio';

// =============================================================================
// CONVENIENCE FUNCTIONS FOR BRITTANI
// =============================================================================

import { storeUpload } from './data-memory';
import type { DataCategory, TeamMember } from './data-memory';
import { generateBrittaniReport, getBrittaniQueue } from './data-discovery';
import { renderPortal } from './team-portals';

/**
 * Quick upload function for Brittani
 * Stores data, archives previous version, extracts learnings
 */
export function uploadData(
  category: DataCategory,
  data: Record<string, unknown>,
  source: TeamMember,
  rawInput?: string
) {
  const upload = storeUpload(category, data, source, 'Brittani', rawInput);

  // Get next action after upload
  const queue = getBrittaniQueue();
  const nextForSource = queue.find(q => q.member === source);

  return {
    success: upload.validated,
    errors: upload.validationErrors,
    version: upload.version,
    nextAction: nextForSource?.request ?? null,
  };
}

/**
 * Get Brittani's full report - what to collect next from everyone
 */
export function getBrittaniDashboard(): string {
  return generateBrittaniReport();
}

/**
 * Get a team member's personalized portal view
 */
export function getTeamMemberView(member: TeamMember): string {
  return renderPortal(member);
}
