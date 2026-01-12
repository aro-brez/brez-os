/**
 * V2 Connector Hub
 *
 * This module will coordinate all data source integrations:
 * - Shopify: DTC orders, subscriptions, customer data
 * - QuickBooks: Cash position, AP/AR, payroll, expenses
 * - Meta/Google Ads: Spend and CAC data
 * - Retail: Velocity and distribution data
 *
 * V1 Status: All connectors are stubs using CSV upload as fallback
 * V2 Roadmap:
 * 1. Implement Shopify OAuth and order sync
 * 2. Add QuickBooks integration for cash tracking
 * 3. Connect ad platforms for spend/CAC automation
 * 4. Add retail data provider integrations
 */

export * from "./shopify";
export * from "./quickbooks";
export * from "./ads";
export * from "./retail";

export interface ConnectorStatus {
  name: string;
  connected: boolean;
  lastSync?: string;
  error?: string;
}

export interface AllConnectorsStatus {
  shopify: ConnectorStatus;
  quickbooks: ConnectorStatus;
  metaAds: ConnectorStatus;
  googleAds: ConnectorStatus;
  retail: ConnectorStatus;
}

/**
 * Get status of all connectors
 * TODO: Implement actual connection status checks
 */
export function getConnectorStatus(): AllConnectorsStatus {
  return {
    shopify: {
      name: "Shopify",
      connected: false,
      error: "Not implemented - V2 feature",
    },
    quickbooks: {
      name: "QuickBooks Online",
      connected: false,
      error: "Not implemented - V2 feature",
    },
    metaAds: {
      name: "Meta Ads",
      connected: false,
      error: "Not implemented - V2 feature",
    },
    googleAds: {
      name: "Google Ads",
      connected: false,
      error: "Not implemented - V2 feature",
    },
    retail: {
      name: "Retail Data",
      connected: false,
      error: "Using CSV upload (V1 mode)",
    },
  };
}

/**
 * Sync all connected data sources
 * TODO: Implement parallel sync with error handling
 */
export async function syncAllConnectors(): Promise<{
  success: boolean;
  results: Record<string, { synced: boolean; records?: number; error?: string }>;
}> {
  return {
    success: false,
    results: {
      shopify: { synced: false, error: "Not implemented" },
      quickbooks: { synced: false, error: "Not implemented" },
      metaAds: { synced: false, error: "Not implemented" },
      googleAds: { synced: false, error: "Not implemented" },
      retail: { synced: false, error: "Using CSV upload" },
    },
  };
}
