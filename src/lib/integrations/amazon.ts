/**
 * Amazon Integration - Real-time data fetching
 * Pulls: Revenue, Orders, FBA/FBM metrics, Inventory
 *
 * Uses Amazon SP-API (Selling Partner API)
 * Docs: https://developer-docs.amazon.com/sp-api/
 */

export interface AmazonMetrics {
  revenue: {
    today: number;
    yesterday: number;
    last7Days: number;
    last30Days: number;
    mtd: number;
  };
  orders: {
    today: number;
    last7Days: number;
    last30Days: number;
    aov: number;
  };
  channels: {
    fba: {
      revenue: number;
      orders: number;
      margin: number; // 36% per source-of-truth
    };
    fbm: {
      revenue: number;
      orders: number;
      margin: number; // 25% per source-of-truth
    };
  };
  inventory: {
    fbaUnitsAvailable: number;
    fbaUnitsInbound: number;
    lowStockSkus: string[];
  };
  advertising: {
    spend: number;
    sales: number;
    acos: number; // Advertising Cost of Sales
    roas: number;
  };
  lastUpdated: string;
  dataSource: "amazon";
}

// Amazon SP-API client
class AmazonClient {
  private sellerId: string;
  private marketplaceId: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.sellerId = process.env.AMAZON_SELLER_ID || "";
    this.marketplaceId = process.env.AMAZON_MARKETPLACE_ID || "ATVPDKIKX0DER"; // US marketplace
    this.refreshToken = process.env.AMAZON_REFRESH_TOKEN || "";
    this.clientId = process.env.AMAZON_CLIENT_ID || "";
    this.clientSecret = process.env.AMAZON_CLIENT_SECRET || "";
  }

  // Get LWA (Login with Amazon) access token
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch("https://api.amazon.com/auth/o2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Amazon auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in - 60) * 1000; // Refresh 60s early
    return this.accessToken!;
  }

  // Generic SP-API request
  private async spApiRequest(endpoint: string, params: Record<string, string> = {}) {
    const token = await this.getAccessToken();
    const url = new URL(`https://sellingpartnerapi-na.amazon.com${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      headers: {
        "x-amz-access-token": token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Amazon SP-API error: ${response.status}`);
    }
    return response.json();
  }

  // Get orders for date range
  async getOrders(createdAfter: string, createdBefore?: string) {
    const params: Record<string, string> = {
      MarketplaceIds: this.marketplaceId,
      CreatedAfter: createdAfter,
    };
    if (createdBefore) params.CreatedBefore = createdBefore;

    return this.spApiRequest("/orders/v0/orders", params);
  }

  // Get FBA inventory summary
  async getFbaInventory() {
    return this.spApiRequest("/fba/inventory/v1/summaries", {
      granularityType: "Marketplace",
      granularityId: this.marketplaceId,
      marketplaceIds: this.marketplaceId,
    });
  }

  // Get sales metrics from Reports API
  async getSalesReport(reportType: string, dataStartTime: string, dataEndTime: string) {
    // Create report
    const createResponse = await fetch(
      "https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports",
      {
        method: "POST",
        headers: {
          "x-amz-access-token": await this.getAccessToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
          dataStartTime,
          dataEndTime,
          marketplaceIds: [this.marketplaceId],
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error(`Report creation failed: ${createResponse.status}`);
    }

    return createResponse.json();
  }
}

// Date helpers
function getDateRange(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function startOfToday(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function startOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

// Main fetch function
export async function fetchAmazonMetrics(): Promise<AmazonMetrics> {
  const client = new AmazonClient();

  try {
    // Fetch orders for different time ranges
    const [todayOrders, last7DaysOrders, last30DaysOrders, mtdOrders] = await Promise.all([
      client.getOrders(startOfToday()),
      client.getOrders(getDateRange(7)),
      client.getOrders(getDateRange(30)),
      client.getOrders(startOfMonth()),
    ]);

    // Define order type
    type AmazonOrder = {
      OrderTotal?: { Amount?: string };
      FulfillmentChannel?: string;
      PurchaseDate?: string;
    };

    // Calculate metrics
    const calcRevenue = (orders: AmazonOrder[]) =>
      orders.reduce((sum, o) => sum + parseFloat(o.OrderTotal?.Amount || "0"), 0);

    const calcAOV = (orders: AmazonOrder[]) =>
      orders.length > 0 ? calcRevenue(orders) / orders.length : 0;

    // Split by fulfillment channel
    const splitByChannel = (orders: AmazonOrder[]) => {
      const fba = orders.filter((o) => o.FulfillmentChannel === "AFN");
      const fbm = orders.filter((o) => o.FulfillmentChannel === "MFN");
      return { fba, fbm };
    };

    const todayData = todayOrders.Orders || [];
    const last7Data = last7DaysOrders.Orders || [];
    const last30Data = last30DaysOrders.Orders || [];
    const mtdData = mtdOrders.Orders || [];

    // Yesterday's orders
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayOrders = last7Data.filter((o: AmazonOrder) => {
      const created = new Date(o.PurchaseDate || "");
      return created >= yesterdayStart && created <= yesterdayEnd;
    });

    // Channel breakdown for last 30 days
    const { fba, fbm } = splitByChannel(last30Data);

    // FBA inventory (separate call)
    const inventory = { fbaUnitsAvailable: 0, fbaUnitsInbound: 0, lowStockSkus: [] as string[] };
    try {
      const invResponse = await client.getFbaInventory();
      const summaries = invResponse.inventorySummaries || [];
      inventory.fbaUnitsAvailable = summaries.reduce(
        (sum: number, s: { totalQuantity?: number }) => sum + (s.totalQuantity || 0),
        0
      );
    } catch {
      // Inventory fetch optional - continue without
    }

    return {
      revenue: {
        today: calcRevenue(todayData),
        yesterday: calcRevenue(yesterdayOrders),
        last7Days: calcRevenue(last7Data),
        last30Days: calcRevenue(last30Data),
        mtd: calcRevenue(mtdData),
      },
      orders: {
        today: todayData.length,
        last7Days: last7Data.length,
        last30Days: last30Data.length,
        aov: calcAOV(last30Data),
      },
      channels: {
        fba: {
          revenue: calcRevenue(fba),
          orders: fba.length,
          margin: 0.36, // From source-of-truth.ts
        },
        fbm: {
          revenue: calcRevenue(fbm),
          orders: fbm.length,
          margin: 0.25, // From source-of-truth.ts
        },
      },
      inventory,
      advertising: {
        spend: 0, // Requires separate Advertising API
        sales: 0,
        acos: 0,
        roas: 0,
      },
      lastUpdated: new Date().toISOString(),
      dataSource: "amazon",
    };
  } catch (error) {
    console.error("Amazon fetch error:", error);
    // Return fallback with zeros
    return {
      revenue: { today: 0, yesterday: 0, last7Days: 0, last30Days: 0, mtd: 0 },
      orders: { today: 0, last7Days: 0, last30Days: 0, aov: 0 },
      channels: {
        fba: { revenue: 0, orders: 0, margin: 0.36 },
        fbm: { revenue: 0, orders: 0, margin: 0.25 },
      },
      inventory: { fbaUnitsAvailable: 0, fbaUnitsInbound: 0, lowStockSkus: [] },
      advertising: { spend: 0, sales: 0, acos: 0, roas: 0 },
      lastUpdated: new Date().toISOString(),
      dataSource: "amazon",
    };
  }
}

// Cached fetch with TTL
let cachedMetrics: AmazonMetrics | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAmazonMetrics(): Promise<AmazonMetrics> {
  const now = Date.now();
  if (cachedMetrics && now - cacheTime < CACHE_TTL) {
    return cachedMetrics;
  }
  cachedMetrics = await fetchAmazonMetrics();
  cacheTime = now;
  return cachedMetrics;
}

/**
 * Calculate blended Amazon contribution margin
 * Uses FBA (36%) and FBM (25%) margins weighted by revenue
 */
export function calculateAmazonCM(metrics: AmazonMetrics): number {
  const totalRevenue = metrics.channels.fba.revenue + metrics.channels.fbm.revenue;
  if (totalRevenue === 0) return 0;

  const weightedCM =
    (metrics.channels.fba.revenue * metrics.channels.fba.margin +
      metrics.channels.fbm.revenue * metrics.channels.fbm.margin) /
    totalRevenue;

  return weightedCM;
}
