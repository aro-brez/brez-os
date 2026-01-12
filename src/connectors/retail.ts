/**
 * Retail Velocity Connector Stub (V2)
 *
 * TODO: Implement integrations with retail data sources
 *
 * For now, V1 uses CSV upload. V2 options:
 * - SPINS/IRI data feeds
 * - Retailer portal APIs (where available)
 * - EDI data integration
 * - Manual CSV remains as fallback
 *
 * This connector will:
 * - Fetch sell-through velocity data
 * - Track door counts and distribution
 * - Calculate actual retail alpha coupling
 * - Provide retailer-level breakdowns
 */

export interface RetailDataConfig {
  source: "csv" | "spins" | "iri" | "manual";
  apiKey?: string;
  accountId?: string;
}

export interface RetailVelocityData {
  weekStart: string;
  retailRevenue: number;
  unitsSold: number;
  doorCount: number;
  unitsPerDoorPerWeek: number;
  retailer?: string;
  region?: string;
}

export interface RetailerBreakdown {
  retailer: string;
  doorCount: number;
  weeklyRevenue: number;
  weeklyUnits: number;
  velocityPerDoor: number;
}

export interface AlphaAnalysis {
  measuredAlpha: number;
  correlation: number;
  lagWeeks: number;
  dataPoints: number;
  confidence: "high" | "medium" | "low";
}

/**
 * Initialize retail data source
 * TODO: Support multiple data providers
 */
export async function initRetailSource(
  config: RetailDataConfig
): Promise<boolean> {
  console.log("Retail connector not implemented yet", config);
  throw new Error("Retail connector not implemented - V2 feature");
}

/**
 * Fetch weekly retail velocity
 * TODO: Aggregate from data provider
 */
export async function fetchRetailVelocity(
  config: RetailDataConfig,
  startDate: string,
  endDate: string
): Promise<RetailVelocityData[]> {
  console.log("Fetching retail velocity", config, startDate, endDate);
  throw new Error("Retail connector not implemented - V2 feature");
}

/**
 * Get retailer-level breakdown
 * TODO: Parse and aggregate by retailer
 */
export async function fetchRetailerBreakdown(
  config: RetailDataConfig,
  weekStart: string
): Promise<RetailerBreakdown[]> {
  console.log("Fetching retailer breakdown", config, weekStart);
  throw new Error("Retail connector not implemented - V2 feature");
}

/**
 * Calculate alpha coupling from historical data
 * TODO: Implement regression analysis
 */
export async function calculateAlpha(
  velocityData: RetailVelocityData[],
  adSpendData: { weekStart: string; spend: number }[]
): Promise<AlphaAnalysis> {
  console.log("Calculating alpha", velocityData.length, adSpendData.length);
  throw new Error("Alpha calculation not implemented - V2 feature");
}

/**
 * Project retail DSO (days sales outstanding)
 * TODO: Analyze historical payment patterns
 */
export async function calculateRetailDSO(
  config: RetailDataConfig
): Promise<{
  averageDSOWeeks: number;
  byRetailer: { retailer: string; dsoWeeks: number }[];
}> {
  console.log("Calculating DSO", config);
  throw new Error("DSO calculation not implemented - V2 feature");
}
