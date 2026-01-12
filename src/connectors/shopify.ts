/**
 * Shopify Connector Stub (V2)
 *
 * TODO: Implement OAuth flow and API integration
 *
 * This connector will:
 * - Fetch order data for DTC revenue calculations
 * - Get subscription/recurring order metrics
 * - Calculate non-sub returning customer revenue
 * - Provide real-time revenue data instead of manual input
 */

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
}

export interface ShopifyOrderData {
  date: string;
  totalRevenue: number;
  orderCount: number;
  newCustomerOrders: number;
  returningCustomerOrders: number;
  subscriptionOrders: number;
  averageOrderValue: number;
}

export interface ShopifyCustomerData {
  totalCustomers: number;
  newCustomersThisWeek: number;
  activeSubscribers: number;
  subscriberChurnRate: number;
}

/**
 * Initialize Shopify connection
 * TODO: Implement OAuth flow
 */
export async function initShopify(config: ShopifyConfig): Promise<boolean> {
  console.log("Shopify connector not implemented yet", config);
  throw new Error("Shopify connector not implemented - V2 feature");
}

/**
 * Fetch weekly order data
 * TODO: Implement GraphQL query to Shopify Admin API
 */
export async function fetchWeeklyOrders(
  config: ShopifyConfig,
  startDate: string,
  endDate: string
): Promise<ShopifyOrderData[]> {
  console.log("Fetching orders", config, startDate, endDate);
  throw new Error("Shopify connector not implemented - V2 feature");
}

/**
 * Fetch customer metrics
 * TODO: Implement customer analytics queries
 */
export async function fetchCustomerMetrics(
  config: ShopifyConfig
): Promise<ShopifyCustomerData> {
  console.log("Fetching customer metrics", config);
  throw new Error("Shopify connector not implemented - V2 feature");
}

/**
 * Calculate subscription metrics from Shopify
 * TODO: Integrate with subscription app (ReCharge, Bold, etc.)
 */
export async function fetchSubscriptionMetrics(
  config: ShopifyConfig
): Promise<{
  activeSubs: number;
  weeklyChurnRate: number;
  weeklyRevenuePerSub: number;
}> {
  console.log("Fetching subscription metrics", config);
  throw new Error("Shopify connector not implemented - V2 feature");
}
