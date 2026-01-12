// BREZ KPI Data - Pulled from team KPI tracking
// Last updated: 2025-04-23

export interface KPIMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: 'currency' | 'percentage' | 'number' | 'ratio';
  trend: 'up' | 'down' | 'flat';
  variance: number;
  variancePercent: number;
  status: 'on_track' | 'warning' | 'critical';
  owner: string;
  department: string;
  period: string;
  notes?: string;
}

// Current MTD KPIs (April 2025)
export const CURRENT_KPIS: KPIMetric[] = [
  // ============================================
  // REVENUE METRICS
  // ============================================
  {
    id: 'dtc_total',
    name: 'DTC Total Revenue',
    category: 'Revenue',
    value: 2150268,
    target: 2270479, // Prorated from $3.27M monthly goal
    unit: 'currency',
    trend: 'down',
    variance: -120211,
    variancePercent: -5.3,
    status: 'warning',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD (Apr 1-23)',
    notes: 'Pacing to $2.95M, goal is $3.27M',
  },
  {
    id: 'dtc_first_time',
    name: 'First Time Buyers',
    category: 'Revenue',
    value: 622965,
    target: 750000,
    unit: 'currency',
    trend: 'down',
    variance: -127035,
    variancePercent: -16.9,
    status: 'critical',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
    notes: '29% of DTC total',
  },
  {
    id: 'dtc_returning',
    name: 'Returning Customers',
    category: 'Revenue',
    value: 1527303,
    target: 1520000,
    unit: 'currency',
    trend: 'up',
    variance: 7303,
    variancePercent: 0.5,
    status: 'on_track',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
    notes: '71% of DTC total - healthy retention',
  },
  {
    id: 'subscription_revenue',
    name: 'Subscription Revenue',
    category: 'Revenue',
    value: 922039,
    target: 950000,
    unit: 'currency',
    trend: 'flat',
    variance: -27961,
    variancePercent: -2.9,
    status: 'on_track',
    owner: 'CS Team',
    department: 'customer_success',
    period: 'MTD',
  },
  {
    id: 'non_sub_revenue',
    name: 'Non-Subscription Revenue',
    category: 'Revenue',
    value: 605264,
    target: 762404,
    unit: 'currency',
    trend: 'down',
    variance: -157140,
    variancePercent: -20.6,
    status: 'critical',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
  },

  // ============================================
  // AD SPEND & EFFICIENCY
  // ============================================
  {
    id: 'total_ad_spend',
    name: 'Total Ad Spend',
    category: 'Advertising',
    value: 1019221, // Brandon + Sarah + Amazon + PostPilot
    target: 1300000,
    unit: 'currency',
    trend: 'down',
    variance: -98562, // Pacing variance
    variancePercent: -7.6,
    status: 'warning',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
    notes: 'Under-spending vs budget',
  },
  {
    id: 'brandon_spend',
    name: 'Brandon (Meta/Google)',
    category: 'Advertising',
    value: 931693,
    target: 1000000,
    unit: 'currency',
    trend: 'flat',
    variance: -68307,
    variancePercent: -6.8,
    status: 'on_track',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
  },
  {
    id: 'roas',
    name: 'ROAS (Brandon)',
    category: 'Advertising',
    value: 0.67,
    target: 1.0,
    unit: 'ratio',
    trend: 'down',
    variance: -0.33,
    variancePercent: -33,
    status: 'critical',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
    notes: 'Below target - needs attention',
  },
  {
    id: 'affiliate_spend',
    name: 'Affiliate Spend',
    category: 'Advertising',
    value: 7358,
    target: 15000,
    unit: 'currency',
    trend: 'down',
    variance: -7642,
    variancePercent: -50.9,
    status: 'warning',
    owner: 'Sarah',
    department: 'marketing',
    period: 'MTD',
  },
  {
    id: 'amazon_ad_spend',
    name: 'Amazon Advertising',
    category: 'Advertising',
    value: 34701,
    target: 50000,
    unit: 'currency',
    trend: 'down',
    variance: -15299,
    variancePercent: -30.6,
    status: 'warning',
    owner: 'TBD',
    department: 'growth',
    period: 'MTD',
  },

  // ============================================
  // OPERATIONAL METRICS
  // ============================================
  {
    id: 'discounts_given',
    name: 'Discounts Given',
    category: 'Operations',
    value: 40860,
    target: 59414, // Budget
    unit: 'currency',
    trend: 'down',
    variance: -3696, // Favorable - under budget after pacing
    variancePercent: -6.2,
    status: 'on_track',
    owner: 'Growth Team',
    department: 'growth',
    period: 'MTD',
    notes: 'Under budget - favorable',
  },
  {
    id: 'returns',
    name: 'Returns',
    category: 'Operations',
    value: 30373,
    target: 37651,
    unit: 'currency',
    trend: 'down',
    variance: 3767, // Favorable
    variancePercent: 10.0,
    status: 'on_track',
    owner: 'CS Team',
    department: 'customer_success',
    period: 'MTD',
    notes: 'Under budget - favorable',
  },

  // ============================================
  // CHANNEL BREAKDOWN
  // ============================================
  {
    id: 'online_store',
    name: 'Online Store Revenue',
    category: 'Channels',
    value: 619090,
    target: 700000,
    unit: 'currency',
    trend: 'flat',
    variance: -80910,
    variancePercent: -11.6,
    status: 'warning',
    owner: 'Brandon',
    department: 'growth',
    period: 'MTD',
  },
  {
    id: 'tiktok_shop',
    name: 'TikTok Shop Revenue',
    category: 'Channels',
    value: 3875,
    target: 10000,
    unit: 'currency',
    trend: 'down',
    variance: -6125,
    variancePercent: -61.3,
    status: 'critical',
    owner: 'TBD',
    department: 'growth',
    period: 'MTD',
    notes: 'Needs channel owner and strategy',
  },
  {
    id: 'reprally',
    name: 'RepRally Revenue',
    category: 'Channels',
    value: 2329,
    target: 5000,
    unit: 'currency',
    trend: 'down',
    variance: -2671,
    variancePercent: -53.4,
    status: 'warning',
    owner: 'Retail Team',
    department: 'retail',
    period: 'MTD',
  },
];

// Unit economics constants
// Updated Jan 2026: CM higher than expected, push CAC for volume
export const UNIT_ECONOMICS = {
  baseUnit: '4-pack',
  cashCogs: 4.76, // per 4-pack
  cogsPerCan: 1.19,
  dtcCM: 0.43, // 43% actual (Nov close, Cramer confirmed)
  dtcCMFloor: 0.35, // Min acceptable when pushing spend
  retailCM: 0.30, // 30% after trade
  retailDSO: 55, // days
  dtcCAC: 65, // target (raised from 55 - push for volume)
  dtcCACMax: 85, // ceiling when cash healthy
  subConversionRate: 0.5049, // 50.49%
  ltvMultiples: {
    month3: 2.5,
    month6: 3.5,
    month9: 4.6,
    month12: 5.2,
  },
  retailAlpha: 0.137, // retail revenue per $1 paid spend
};

// Helper functions
export function getKPIsByDepartment(department: string): KPIMetric[] {
  return CURRENT_KPIS.filter((kpi) => kpi.department === department);
}

export function getKPIsByCategory(category: string): KPIMetric[] {
  return CURRENT_KPIS.filter((kpi) => kpi.category === category);
}

export function getKPIsByStatus(status: KPIMetric['status']): KPIMetric[] {
  return CURRENT_KPIS.filter((kpi) => kpi.status === status);
}

export function getCriticalKPIs(): KPIMetric[] {
  return CURRENT_KPIS.filter((kpi) => kpi.status === 'critical');
}

export function getWarningKPIs(): KPIMetric[] {
  return CURRENT_KPIS.filter((kpi) => kpi.status === 'warning');
}

export function formatKPIValue(kpi: KPIMetric): string {
  switch (kpi.unit) {
    case 'currency':
      return `$${kpi.value.toLocaleString()}`;
    case 'percentage':
      return `${kpi.value.toFixed(1)}%`;
    case 'ratio':
      return kpi.value.toFixed(2);
    case 'number':
      return kpi.value.toLocaleString();
    default:
      return String(kpi.value);
  }
}

export function formatVariance(kpi: KPIMetric): string {
  const sign = kpi.variance >= 0 ? '+' : '';
  switch (kpi.unit) {
    case 'currency':
      return `${sign}$${Math.abs(kpi.variance).toLocaleString()}`;
    case 'percentage':
      return `${sign}${kpi.variance.toFixed(1)}%`;
    case 'ratio':
      return `${sign}${kpi.variance.toFixed(2)}`;
    default:
      return `${sign}${kpi.variance.toLocaleString()}`;
  }
}

// Summary stats
export function getKPISummary() {
  const total = CURRENT_KPIS.length;
  const onTrack = CURRENT_KPIS.filter((k) => k.status === 'on_track').length;
  const warning = CURRENT_KPIS.filter((k) => k.status === 'warning').length;
  const critical = CURRENT_KPIS.filter((k) => k.status === 'critical').length;

  return {
    total,
    onTrack,
    warning,
    critical,
    healthScore: Math.round((onTrack / total) * 100),
  };
}
