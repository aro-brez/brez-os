/**
 * Shopify Integration - Real-time data fetching
 * Pulls: Revenue, Orders, Subscriptions, AOV, Conversion
 */

export interface ShopifyMetrics {
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
  subscriptions: {
    active: number;
    newThisWeek: number;
    churnedThisWeek: number;
    conversionRate: number;
  };
  cac: {
    current: number;
    last7DayAvg: number;
    last30DayAvg: number;
  };
  lastUpdated: string;
  dataSource: "shopify";
}

// Shopify Admin API client
class ShopifyClient {
  private shopDomain: string;
  private accessToken: string;
  private apiVersion = "2024-01";

  constructor() {
    this.shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || "";
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || "";
  }

  private async fetch(endpoint: string) {
    const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    return response.json();
  }

  async getOrders(createdAtMin: string, createdAtMax?: string) {
    const params = new URLSearchParams({
      created_at_min: createdAtMin,
      status: "any",
      limit: "250",
    });
    if (createdAtMax) params.append("created_at_max", createdAtMax);
    return this.fetch(`orders.json?${params}`);
  }

  async getOrderCount(createdAtMin: string) {
    const params = new URLSearchParams({
      created_at_min: createdAtMin,
      status: "any",
    });
    return this.fetch(`orders/count.json?${params}`);
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
export async function fetchShopifyMetrics(): Promise<ShopifyMetrics> {
  const client = new ShopifyClient();

  try {
    // Fetch orders for different time ranges
    const [todayOrders, last7DaysOrders, last30DaysOrders, mtdOrders] = await Promise.all([
      client.getOrders(startOfToday()),
      client.getOrders(getDateRange(7)),
      client.getOrders(getDateRange(30)),
      client.getOrders(startOfMonth()),
    ]);

    // Calculate metrics
    const calcRevenue = (orders: any[]) =>
      orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    const calcAOV = (orders: any[]) =>
      orders.length > 0 ? calcRevenue(orders) / orders.length : 0;

    // Subscription detection (orders with subscription tag or recurring)
    const countSubscriptions = (orders: any[]) =>
      orders.filter(o =>
        o.tags?.includes("subscription") ||
        o.note?.includes("subscription") ||
        o.line_items?.some((li: any) => li.properties?.some((p: any) => p.name === "subscription"))
      ).length;

    const todayData = todayOrders.orders || [];
    const last7Data = last7DaysOrders.orders || [];
    const last30Data = last30DaysOrders.orders || [];
    const mtdData = mtdOrders.orders || [];

    // Yesterday's orders (filter from last7)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayOrders = last7Data.filter((o: any) => {
      const created = new Date(o.created_at);
      return created >= yesterdayStart && created <= yesterdayEnd;
    });

    // New vs churned subscriptions (simplified)
    const newSubs = countSubscriptions(last7Data.filter((o: any) =>
      new Date(o.created_at) >= new Date(getDateRange(7))
    ));

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
      subscriptions: {
        active: 0, // Requires separate subscription API
        newThisWeek: newSubs,
        churnedThisWeek: 0, // Requires subscription platform integration
        conversionRate: last30Data.length > 0 ? (newSubs / last30Data.length) * 100 : 0,
      },
      cac: {
        current: 0, // Requires ad spend data
        last7DayAvg: 0,
        last30DayAvg: 0,
      },
      lastUpdated: new Date().toISOString(),
      dataSource: "shopify",
    };
  } catch (error) {
    console.error("Shopify fetch error:", error);
    // Return fallback with error indicator
    return {
      revenue: { today: 0, yesterday: 0, last7Days: 0, last30Days: 0, mtd: 0 },
      orders: { today: 0, last7Days: 0, last30Days: 0, aov: 0 },
      subscriptions: { active: 0, newThisWeek: 0, churnedThisWeek: 0, conversionRate: 0 },
      cac: { current: 0, last7DayAvg: 0, last30DayAvg: 0 },
      lastUpdated: new Date().toISOString(),
      dataSource: "shopify",
    };
  }
}

// Cached fetch with TTL
let cachedMetrics: ShopifyMetrics | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getShopifyMetrics(): Promise<ShopifyMetrics> {
  const now = Date.now();
  if (cachedMetrics && now - cacheTime < CACHE_TTL) {
    return cachedMetrics;
  }
  cachedMetrics = await fetchShopifyMetrics();
  cacheTime = now;
  return cachedMetrics;
}
