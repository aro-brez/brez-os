// Data Layer Exports

// Export from kpis, excluding UNIT_ECONOMICS (use source-of-truth version)
export {
  CURRENT_KPIS,
  getKPIsByDepartment,
  getKPIsByCategory,
  getKPIsByStatus,
  getCriticalKPIs,
  getWarningKPIs,
  formatKPIValue,
  formatVariance,
  getKPISummary
} from './kpis';
export type { KPIMetric } from './kpis';

export * from './retail-goals';
export * from './cogs';
export * from './source-of-truth';
