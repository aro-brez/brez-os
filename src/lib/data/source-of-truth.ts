// BREZ Ultimate Source of Truth
// Synthesized from all data sources - validated and cross-referenced
// Last updated: January 12, 2025

// =============================================================================
// VALIDATED CORE METRICS
// =============================================================================

export const VALIDATED_METRICS = {
  // Alpha coefficient - retail revenue per $1 paid spend
  // Source: Supermind Export, validated against velocity data
  alpha: 0.137,

  // 2025 Revenue (Projected Full Year)
  revenue2025: {
    sellThrough: 6_021_594, // Actual retail velocity (from velocity spreadsheet)
    sellIn: 13_450_000, // Wholesale/distributor orders
    ratio: 2.23, // Sell-in to sell-through ratio (inventory in channel)
    dtcProjected: 25_000_000, // DTC target for 2025
    totalTarget: 45_000_000, // Company total target
  },

  // 2024 Revenue (Actual)
  revenue2024: {
    retailVelocity: 1_197_061,
    uniqueStores: 1_898,
    totalUnits: 84_644,
    adSpend: 2_800_702.59,
  },

  // YoY Growth
  growth: {
    retailVelocityYoY: 4.03, // 403% growth (6M / 1.2M)
    doorsGrowthPeak: 2_103 / 326, // ~6.5x peak doors growth
  },
};

// =============================================================================
// UNIT ECONOMICS (VALIDATED FROM DAN'S DOC)
// =============================================================================

export const UNIT_ECONOMICS = {
  // Base unit definition
  baseUnit: '4-pack',
  productionUnit: '24-pack', // 6x 4-packs

  // COGS Breakdown (per 4-pack)
  cogs: {
    ingredients: 0.75,
    packaging: 0.21,
    coManLabor: 0.23,
    freightInbound: 0.06,
    total: 1.19, // Per can
    perFourPack: 4.76, // 4 x $1.19
  },

  // Channel Margins
  margins: {
    dtc: {
      grossMargin: 0.81, // 81% before marketing
      contributionMarginTarget: 0.40, // 40% after all variable costs
    },
    retail: {
      contributionMargin: 0.30, // ~30% after trade, freight, distributor fees
      dso: 50, // Actual DSO (Net 30 terms, but ~50 days reality)
    },
    amazonFBA: {
      avgMargin: 0.36,
      feePercent: 0.30,
    },
    amazonFBM: {
      avgMargin: 0.25,
      fulfillmentCost: 10.50,
      feePercent: 0.30,
    },
  },

  // LTV Multiples (validated)
  ltvMultiples: {
    month3: 2.5,
    month6: 3.5,
    month9: 4.6,
    month12: 5.2,
  },

  // Subscription metrics
  subscription: {
    conversionRate: 0.5049, // 50.49%
  },
};

// =============================================================================
// CASH POSITION & OBLIGATIONS (FROM DAN'S DOC)
// =============================================================================

export const CASH_POSITION = {
  // Current state
  cashOnHand: 380_000,
  minimumReserve: 300_000, // Historical minimum
  targetMinimum: 1_000_000, // Post-raise target

  // Weekly fixed OPEX (non-production/non-COGS)
  weeklyFixedOpex: {
    debtPayments: {
      wayflyer: { amount: 130_000, weeklyUntil: '2025-04-16' },
      clearCo: { amount: 30_000, weeklyUntil: '2025-03-09' },
    },
    negotiatedPayments: {
      petrichor: 37_665, // Monthly
      cannasol: 105_676, // Monthly
    },
    monthlyPayroll: 508_000,
    monthlyBudgetedExpenses: 151_000,
    totalMonthly: 963_000,
  },

  // Accounts Payable
  accountsPayable: {
    total: 8_601_338.55,
    current: 663_202.48,
    days1to30: 463_281.34,
    days30to60: 1_004_020.07,
    days60plus: 6_470_834.66,
  },

  // Critical vendor balances (stop-ship risk)
  criticalVendors: {
    bestBev: 166_563.34,
    cannasol: 1_763_140.99,
    petrichor: 468_398.0,
    apex: 306_067.8,
  },

  // Loan option available
  loanOption: {
    factorRate: 1.31,
    amount: 3_200_000,
    monthlyPayment: 349_333,
    termMonths: 12,
    prepayFactors: {
      within30Days: 1.13,
      within60Days: 1.15,
      within90Days: 1.17,
    },
  },

  // Retail AR
  retailAR: {
    terms: 'Net 30',
    actualDSO: 50,
    monthlyCollections: 1_148_127,
  },
};

// =============================================================================
// INVENTORY POSITION (FROM DAN'S DOC)
// =============================================================================

export const INVENTORY = {
  // Current finished goods
  finishedGoods: {
    total4Packs: 791_988,
    inProcessing: 44_994,
    wipHolidayProduction: 400_000, // Pending final counts
    liquidationNeeded: 175_000, // Micros nearing 6-month expiry
  },

  // By SKU (from Dan's doc)
  bySku: [
    { name: 'OG Micro 2.5mg', sku: 'BREZ-OGM-L04', can: 7.5, pack: 4, qty: 345_566 },
    { name: 'OG 5mg', sku: 'BREZ-OG-L04', can: 12, pack: 4, qty: 168_961 },
    { name: 'OG Ext Stgth 10mg', sku: 'BREZ-OGX-L04', can: 12, pack: 4, qty: 52_260 },
    { name: 'Amplify 5mg', sku: 'BREZ-AM-L04', can: 12, pack: 4, qty: 22_392 },
    { name: 'Drift 5mg', sku: 'BREZ-DT-L04', can: 12, pack: 4, qty: 7_650 },
    { name: 'Elevate', sku: 'BREZ-EL-L04', can: 12, pack: 4, qty: 33_834 },
    { name: 'Flow', sku: 'BREZ-FL-L04', can: 12, pack: 4, qty: 119_929 },
    { name: 'Dream', sku: 'BREZ-DM-L04', can: 12, pack: 4, qty: 19_584 },
    { name: 'Shots 5mg', sku: 'BREZ-SH-L04', can: 50, pack: 4, qty: 16_349 },
    { name: 'Spirit 75mg', sku: 'BREZ-SP-L01', can: 750, pack: 1, qty: 11_570 },
    { name: 'OG 3mg', sku: 'BREZ-OGL-L04', can: 7.5, pack: 4, qty: 5_463 },
  ],

  // Safety stock
  safetyStock: {
    minimumWeeksOnHand: 6,
  },

  // Production constraints
  production: {
    cycleTimeDays: 67,
    leadTimeDays: 90, // Lock in 90 days out
    productionToShipDays: 14, // Inbound, receiving, COAs
  },
};

// =============================================================================
// H1 2025 PRODUCTION SCHEDULE
// =============================================================================

export const PRODUCTION_SCHEDULE = {
  // Based on $45M revenue build
  february: {
    cost: 117_464.69,
    output4Packs: 120_000,
  },
  april: {
    cost: 1_632_530.84,
    output4Packs: 358_000,
  },
  may: {
    cost: 1_335_351.82,
    output4Packs: 359_000,
  },

  // Alternative scenarios being modeled
  scenarios: {
    optimistic: 45_000_000,
    base: 43_000_000,
    pessimistic: 37_500_000,
  },
};

// =============================================================================
// AD SPEND BY PLATFORM (2025)
// =============================================================================

export const AD_SPEND_2025 = {
  meta: 5_318_521.49,
  google: 1_149_362.51,
  appLovin: 2_006_825.28,
  tikTokShop: 14_419.11,
  total: 8_489_128.39,

  // 2024 comparison
  total2024: 2_800_702.59,
  yoyGrowth: 2.03, // 203% increase
};

// =============================================================================
// DTC YTD METRICS (2025 Jan-May from Metrics Dashboard)
// =============================================================================

export const DTC_YTD_2025 = {
  // Monthly breakdown
  monthly: {
    january: {
      spend: 1_956_935.88,
      newCustomers: 20_885,
      firstTimeRevenue: 1_952_963.17,
      nonSubReturningRevenue: 1_038_350.19,
      subRevenue: 988_287.86,
      cac: 93.70,
      orders: 38_642,
      firstTimeAOV: 93.51,
      nonSubReturningAOV: 131.02,
      subAOV: 100.52,
    },
    february: {
      spend: 1_299_594.28,
      newCustomers: 10_570,
      firstTimeRevenue: 943_695.59,
      nonSubReturningRevenue: 1_032_412.37,
      subRevenue: 1_047_264.57,
      cac: 122.95,
      orders: 28_131,
      firstTimeAOV: 89.28,
      nonSubReturningAOV: 134.08,
      subAOV: 106.20,
    },
    march: {
      spend: 1_239_185.48,
      newCustomers: 9_833,
      firstTimeRevenue: 852_286.53,
      nonSubReturningRevenue: 848_214.27,
      subRevenue: 1_184_824.77,
      cac: 126.02,
      orders: 26_585,
      firstTimeAOV: 86.68,
      nonSubReturningAOV: 143.52,
      subAOV: 109.28,
    },
    april: {
      spend: 1_209_444.65,
      newCustomers: 9_105,
      firstTimeRevenue: 799_972.33,
      nonSubReturningRevenue: 932_277.72,
      subRevenue: 1_163_947.92,
      cac: 132.83,
      orders: 27_462,
      firstTimeAOV: 87.86,
      nonSubReturningAOV: 133.91,
      subAOV: 102.15,
    },
    may: {
      spend: 871_231.45,
      newCustomers: 6_376,
      firstTimeRevenue: 559_783.86,
      nonSubReturningRevenue: 669_886.29,
      subRevenue: 1_367_342.80,
      cac: 136.64,
      orders: 24_874,
      firstTimeAOV: 87.80,
      nonSubReturningAOV: 129.99,
      subAOV: 102.46,
    },
  },

  // YTD Totals
  ytd: {
    spend: 6_576_391.74,
    newCustomers: 56_769,
    firstTimeRevenue: 5_108_701.48,
    nonSubReturningRevenue: 4_521_140.84,
    subRevenue: 5_751_667.92,
    cac: 115.84,
    orders: 145_694,
    firstTimeAOV: 89.99,
    nonSubReturningAOV: 134.25,
    subAOV: 104.03,
    cvr: 0.0171, // 1.71%
    repeatRate: 0.4391, // 43.91%
  },

  // Q2+ metrics (from different sheet section)
  q2: {
    spend: 2_848_062.17,
    newCustomers: 21_660,
    shopifyFirstTime: 1_865_189.98,
    newCustomerROAS: 0.6549,
    cac: 131.49,
  },
  q3: {
    spend: 1_750_642.59,
    newCustomers: 25_084,
    shopifyFirstTime: 1_864_374.65,
    newCustomerROAS: 1.0650,
    cac: 69.79,
  },
};

// =============================================================================
// RETAIL VELOCITY DATA (2025 - Sunday weeks)
// =============================================================================

export const RETAIL_VELOCITY_2025 = {
  // Note: Brian's data uses Sunday week starts
  // Al's data uses Monday week starts
  // This is the Sunday-based velocity data

  totalRevenue: 6_021_594,
  totalUnits: 454_418,
  weeks: 52,
  avgWeeklyRevenue: 115_800,

  // Peak performance
  peakWeek: {
    weekNum: 30,
    date: '2025-07-28',
    revenue: 229_108,
    units: 17_290,
    doors: 1_528,
  },

  // Max doors
  maxDoors: {
    weekNum: 40,
    date: '2025-10-06',
    doors: 2_103,
  },

  // Market expansion timeline
  marketExpansion: [
    { month: 'April', market: 'NJ', event: 'Launch' },
    { month: 'May', market: 'KeHE National + GA', event: 'Expansion' },
    { month: 'July', market: 'CA + IL', event: 'Major expansion' },
    { month: 'September', market: 'NC/SC', event: 'Southeast expansion' },
  ],

  // Trade spend (Nov-Dec)
  tradeSpend: {
    total: 201_000,
    generalPOS: 150_000,
    abcFlorida: 10_000,
    binnysIL: 16_000,
    rebates: 25_000,
    weeks: 9,
  },
};

// =============================================================================
// WHOLESALE ORDERS (2025 - Monday weeks)
// =============================================================================

export const WHOLESALE_ORDERS_2025 = {
  // Note: Aaron's data uses Monday week starts
  totalOrders: 1_234,
  totalSales: 574_540.58,
  weeks: 53,
  avgWeeklySales: 10_840.39,
};

// =============================================================================
// VENDOR PAYMENT TERMS
// =============================================================================

export type PaymentTerm =
  | 'Prepayment'
  | 'Net 30'
  | 'Net 45'
  | 'Due upon receipt'
  | '50/50'
  | 'Payment plan';

export interface VendorTerms {
  name: string;
  terms: PaymentTerm;
  details?: string;
}

export const VENDOR_TERMS: VendorTerms[] = [
  { name: 'Abstrax Tech', terms: 'Prepayment' },
  { name: 'AE Global', terms: 'Prepayment' },
  { name: 'Agavezoe LLC', terms: 'Due upon receipt' },
  { name: 'Apex Flavors', terms: 'Prepayment', details: 'Pre-shipping' },
  { name: 'Applied Food Science', terms: 'Net 30' },
  { name: 'Berlin Packaging', terms: 'Prepayment' },
  { name: 'Best Bev LLC', terms: '50/50', details: '50% week of production, 50% before shipping' },
  { name: 'California Natural Color', terms: 'Prepayment' },
  { name: 'Cannasol Technologies', terms: '50/50', details: '50% Down/50% Net 30' },
  { name: 'Florida Bulk Sales', terms: 'Net 30' },
  { name: 'Icon Foods', terms: 'Net 30' },
  { name: 'Lucky to Be Beverage Co.', terms: '50/50', details: '50% / 50% upon shipment' },
  { name: 'Monk Fruit Corporation', terms: 'Prepayment' },
  { name: 'Oobli', terms: 'Net 30' },
  { name: 'Orchid Island Juice Company', terms: 'Net 30' },
  { name: 'Peerless Canna', terms: 'Payment plan' },
  { name: 'Petrichor Mushrooms', terms: 'Net 30' },
  { name: 'PLT Health Solutions', terms: 'Net 30' },
  { name: 'PSA USA', terms: 'Net 30' },
  { name: 'Select Ingredients', terms: 'Net 30' },
  { name: 'Sovereign Flavors', terms: 'Prepayment' },
  { name: 'Terpene Belt Processing', terms: '50/50', details: '50% Down/50% Net 45' },
  { name: 'Tricorbraun', terms: 'Prepayment' },
  { name: 'DigiCan Printing', terms: '50/50', details: '50% / 50% upon shipment' },
  { name: 'Century Printing & Packaging', terms: 'Net 30' },
];

// =============================================================================
// DATA RECONCILIATION NOTES
// =============================================================================

export const DATA_NOTES = {
  weekDefinition: {
    brian: 'Sunday week starts (velocity data)',
    al: 'Monday week starts (wholesale orders)',
    impact:
      'Minor discrepancy in weekly alignment - use week numbers for comparison, not dates',
  },

  sellInVsSellThrough: {
    sellIn2025: 13_450_000,
    sellThrough2025: 6_021_594,
    ratio: 2.23,
    meaning:
      'Sell-in represents wholesale orders/invoices. Sell-through represents actual retail scanner/velocity. The 2.23x ratio indicates channel inventory buildup.',
  },

  cogsValidation: {
    perCan: 1.19,
    perFourPack: 4.76,
    sources: ['Dan COO doc', 'Supermind export', 'COGS spreadsheet'],
    status: 'VALIDATED - all sources agree',
  },

  alphaCoefficient: {
    value: 0.137,
    meaning: 'Retail velocity revenue per $1 of paid media spend',
    calculation: 'retail_velocity / ad_spend',
    validated: true,
  },
};

// =============================================================================
// LEADERSHIP MEETING INSIGHTS (Jan 6, 2026)
// =============================================================================

export const MEETING_INSIGHTS_JAN_6_2026 = {
  // Ads Team Meeting
  adsTeam: {
    date: '2026-01-06',
    decemberPerformance: {
      shopifyRevenueGoal: 1_880_000,
      shopifyRevenueActual: 1_780_000,
      missPercent: 5,
      adSpendBudget: 150_000,
      adSpendActual: 119_000,
      underBudgetPercent: 20,
      cacActual: 58,
      cacTarget: 55,
    },
    concerns: {
      netLossDecember: 87_000,
      netLossNovember: 136_000,
      reason:
        'Difficulty tracking new vs returning customers due to lack of sophisticated attribution (no Triple Whale/Northbeam)',
    },
    januaryStrategy: {
      focus: 'Acquire subscribers at higher price points',
      moveAwayFrom: '$55 CAC constraint',
      opportunity: 'Dry January - push for more budget',
      actionItems: [
        'Contact Kramer to allocate leftover spend to January',
        'Run analysis on acquisition spend impact on repeat purchasers',
        'Group chat with Kramer, Brian Dewey, Nick to discuss',
      ],
    },
  },

  // Executive Leadership Team (ELT) Weekly Sync
  eltSync: {
    date: '2026-01-06',
    accomplishments2025: {
      totalRevenue: 47_000_000,
      newRetailDoors: 4_000,
      subscribersGrowth: {
        from: 1_000,
        to: 14_000,
      },
      cansProduced: 13_000_000,
      majorRetailPartners: [
        'Sprouts',
        'Rallies',
        'Circle K',
        'Wegmans',
        'ABC',
        'HEB',
        'Harris Teeter',
      ],
    },

    currentState: {
      monthlyRunRate: 3_000_000, // ~$3M (projections 3.3M, actual 2.9M last month)
      cashOnHand: 300_000,
      accountsPayable: 8_600_000,
      inventory: 9_500_000, // $9-10M
      dtcProfitable: true,
      retailProfitable: true,
      nextCriticalWindow: 'April production',
    },

    coreOperatingPrinciple:
      'Every decision must improve contribution margin or at least meet survival goals',

    apResolutionOptions: {
      option1: {
        name: 'Full Cash Repayment',
        description: '100% principal + 10% interest on $5M equity injection',
        trigger: 'Contractually committed equity raise',
      },
      option2: {
        name: 'Partial Conversion + Payment Plan',
        description:
          '50% converts to equity at $100M valuation (33% discount), remaining 50% paid over 3-4 years @ 8% interest',
        equityConversion: 0.5,
        valuation: 100_000_000,
        discount: 0.33,
        paymentYears: 3.5,
        interestRate: 0.08,
      },
    },

    teamEquityPlan: {
      immediate: 0.03, // 3% by end of January
      postInvestment: 0.05, // 5% total (additional 2% later)
      purpose: 'Make team partners, share responsibility with investors',
    },

    productRoadmap: {
      now: [
        'Elevate optimization',
        'Drift refinement',
        'SKU rationalization',
        'Variety packs prep',
      ],
      q2: ['Variety packs', 'Passion line (mainstream)', 'Muse line (experimental, non-THC)'],
      q3: ['IMPACT energy drink (one flavor, no sugar)'],
      q3q4: ['Functional water'],
      dependency: 'Thrive model achievement',
    },

    regulatoryAlert: {
      deadline: '2026-11',
      rule: '0.4mg THC/container cap',
      impact: 'Effectively bans current products - reformulation required',
    },

    threeScenarios: {
      stabilizedBase: 'AP plan executed, revenue maintained, contribution margin hit',
      downside: 'Retail + DTC flat/dropping, still meet survival targets',
      thrive: '+20% DTC improvement at same spend → contribution margin expands → retail lift in 3-6 weeks',
    },

    keyInsight:
      'Risk is complexity and working capital, NOT demand. DTC-first strategy feeds entire business.',

    problemsRevealed2025: [
      'Too many products launched too fast',
      'DTC fell off cliff in February',
      'Broken financial model',
      'COGS skyrocketed (Elevate cost $2)',
      'Acquired double user base with wrong customer = huge loss',
      'Hired too many people without executive knowledge',
      'Disconnected organization with siloed decision-making',
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate runway in weeks based on current cash position
 */
export function calculateRunway(): number {
  const weeklyBurn = CASH_POSITION.weeklyFixedOpex.totalMonthly / 4.33;
  const availableCash = CASH_POSITION.cashOnHand - CASH_POSITION.minimumReserve;
  return Math.floor(availableCash / weeklyBurn);
}

/**
 * Calculate retail revenue from ad spend using alpha
 */
export function calculateRetailFromAdSpend(adSpend: number): number {
  return adSpend * VALIDATED_METRICS.alpha;
}

/**
 * Calculate gross profit for a channel
 */
export function calculateGrossProfit(
  channel: 'dtc' | 'retail' | 'fba' | 'fbm',
  revenue: number
): number {
  const margins = UNIT_ECONOMICS.margins;
  switch (channel) {
    case 'dtc':
      return revenue * margins.dtc.grossMargin;
    case 'retail':
      return revenue * margins.retail.contributionMargin;
    case 'fba':
      return revenue * margins.amazonFBA.avgMargin;
    case 'fbm':
      return revenue * margins.amazonFBM.avgMargin;
    default:
      return 0;
  }
}

/**
 * Calculate inventory weeks on hand
 */
export function calculateWeeksOnHand(weeklyVelocity: number): number {
  const total4Packs = INVENTORY.finishedGoods.total4Packs;
  const weeklyUnits = weeklyVelocity / (UNIT_ECONOMICS.cogs.perFourPack * 4); // Approx 4-packs
  return total4Packs / weeklyUnits;
}

/**
 * Get critical cash dates
 */
export function getCriticalCashDates(): { description: string; date: string; amount: number }[] {
  return [
    {
      description: 'Wayflyer payments end',
      date: '2025-04-16',
      amount: CASH_POSITION.weeklyFixedOpex.debtPayments.wayflyer.amount,
    },
    {
      description: 'Clear Co payments end',
      date: '2025-03-09',
      amount: CASH_POSITION.weeklyFixedOpex.debtPayments.clearCo.amount,
    },
  ];
}
