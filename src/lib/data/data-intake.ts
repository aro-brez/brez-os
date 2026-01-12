// =============================================================================
// BREZ DATA INTAKE - Add data here to auto-update optimization model
// =============================================================================
//
// HOW TO USE:
// 1. Find the section for your data (David, Nick, Travis, Dan, Cramer)
// 2. Update the values with fresh data
// 3. Save the file - the optimizer will auto-recalculate
// 4. Check VALIDATION_STATUS at bottom for any data quality issues
//
// Last updated: 2026-01-12
// =============================================================================

// =============================================================================
// DAVID (Ads) - CAC by Platform
// =============================================================================
// UPDATE WEEKLY: Pull from Meta/Google/AppLovin dashboards
// Need: Spend and New Customers by platform to calculate CAC

export const ADS_BY_PLATFORM = {
  lastUpdated: '2026-01-12',
  period: 'WTD', // WTD, MTD, or date range

  meta: {
    spend: 45_000,
    newCustomers: 650,
    cac: 69.23, // Auto-calculated: spend / newCustomers
    roas: 0.72,
  },
  google: {
    spend: 12_000,
    newCustomers: 140,
    cac: 85.71,
    roas: 0.58,
  },
  appLovin: {
    spend: 18_000,
    newCustomers: 310,
    cac: 58.06,
    roas: 0.89,
  },
  tikTokShop: {
    spend: 2_500,
    newCustomers: 45,
    cac: 55.56,
    roas: 1.10,
  },

  // TOTALS - Auto-calculated
  get totals() {
    const platforms = [this.meta, this.google, this.appLovin, this.tikTokShop];
    const totalSpend = platforms.reduce((sum, p) => sum + p.spend, 0);
    const totalCustomers = platforms.reduce((sum, p) => sum + p.newCustomers, 0);
    return {
      spend: totalSpend,
      newCustomers: totalCustomers,
      blendedCAC: totalSpend / totalCustomers,
    };
  },
};

// =============================================================================
// NICK (Retention/Retail) - Retailer-Level Velocity
// =============================================================================
// UPDATE WEEKLY: Pull from retail velocity reports
// Need: Both LOW (sell-thru only) and HIGH (sell-thru + online wholesale)

export const RETAILER_VELOCITY = {
  lastUpdated: '2026-01-12',
  period: 'Weekly',
  weekOf: '2026-01-06',

  // Top retailers - add velocity data here
  retailers: [
    { name: 'Sprouts', weeklyRevenue: 28_500, doors: 380, velocityPerDoor: 75.00, trend: 'up' as const },
    { name: 'Whole Foods', weeklyRevenue: 22_000, doors: 290, velocityPerDoor: 75.86, trend: 'flat' as const },
    { name: 'ABC Fine Wine', weeklyRevenue: 18_200, doors: 185, velocityPerDoor: 98.38, trend: 'up' as const },
    { name: 'HEB', weeklyRevenue: 15_800, doors: 220, velocityPerDoor: 71.82, trend: 'up' as const },
    { name: 'Harris Teeter', weeklyRevenue: 12_400, doors: 165, velocityPerDoor: 75.15, trend: 'flat' as const },
    { name: 'Wegmans', weeklyRevenue: 8_900, doors: 95, velocityPerDoor: 93.68, trend: 'up' as const },
    { name: 'Circle K', weeklyRevenue: 6_200, doors: 310, velocityPerDoor: 20.00, trend: 'down' as const },
    { name: 'Other Regional', weeklyRevenue: 18_000, doors: 458, velocityPerDoor: 39.30, trend: 'flat' as const },
  ],

  // LOW scenario: Sell-thru only (scanner data)
  lowScenario: {
    weeklyVelocity: 115_800, // From scanner data only
    alpha: 0.137, // retail revenue per $1 ad spend
  },

  // HIGH scenario: Sell-thru + online wholesale tagged orders
  highScenario: {
    weeklyVelocity: 145_000, // Scanner + wholesale online
    alpha: 0.172, // higher alpha when including wholesale
  },

  // TOTALS - Auto-calculated
  get totals() {
    const totalRevenue = this.retailers.reduce((sum, r) => sum + r.weeklyRevenue, 0);
    const totalDoors = this.retailers.reduce((sum, r) => sum + r.doors, 0);
    return {
      weeklyRevenue: totalRevenue,
      totalDoors: totalDoors,
      avgVelocityPerDoor: totalRevenue / totalDoors,
    };
  },
};

// =============================================================================
// TRAVIS (Product) - COGS Changes & Timeline
// =============================================================================
// UPDATE: When new formulations or pricing changes are confirmed
// Need: SKU, current COGS, new COGS, effective date

export const COGS_CHANGES = {
  lastUpdated: '2026-01-12',

  // Current COGS baseline
  currentBaseline: {
    standardCan: 1.19,
    standard4Pack: 4.76,
  },

  // Scheduled COGS changes - add new rows as changes are confirmed
  scheduledChanges: [
    {
      sku: 'BREZ-EL-L04',
      name: 'Elevate',
      currentCogs: 2.00, // Per can - higher due to ingredients
      newCogs: 1.65, // Negotiated supplier discount
      effectiveDate: '2026-03-01',
      impactPer4Pack: -1.40, // Savings per 4-pack
      notes: 'Supplier renegotiation complete',
    },
    {
      sku: 'BREZ-DT-L04',
      name: 'Drift',
      currentCogs: 1.35,
      newCogs: 1.25,
      effectiveDate: '2026-04-01',
      impactPer4Pack: -0.40,
      notes: 'New ingredient source',
    },
    // Add more as they're confirmed
  ],

  // Regulatory reformulation (Nov 2026 deadline)
  regulatoryChanges: {
    deadline: '2026-11-01',
    estimatedCostIncrease: 0.15, // Per can for compliant formulation
    status: 'research' as const, // research | pilot | production
    notes: '0.4mg THC/container cap - reformulation required',
  },
};

// =============================================================================
// DAN (Ops) - Inventory Burn Rate & Production Cash Timing
// =============================================================================
// UPDATE WEEKLY: From inventory reports and production schedule
// Need: Current inventory, weekly burn, production payment timing

export const INVENTORY_DYNAMICS = {
  lastUpdated: '2026-01-12',

  // Weekly burn rate by SKU (units = 4-packs)
  burnRates: [
    { sku: 'BREZ-OGM-L04', name: 'OG Micro 2.5mg', currentInventory: 345_566, weeklyBurn: 12_500, weeksOnHand: 27.6 },
    { sku: 'BREZ-OG-L04', name: 'OG 5mg', currentInventory: 168_961, weeklyBurn: 8_200, weeksOnHand: 20.6 },
    { sku: 'BREZ-OGX-L04', name: 'OG Ext Stgth 10mg', currentInventory: 52_260, weeklyBurn: 2_800, weeksOnHand: 18.7 },
    { sku: 'BREZ-AM-L04', name: 'Amplify 5mg', currentInventory: 22_392, weeklyBurn: 1_200, weeksOnHand: 18.7 },
    { sku: 'BREZ-DT-L04', name: 'Drift 5mg', currentInventory: 7_650, weeklyBurn: 650, weeksOnHand: 11.8 },
    { sku: 'BREZ-EL-L04', name: 'Elevate', currentInventory: 33_834, weeklyBurn: 2_100, weeksOnHand: 16.1 },
    { sku: 'BREZ-FL-L04', name: 'Flow', currentInventory: 119_929, weeklyBurn: 4_500, weeksOnHand: 26.7 },
    { sku: 'BREZ-DM-L04', name: 'Dream', currentInventory: 19_584, weeklyBurn: 1_100, weeksOnHand: 17.8 },
  ],

  // Safety stock threshold
  safetyStockWeeks: 6,

  // Production cash timing (when payments actually hit)
  productionPayments: [
    {
      productionRun: 'February 2026',
      totalCost: 117_465,
      payment1: { amount: 58_732, dueDate: '2026-02-01', type: '50% deposit' as const },
      payment2: { amount: 58_733, dueDate: '2026-02-15', type: '50% before ship' as const },
    },
    {
      productionRun: 'April 2026',
      totalCost: 1_632_531,
      payment1: { amount: 816_265, dueDate: '2026-04-01', type: '50% deposit' as const },
      payment2: { amount: 816_266, dueDate: '2026-04-21', type: '50% before ship' as const },
    },
    {
      productionRun: 'May 2026',
      totalCost: 1_335_352,
      payment1: { amount: 667_676, dueDate: '2026-05-01', type: '50% deposit' as const },
      payment2: { amount: 667_676, dueDate: '2026-05-21', type: '50% before ship' as const },
    },
  ],

  // SKUs approaching safety stock - Auto-calculated
  get criticalSkus() {
    return this.burnRates.filter(s => s.weeksOnHand <= this.safetyStockWeeks);
  },
};

// =============================================================================
// CRAMER (Finance) - Weekly CM$ by Segment
// =============================================================================
// UPDATE WEEKLY: From P&L / finance dashboard
// Need: Actual CM dollars (not just %), broken out by customer segment

export const WEEKLY_CM_DOLLARS = {
  lastUpdated: '2026-01-12',

  // Weekly CM$ actuals - add new weeks as data comes in
  weeks: [
    {
      weekOf: '2025-12-30',
      newCustomerRevenue: 142_000,
      newCustomerCM: 61_060, // 43% CM
      subRevenue: 285_000,
      subCM: 122_550, // 43% CM
      nonSubReturningRevenue: 165_000,
      nonSubReturningCM: 70_950, // 43% CM
      totalCM: 254_560,
      adSpend: 78_000,
      netCM: 176_560, // CM after ad spend
    },
    {
      weekOf: '2026-01-06',
      newCustomerRevenue: 155_000,
      newCustomerCM: 66_650,
      subRevenue: 292_000,
      subCM: 125_560,
      nonSubReturningRevenue: 158_000,
      nonSubReturningCM: 67_940,
      totalCM: 260_150,
      adSpend: 85_000,
      netCM: 175_150,
    },
    // Add new weeks here...
  ],

  // Trailing 4-week averages - Auto-calculated
  get trailing4WeekAvg() {
    const recent = this.weeks.slice(-4);
    if (recent.length === 0) return null;

    const avgTotalCM = recent.reduce((sum, w) => sum + w.totalCM, 0) / recent.length;
    const avgAdSpend = recent.reduce((sum, w) => sum + w.adSpend, 0) / recent.length;
    const avgNetCM = recent.reduce((sum, w) => sum + w.netCM, 0) / recent.length;

    return {
      avgTotalCM,
      avgAdSpend,
      avgNetCM,
      cmPerDollarSpent: avgTotalCM / avgAdSpend,
    };
  },

  // Week-over-week trend - Auto-calculated
  get trend() {
    if (this.weeks.length < 2) return 'insufficient_data';
    const current = this.weeks[this.weeks.length - 1];
    const previous = this.weeks[this.weeks.length - 2];
    const change = ((current.totalCM - previous.totalCM) / previous.totalCM) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'flat';
  },
};

// =============================================================================
// DATA VALIDATION & QA
// =============================================================================

export interface ValidationResult {
  source: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  lastUpdated: string;
  staleDays: number;
}

export function validateAllData(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const now = new Date();

  // Helper to check staleness
  const daysSince = (dateStr: string) => {
    const date = new Date(dateStr);
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Validate Ads data (David)
  const adsDays = daysSince(ADS_BY_PLATFORM.lastUpdated);
  results.push({
    source: 'David (Ads by Platform)',
    status: adsDays > 7 ? 'warning' : adsDays > 14 ? 'error' : 'valid',
    message: adsDays > 7 ? `Data is ${adsDays} days old - update weekly` : 'Current',
    lastUpdated: ADS_BY_PLATFORM.lastUpdated,
    staleDays: adsDays,
  });

  // Validate Retail data (Nick)
  const retailDays = daysSince(RETAILER_VELOCITY.lastUpdated);
  results.push({
    source: 'Nick (Retailer Velocity)',
    status: retailDays > 7 ? 'warning' : retailDays > 14 ? 'error' : 'valid',
    message: retailDays > 7 ? `Data is ${retailDays} days old - update weekly` : 'Current',
    lastUpdated: RETAILER_VELOCITY.lastUpdated,
    staleDays: retailDays,
  });

  // Validate COGS data (Travis)
  const cogsDays = daysSince(COGS_CHANGES.lastUpdated);
  results.push({
    source: 'Travis (COGS Changes)',
    status: cogsDays > 30 ? 'warning' : 'valid',
    message: cogsDays > 30 ? `Review COGS timeline - last update ${cogsDays} days ago` : 'Current',
    lastUpdated: COGS_CHANGES.lastUpdated,
    staleDays: cogsDays,
  });

  // Validate Inventory data (Dan)
  const invDays = daysSince(INVENTORY_DYNAMICS.lastUpdated);
  const criticalSkus = INVENTORY_DYNAMICS.criticalSkus;
  results.push({
    source: 'Dan (Inventory Dynamics)',
    status: criticalSkus.length > 0 ? 'warning' : invDays > 7 ? 'warning' : 'valid',
    message: criticalSkus.length > 0
      ? `${criticalSkus.length} SKUs at/below safety stock: ${criticalSkus.map(s => s.name).join(', ')}`
      : invDays > 7 ? `Data is ${invDays} days old` : 'Current',
    lastUpdated: INVENTORY_DYNAMICS.lastUpdated,
    staleDays: invDays,
  });

  // Validate CM$ data (Cramer)
  const cmDays = daysSince(WEEKLY_CM_DOLLARS.lastUpdated);
  results.push({
    source: 'Cramer (Weekly CM$)',
    status: cmDays > 7 ? 'warning' : cmDays > 14 ? 'error' : 'valid',
    message: cmDays > 7 ? `Data is ${cmDays} days old - critical for CM$ optimization` : 'Current',
    lastUpdated: WEEKLY_CM_DOLLARS.lastUpdated,
    staleDays: cmDays,
  });

  return results;
}

// =============================================================================
// VALIDATION STATUS - Check this after updating data
// =============================================================================

export const VALIDATION_STATUS = {
  get current() {
    return validateAllData();
  },

  get overallHealth() {
    const results = validateAllData();
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    if (errors > 0) return 'critical';
    if (warnings > 2) return 'needs_attention';
    if (warnings > 0) return 'acceptable';
    return 'healthy';
  },

  get summary() {
    const results = validateAllData();
    return {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      warnings: results.filter(r => r.status === 'warning').length,
      errors: results.filter(r => r.status === 'error').length,
      oldestData: Math.max(...results.map(r => r.staleDays)),
    };
  },
};
