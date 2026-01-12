// BREZ COGS (Cost of Goods Sold) Data - 2025
// Detailed SKU-level costing for DTC, FBA, and FBM channels

export interface SKUCost {
  sku: string;
  currency: string;
  cogs: number;
  shippingCost?: number;
}

export interface ChannelPricing {
  packSize: string;
  sellPrice: number;
  cogs: number;
  fulfillment?: number;
  thirdPLKitting?: number;
  outboundFreight?: number;
  amazonFees?: number;
  profit: number;
  margin: number;
}

// DTC/Wholesale SKU COGS
export const SKU_COGS: SKUCost[] = [
  // DRIFT (DM) - Blueberry Lotus Hypnotic Tonic
  { sku: 'BREZ-DM-L08-FBA', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-DM-L08-FBM', currency: 'USD', cogs: 10.32 },
  { sku: 'BREZ-DM-L12-FBA', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-DM-L12-FBM', currency: 'USD', cogs: 15.48 },
  { sku: 'BREZ-DM-L24-FBM', currency: 'USD', cogs: 30.96 },
  { sku: 'BREZ-DM-L48-FBM', currency: 'USD', cogs: 61.92 },

  // ELEVATE (EL) - Strawberry Mango Uplifting Tonic
  { sku: 'BREZ-EL-L08-FBA', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-EL-L08-FBM', currency: 'USD', cogs: 13.6 },
  { sku: 'BREZ-EL-L12-FBA', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-EL-L12-FBM', currency: 'USD', cogs: 20.4 },
  { sku: 'BREZ-EL-L24-FBM', currency: 'USD', cogs: 40.8 },
  { sku: 'BREZ-EL-L48-FBM', currency: 'USD', cogs: 81.6 },

  // LIVE MICRO (LM) - OG Spirit
  { sku: 'BREZ-LM-08', currency: 'USD', cogs: 10.56 },
  { sku: 'BREZ-LM-06-Flow', currency: 'USD', cogs: 10.56 },
  { sku: 'BREZ-LM-12-FBM', currency: 'USD', cogs: 15.84 },
  { sku: 'BREZ-LM-12-Flow', currency: 'USD', cogs: 15.84 },
  { sku: 'BREZ-LM-24', currency: 'USD', cogs: 31.68 },
  { sku: 'BREZ-LM-48', currency: 'USD', cogs: 63.36 },

  // NO VP (NVP) - Non-Cannabis Variety
  { sku: 'BREZ-NVP-L12-FBA', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-NVP-L12-FBM', currency: 'USD', cogs: 17.24 },
  { sku: 'BREZ-NVP-L24-FBM', currency: 'USD', cogs: 34.48 },
  { sku: 'BREZ-NVP-L36', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-NVP-L36-FBM', currency: 'USD', cogs: 0 },
  { sku: 'BREZ-NVP-L48-FBM', currency: 'USD', cogs: 68.96 },
];

// FBA (Fulfilled by Amazon) Channel Economics
export const FBA_PRICING: ChannelPricing[] = [
  {
    packSize: 'Flow 8 Pack',
    sellPrice: 34.99,
    cogs: 10.56,
    thirdPLKitting: 1.98,
    outboundFreight: 0.43,
    amazonFees: 10.64,
    profit: 11.38,
    margin: 32.53,
  },
  {
    packSize: 'Flow 12 Pack',
    sellPrice: 64.99,
    cogs: 15.84,
    thirdPLKitting: 2.97,
    outboundFreight: 0.43,
    amazonFees: 19.76,
    profit: 25.99,
    margin: 39.99,
  },
];

// FBM (Fulfilled by Merchant) Channel Economics - Comprehensive
export const FBM_PRICING: ChannelPricing[] = [
  // FLOW
  {
    packSize: 'Flow 8 Pack',
    sellPrice: 40.00,
    cogs: 10.56,
    fulfillment: 10.66,
    amazonFees: 12.16,
    profit: 6.62,
    margin: 16.55,
  },
  {
    packSize: 'Flow 12 Pack',
    sellPrice: 60.00,
    cogs: 15.84,
    fulfillment: 10.41,
    amazonFees: 18.24,
    profit: 15.51,
    margin: 25.85,
  },
  {
    packSize: 'Flow 24 Pack',
    sellPrice: 130.00,
    cogs: 31.68,
    fulfillment: 19.91,
    amazonFees: 39.52,
    profit: 38.89,
    margin: 29.92,
  },
  {
    packSize: 'Flow 48 Pack',
    sellPrice: 250.00,
    cogs: 63.36,
    fulfillment: 45.07,
    amazonFees: 76.00,
    profit: 65.57,
    margin: 26.23,
  },

  // ELEVATE
  {
    packSize: 'Elevate 8 Pack',
    sellPrice: 40.00,
    cogs: 13.60,
    fulfillment: 10.41,
    amazonFees: 12.16,
    profit: 3.58,
    margin: 8.95,
  },
  {
    packSize: 'Elevate 12 Pack',
    sellPrice: 60.00,
    cogs: 20.40,
    fulfillment: 10.41,
    amazonFees: 18.24,
    profit: 10.95,
    margin: 18.25,
  },
  {
    packSize: 'Elevate 24 Pack',
    sellPrice: 130.00,
    cogs: 40.80,
    fulfillment: 19.91,
    amazonFees: 39.52,
    profit: 29.77,
    margin: 22.90,
  },
  {
    packSize: 'Elevate 48 Pack',
    sellPrice: 250.00,
    cogs: 81.60,
    fulfillment: 45.07,
    amazonFees: 76.00,
    profit: 47.33,
    margin: 18.93,
  },

  // DREAM
  {
    packSize: 'Dream 8 Pack',
    sellPrice: 40.00,
    cogs: 10.32,
    fulfillment: 10.66,
    amazonFees: 18.24,
    profit: 19.02,
    margin: 47.55,
  },
  {
    packSize: 'Dream 12 Pack',
    sellPrice: 60.00,
    cogs: 15.48,
    fulfillment: 10.41,
    amazonFees: 18.24,
    profit: 15.87,
    margin: 26.45,
  },
  {
    packSize: 'Dream 24 Pack',
    sellPrice: 130.00,
    cogs: 30.96,
    fulfillment: 19.91,
    amazonFees: 39.52,
    profit: 39.61,
    margin: 30.47,
  },
  {
    packSize: 'Dream 48 Pack',
    sellPrice: 250.00,
    cogs: 61.92,
    fulfillment: 45.07,
    amazonFees: 76.00,
    profit: 67.01,
    margin: 26.80,
  },
];

// Unit Economics Summary (base unit = 4-pack)
export const UNIT_ECONOMICS_DETAIL = {
  baseUnit: '4-pack',

  // DTC Channel
  dtc: {
    cogsPerFourPack: 4.76,
    cogsPerCan: 1.19,
    avgSellingPrice: 24.99, // Typical 4-pack price
    grossMargin: 0.81, // 81% before marketing
    contributionMarginTarget: 0.40, // 40% after all variable costs
  },

  // Retail Channel
  retail: {
    cogsPerFourPack: 4.76,
    wholesalePrice: 12.50, // Approx wholesale
    retailPrice: 24.99, // Suggested retail
    retailMargin: 0.50, // Retailer's margin
    brezContributionMargin: 0.30, // 30% after trade
    dso: 55, // Days sales outstanding
  },

  // Amazon FBA
  amazonFBA: {
    avgMargin: 0.36, // ~36% average margin
    fbaFeePercent: 0.30, // ~30% Amazon fees
    bestMarginSKU: 'Flow 12 Pack', // 39.99% margin
    worstMarginSKU: 'Elevate 8 Pack', // 8.95% margin (FBM)
  },

  // Amazon FBM
  amazonFBM: {
    avgMargin: 0.25, // ~25% average margin
    fulfillmentCost: 10.50, // Average fulfillment cost
    amazonFeePercent: 0.30, // ~30% Amazon fees
  },

  // Production
  production: {
    preprodPayment: 0.50, // 50% pre-production
    packInPayment: 0.20, // 20% at pack-in
    net30Payment: 0.30, // 30% net-30
    minOrderQuantity: 50000, // Cans per production run
  },
};

// Get COGS for a specific SKU
export function getCOGSBySKU(sku: string): number | null {
  const skuData = SKU_COGS.find((s) => s.sku === sku);
  return skuData?.cogs ?? null;
}

// Get pricing by channel and pack size
export function getPricingByPackSize(
  channel: 'FBA' | 'FBM',
  packSize: string
): ChannelPricing | null {
  const pricing = channel === 'FBA' ? FBA_PRICING : FBM_PRICING;
  return pricing.find((p) => p.packSize === packSize) ?? null;
}

// Calculate gross profit for an order
export function calculateOrderProfit(
  channel: 'DTC' | 'FBA' | 'FBM' | 'Retail',
  revenue: number,
  units: number
): { grossProfit: number; margin: number } {
  let cogsPerUnit: number;
  let additionalCosts = 0;

  switch (channel) {
    case 'DTC':
      cogsPerUnit = UNIT_ECONOMICS_DETAIL.dtc.cogsPerFourPack;
      break;
    case 'Retail':
      cogsPerUnit = UNIT_ECONOMICS_DETAIL.retail.cogsPerFourPack;
      break;
    case 'FBA':
      cogsPerUnit = 10.56; // Average COGS
      additionalCosts = revenue * 0.30; // Amazon fees
      break;
    case 'FBM':
      cogsPerUnit = 10.56;
      additionalCosts = (units * 10.50) + (revenue * 0.30); // Fulfillment + fees
      break;
    default:
      cogsPerUnit = UNIT_ECONOMICS_DETAIL.dtc.cogsPerFourPack;
  }

  const totalCOGS = cogsPerUnit * units;
  const grossProfit = revenue - totalCOGS - additionalCosts;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return { grossProfit, margin };
}

// Best performing SKUs by margin
export function getBestMarginSKUs(channel: 'FBA' | 'FBM', limit = 5): ChannelPricing[] {
  const pricing = channel === 'FBA' ? FBA_PRICING : FBM_PRICING;
  return [...pricing].sort((a, b) => b.margin - a.margin).slice(0, limit);
}

// SKUs needing margin improvement
export function getLowMarginSKUs(channel: 'FBA' | 'FBM', threshold = 20): ChannelPricing[] {
  const pricing = channel === 'FBA' ? FBA_PRICING : FBM_PRICING;
  return pricing.filter((p) => p.margin < threshold);
}
