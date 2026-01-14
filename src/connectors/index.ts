/**
 * BREZ Connector Hub
 *
 * Coordinates all data source integrations:
 * - Shopify: DTC orders, subscriptions, customer data
 * - QuickBooks: Cash position, AP/AR, payroll, expenses
 * - Meta Ads: Spend, CAC, ROAS (real API integration)
 * - Google Sheets: Working capital from cash flow spreadsheet
 * - Retail Velocity: Door count, velocity from Crisp/VIP
 *
 * Each connector provides:
 * - Real API integration when credentials available
 * - Fallback data for development/demo
 * - Validation functions for credentials
 */

export * from "./shopify";
export * from "./quickbooks";
export * from "./ads";
export * from "./retail";
export * from "./meta-ads";
export * from "./google-sheets";
export * from "./retail-velocity";

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
  googleSheets: ConnectorStatus;
  retailVelocity: ConnectorStatus;
  klaviyo: ConnectorStatus;
}

/**
 * Get status of all connectors
 * Checks environment for credentials and returns connection status
 */
export function getConnectorStatus(): AllConnectorsStatus {
  const hasMetaToken = !!process.env.META_ADS_ACCESS_TOKEN;
  const hasShopify = !!process.env.SHOPIFY_ACCESS_TOKEN;
  const hasQuickBooks = !!process.env.QUICKBOOKS_ACCESS_TOKEN;
  const hasGoogleSheets = !!process.env.GOOGLE_SHEETS_API_KEY || !!process.env.GOOGLE_SHEETS_ACCESS_TOKEN;
  const hasKlaviyo = !!process.env.KLAVIYO_API_KEY;
  const hasCrisp = !!process.env.CRISP_API_KEY;

  return {
    shopify: {
      name: "Shopify",
      connected: hasShopify,
      error: hasShopify ? undefined : "Add SHOPIFY_ACCESS_TOKEN to connect",
    },
    quickbooks: {
      name: "QuickBooks Online",
      connected: hasQuickBooks,
      error: hasQuickBooks ? undefined : "Add QUICKBOOKS_ACCESS_TOKEN to connect",
    },
    metaAds: {
      name: "Meta Ads",
      connected: hasMetaToken,
      error: hasMetaToken ? undefined : "Add META_ADS_ACCESS_TOKEN and META_AD_ACCOUNT_ID to connect",
    },
    googleAds: {
      name: "Google Ads",
      connected: false,
      error: "Coming soon",
    },
    googleSheets: {
      name: "Google Sheets (Cash Flow)",
      connected: hasGoogleSheets,
      error: hasGoogleSheets ? undefined : "Add GOOGLE_SHEETS_API_KEY and CASH_FLOW_SHEET_ID to connect",
    },
    retailVelocity: {
      name: "Retail Velocity (Crisp/VIP)",
      connected: hasCrisp,
      error: hasCrisp ? undefined : "Add CRISP_API_KEY or use CSV upload",
    },
    klaviyo: {
      name: "Klaviyo",
      connected: hasKlaviyo,
      error: hasKlaviyo ? undefined : "Add KLAVIYO_API_KEY to connect",
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
