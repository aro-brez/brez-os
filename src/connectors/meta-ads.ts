/**
 * Meta (Facebook/Instagram) Ads Connector
 *
 * Fetches real ad performance data from Meta Marketing API
 * Provides: spend, CAC, ROAS, pacing vs targets
 */

export interface MetaAdsCredentials {
  accessToken: string;
  adAccountId: string; // Format: act_XXXXXXXXX
}

export interface MetaAdInsight {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  purchases: number;
  purchaseValue: number;
  cpc: number;
  cpm: number;
  ctr: number;
  costPerPurchase: number;
  roas: number;
}

export interface MetaAdTargets {
  dailySpendTarget: number;
  cacTarget: number;
  roasTarget: number;
}

export interface MetaAdPacing {
  spend: { actual: number; target: number; pacing: number; status: 'under' | 'on_track' | 'over' };
  cac: { actual: number; target: number; efficiency: number; status: 'efficient' | 'on_target' | 'inefficient' };
  roas: { actual: number; target: number; status: 'below' | 'on_target' | 'above' };
}

export interface MetaAdsMetrics {
  today: MetaAdInsight;
  yesterday: MetaAdInsight;
  last7Days: MetaAdInsight;
  last30Days: MetaAdInsight;
  mtd: MetaAdInsight;
  pacing: MetaAdPacing;
  connected: boolean;
  lastSync: string;
}

const META_API_VERSION = 'v18.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Validate Meta Ads credentials by making a test API call
 */
export async function validateMetaCredentials(creds: MetaAdsCredentials): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${META_API_BASE}/${creds.adAccountId}?fields=name,account_status&access_token=${creds.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.error?.message || 'Invalid credentials' };
    }

    const data = await response.json();
    if (data.account_status !== 1) {
      return { valid: false, error: 'Ad account is not active' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

/**
 * Fetch ad insights for a date range
 */
export async function fetchMetaInsights(
  creds: MetaAdsCredentials,
  startDate: string,
  endDate: string
): Promise<MetaAdInsight[]> {
  const fields = [
    'spend',
    'impressions',
    'clicks',
    'reach',
    'actions',
    'action_values',
    'cpc',
    'cpm',
    'ctr',
    'cost_per_action_type',
  ].join(',');

  const response = await fetch(
    `${META_API_BASE}/${creds.adAccountId}/insights?` +
    `fields=${fields}&` +
    `time_range={"since":"${startDate}","until":"${endDate}"}&` +
    `time_increment=1&` +
    `access_token=${creds.accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch insights');
  }

  const data = await response.json();

  return (data.data || []).map((row: Record<string, unknown>) => {
    const actions = (row.actions as Array<{ action_type: string; value: string }>) || [];
    const actionValues = (row.action_values as Array<{ action_type: string; value: string }>) || [];
    const costPerAction = (row.cost_per_action_type as Array<{ action_type: string; value: string }>) || [];

    const purchases = actions.find(a => a.action_type === 'purchase')?.value || '0';
    const purchaseValue = actionValues.find(a => a.action_type === 'purchase')?.value || '0';
    const costPerPurchase = costPerAction.find(a => a.action_type === 'purchase')?.value || '0';

    const spend = parseFloat(row.spend as string) || 0;
    const purchaseValueNum = parseFloat(purchaseValue);

    return {
      date: row.date_start as string,
      spend,
      impressions: parseInt(row.impressions as string) || 0,
      clicks: parseInt(row.clicks as string) || 0,
      reach: parseInt(row.reach as string) || 0,
      purchases: parseInt(purchases),
      purchaseValue: purchaseValueNum,
      cpc: parseFloat(row.cpc as string) || 0,
      cpm: parseFloat(row.cpm as string) || 0,
      ctr: parseFloat(row.ctr as string) || 0,
      costPerPurchase: parseFloat(costPerPurchase),
      roas: spend > 0 ? purchaseValueNum / spend : 0,
    };
  });
}

/**
 * Aggregate insights into a single period summary
 */
function aggregateInsights(insights: MetaAdInsight[]): MetaAdInsight {
  if (insights.length === 0) {
    return {
      date: new Date().toISOString().split('T')[0],
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      purchases: 0,
      purchaseValue: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      costPerPurchase: 0,
      roas: 0,
    };
  }

  const totals = insights.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      reach: acc.reach + row.reach,
      purchases: acc.purchases + row.purchases,
      purchaseValue: acc.purchaseValue + row.purchaseValue,
    }),
    { spend: 0, impressions: 0, clicks: 0, reach: 0, purchases: 0, purchaseValue: 0 }
  );

  return {
    date: insights[0].date,
    spend: totals.spend,
    impressions: totals.impressions,
    clicks: totals.clicks,
    reach: totals.reach,
    purchases: totals.purchases,
    purchaseValue: totals.purchaseValue,
    cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
    cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    costPerPurchase: totals.purchases > 0 ? totals.spend / totals.purchases : 0,
    roas: totals.spend > 0 ? totals.purchaseValue / totals.spend : 0,
  };
}

/**
 * Calculate pacing against targets
 */
function calculatePacing(metrics: MetaAdInsight, targets: MetaAdTargets, days: number): MetaAdPacing {
  const targetSpendTotal = targets.dailySpendTarget * days;
  const spendPacing = targetSpendTotal > 0 ? (metrics.spend / targetSpendTotal) * 100 : 0;
  const cacEfficiency = targets.cacTarget > 0 ? targets.cacTarget / metrics.costPerPurchase : 0;

  return {
    spend: {
      actual: metrics.spend,
      target: targetSpendTotal,
      pacing: spendPacing,
      status: spendPacing < 90 ? 'under' : spendPacing > 110 ? 'over' : 'on_track',
    },
    cac: {
      actual: metrics.costPerPurchase,
      target: targets.cacTarget,
      efficiency: cacEfficiency,
      status: cacEfficiency > 1.1 ? 'efficient' : cacEfficiency > 0.9 ? 'on_target' : 'inefficient',
    },
    roas: {
      actual: metrics.roas,
      target: targets.roasTarget,
      status: metrics.roas < targets.roasTarget * 0.9 ? 'below' :
              metrics.roas > targets.roasTarget * 1.1 ? 'above' : 'on_target',
    },
  };
}

/**
 * Get formatted date strings for various periods
 */
function getDateRanges(): Record<string, { start: string; end: string; days: number }> {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    today: { start: format(today), end: format(today), days: 1 },
    yesterday: { start: format(yesterday), end: format(yesterday), days: 1 },
    last7Days: { start: format(weekAgo), end: format(today), days: 7 },
    last30Days: { start: format(monthAgo), end: format(today), days: 30 },
    mtd: { start: format(mtdStart), end: format(today), days: today.getDate() },
  };
}

/**
 * Get complete Meta Ads metrics with pacing
 */
export async function getMetaAdsMetrics(
  creds: MetaAdsCredentials,
  targets: MetaAdTargets
): Promise<MetaAdsMetrics> {
  const ranges = getDateRanges();

  // Fetch all periods in parallel
  const [todayData, yesterdayData, last7Data, last30Data, mtdData] = await Promise.all([
    fetchMetaInsights(creds, ranges.today.start, ranges.today.end),
    fetchMetaInsights(creds, ranges.yesterday.start, ranges.yesterday.end),
    fetchMetaInsights(creds, ranges.last7Days.start, ranges.last7Days.end),
    fetchMetaInsights(creds, ranges.last30Days.start, ranges.last30Days.end),
    fetchMetaInsights(creds, ranges.mtd.start, ranges.mtd.end),
  ]);

  const mtdAggregated = aggregateInsights(mtdData);

  return {
    today: aggregateInsights(todayData),
    yesterday: aggregateInsights(yesterdayData),
    last7Days: aggregateInsights(last7Data),
    last30Days: aggregateInsights(last30Data),
    mtd: mtdAggregated,
    pacing: calculatePacing(mtdAggregated, targets, ranges.mtd.days),
    connected: true,
    lastSync: new Date().toISOString(),
  };
}

/**
 * Fallback metrics when not connected (uses stored/manual data)
 */
export function getMetaAdsFallback(): MetaAdsMetrics {
  const emptyInsight: MetaAdInsight = {
    date: new Date().toISOString().split('T')[0],
    spend: 0,
    impressions: 0,
    clicks: 0,
    reach: 0,
    purchases: 0,
    purchaseValue: 0,
    cpc: 0,
    cpm: 0,
    ctr: 0,
    costPerPurchase: 0,
    roas: 0,
  };

  return {
    today: emptyInsight,
    yesterday: emptyInsight,
    last7Days: emptyInsight,
    last30Days: emptyInsight,
    mtd: emptyInsight,
    pacing: {
      spend: { actual: 0, target: 0, pacing: 0, status: 'under' },
      cac: { actual: 0, target: 0, efficiency: 0, status: 'on_target' },
      roas: { actual: 0, target: 0, status: 'on_target' },
    },
    connected: false,
    lastSync: '',
  };
}
