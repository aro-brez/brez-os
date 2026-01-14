/**
 * Retail Velocity Connector
 *
 * Connects to retail data platforms (Crisp, VIP, or similar)
 * Provides: door count, velocity per store, distribution growth
 *
 * Supports multiple providers - configure based on which service you use
 */

export type RetailDataProvider = 'crisp' | 'vip' | 'manual';

export interface RetailCredentials {
  provider: RetailDataProvider;
  apiKey?: string;
  companyId?: string;
}

export interface RetailAccount {
  id: string;
  name: string;
  retailer: string;
  region: string;
  doorCount: number;
  weeklyVelocity: number;      // Units per door per week
  totalWeeklyUnits: number;    // doorCount × weeklyVelocity
  lastOrderDate: string;
  status: 'active' | 'at_risk' | 'inactive';
  trend: 'up' | 'down' | 'flat';
}

export interface RetailSummary {
  totalDoors: number;
  totalWeeklyUnits: number;
  avgVelocityPerDoor: number;
  activeAccounts: number;
  atRiskAccounts: number;
  revenueRun: number;          // Estimated monthly retail revenue
}

export interface RetailVelocityMetrics {
  summary: RetailSummary;
  topAccounts: RetailAccount[];
  atRiskAccounts: RetailAccount[];
  byRetailer: Record<string, { doors: number; velocity: number; revenue: number }>;
  trends: {
    doorsChange30d: number;
    velocityChange30d: number;
  };
  connected: boolean;
  lastSync: string;
  provider: RetailDataProvider;
}

// ============ CRISP API ============

const CRISP_API_BASE = 'https://api.gocrisp.com/v1';

interface CrispStoreData {
  store_id: string;
  store_name: string;
  retailer: string;
  region: string;
  units_sold_l4w: number;
  last_scan_date: string;
}

async function fetchCrispData(apiKey: string, companyId: string): Promise<CrispStoreData[]> {
  const response = await fetch(
    `${CRISP_API_BASE}/companies/${companyId}/stores/performance`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch Crisp data');
  }

  const data = await response.json();
  return data.stores || [];
}

function transformCrispData(stores: CrispStoreData[]): RetailAccount[] {
  return stores.map(store => {
    const weeklyVelocity = store.units_sold_l4w / 4; // L4W average
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(store.last_scan_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: 'active' | 'at_risk' | 'inactive' = 'active';
    if (daysSinceLastOrder > 30) status = 'inactive';
    else if (daysSinceLastOrder > 14 || weeklyVelocity < 1) status = 'at_risk';

    return {
      id: store.store_id,
      name: store.store_name,
      retailer: store.retailer,
      region: store.region,
      doorCount: 1, // Crisp is per-store
      weeklyVelocity,
      totalWeeklyUnits: weeklyVelocity,
      lastOrderDate: store.last_scan_date,
      status,
      trend: 'flat', // Would need historical data to determine
    };
  });
}

// ============ VIP API ============
// Placeholder - implement based on actual VIP API docs

async function fetchVIPData(apiKey: string): Promise<RetailAccount[]> {
  // VIP API integration would go here
  console.log('VIP integration pending', apiKey);
  throw new Error('VIP integration not yet implemented');
}

// ============ MANUAL DATA ============

let manualRetailData: RetailAccount[] = [];

export function setManualRetailData(accounts: RetailAccount[]): void {
  manualRetailData = accounts;
}

export function getManualRetailData(): RetailAccount[] {
  return manualRetailData;
}

// ============ CORE FUNCTIONS ============

/**
 * Validate retail credentials
 */
export async function validateRetailCredentials(
  creds: RetailCredentials
): Promise<{ valid: boolean; error?: string }> {
  if (creds.provider === 'manual') {
    return { valid: true };
  }

  if (!creds.apiKey) {
    return { valid: false, error: 'API key required' };
  }

  if (creds.provider === 'crisp') {
    if (!creds.companyId) {
      return { valid: false, error: 'Company ID required for Crisp' };
    }
    try {
      await fetchCrispData(creds.apiKey, creds.companyId);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  if (creds.provider === 'vip') {
    try {
      await fetchVIPData(creds.apiKey);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  return { valid: false, error: 'Unknown provider' };
}

/**
 * Calculate summary from accounts
 */
function calculateSummary(accounts: RetailAccount[], pricePerUnit: number = 4.50): RetailSummary {
  const activeAccounts = accounts.filter(a => a.status !== 'inactive');

  const totalDoors = activeAccounts.reduce((sum, a) => sum + a.doorCount, 0);
  const totalWeeklyUnits = activeAccounts.reduce((sum, a) => sum + a.totalWeeklyUnits, 0);

  return {
    totalDoors,
    totalWeeklyUnits,
    avgVelocityPerDoor: totalDoors > 0 ? totalWeeklyUnits / totalDoors : 0,
    activeAccounts: activeAccounts.filter(a => a.status === 'active').length,
    atRiskAccounts: activeAccounts.filter(a => a.status === 'at_risk').length,
    revenueRun: totalWeeklyUnits * 4 * pricePerUnit, // Monthly estimate
  };
}

/**
 * Group accounts by retailer
 */
function groupByRetailer(
  accounts: RetailAccount[],
  pricePerUnit: number = 4.50
): Record<string, { doors: number; velocity: number; revenue: number }> {
  const groups: Record<string, { doors: number; velocity: number; revenue: number }> = {};

  for (const account of accounts) {
    if (!groups[account.retailer]) {
      groups[account.retailer] = { doors: 0, velocity: 0, revenue: 0 };
    }
    groups[account.retailer].doors += account.doorCount;
    groups[account.retailer].velocity += account.totalWeeklyUnits;
    groups[account.retailer].revenue += account.totalWeeklyUnits * 4 * pricePerUnit;
  }

  return groups;
}

/**
 * Get complete retail velocity metrics
 */
export async function getRetailVelocityMetrics(
  creds: RetailCredentials,
  pricePerUnit: number = 4.50
): Promise<RetailVelocityMetrics> {
  let accounts: RetailAccount[] = [];

  if (creds.provider === 'manual') {
    accounts = manualRetailData;
  } else if (creds.provider === 'crisp' && creds.apiKey && creds.companyId) {
    const crispData = await fetchCrispData(creds.apiKey, creds.companyId);
    accounts = transformCrispData(crispData);
  } else if (creds.provider === 'vip' && creds.apiKey) {
    accounts = await fetchVIPData(creds.apiKey);
  }

  // Sort for top and at-risk lists
  const sortedByVelocity = [...accounts].sort((a, b) => b.totalWeeklyUnits - a.totalWeeklyUnits);
  const atRisk = accounts.filter(a => a.status === 'at_risk').sort((a, b) => b.totalWeeklyUnits - a.totalWeeklyUnits);

  return {
    summary: calculateSummary(accounts, pricePerUnit),
    topAccounts: sortedByVelocity.slice(0, 10),
    atRiskAccounts: atRisk.slice(0, 10),
    byRetailer: groupByRetailer(accounts, pricePerUnit),
    trends: {
      doorsChange30d: 0,      // Would need historical data
      velocityChange30d: 0,   // Would need historical data
    },
    connected: accounts.length > 0,
    lastSync: new Date().toISOString(),
    provider: creds.provider,
  };
}

/**
 * Fallback metrics when not connected
 */
export function getRetailVelocityFallback(): RetailVelocityMetrics {
  return {
    summary: {
      totalDoors: 0,
      totalWeeklyUnits: 0,
      avgVelocityPerDoor: 0,
      activeAccounts: 0,
      atRiskAccounts: 0,
      revenueRun: 0,
    },
    topAccounts: [],
    atRiskAccounts: [],
    byRetailer: {},
    trends: {
      doorsChange30d: 0,
      velocityChange30d: 0,
    },
    connected: false,
    lastSync: '',
    provider: 'manual',
  };
}

/**
 * Import retail data from CSV
 * Expected columns: name, retailer, region, doors, weekly_velocity
 */
export function importRetailFromCSV(csvData: string): RetailAccount[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('account'));
  const retailerIdx = headers.findIndex(h => h.includes('retailer') || h.includes('chain'));
  const regionIdx = headers.findIndex(h => h.includes('region') || h.includes('area'));
  const doorsIdx = headers.findIndex(h => h.includes('door') || h.includes('store'));
  const velocityIdx = headers.findIndex(h => h.includes('velocity') || h.includes('units'));

  const accounts: RetailAccount[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (!values[nameIdx]) continue;

    const doorCount = parseInt(values[doorsIdx]) || 1;
    const weeklyVelocity = parseFloat(values[velocityIdx]) || 0;

    accounts.push({
      id: `csv-${i}`,
      name: values[nameIdx],
      retailer: values[retailerIdx] || 'Unknown',
      region: values[regionIdx] || 'Unknown',
      doorCount,
      weeklyVelocity,
      totalWeeklyUnits: doorCount * weeklyVelocity,
      lastOrderDate: new Date().toISOString().split('T')[0],
      status: weeklyVelocity > 1 ? 'active' : weeklyVelocity > 0 ? 'at_risk' : 'inactive',
      trend: 'flat',
    });
  }

  return accounts;
}
