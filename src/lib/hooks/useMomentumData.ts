import { useMemo } from 'react';
import {
  CASH_POSITION,
  DTC_YTD_2025,
  RETAIL_VELOCITY_2025,
  UNIT_ECONOMICS,
  VALIDATED_METRICS,
  GROWTH_GENERATOR,
} from '@/lib/data/source-of-truth';

export interface Lever {
  name: string;
  category: 'ads' | 'conversion' | 'retention' | 'retail';
  current: number;
  target: number;
  currentDisplay: string;
  targetDisplay: string;
  impact: number;
  description: string;
}

export interface MomentumData {
  // Trajectory
  trajectory: 'gaining' | 'losing' | 'stable';
  trajectoryPercent: number;
  trajectoryReason: string;

  // Investment capacity
  canInvestMore: 'yes' | 'caution' | 'no';
  cashHeadroom: number;
  weeklySpendCeiling: number;

  // Top 4 levers
  levers: Lever[];

  // The Chain (DTC -> Demand -> Retail)
  chain: {
    dtcWeeklySpend: number;
    dtcSpendTrend: 'up' | 'down' | 'flat';
    demandLagWeeks: number;
    retailWeeklyVelocity: number;
    retailLagWeeks: number;
    alpha: number;
  };

  // Cash Guardrails
  cash: {
    current: number;
    floor: number;
    runwayWeeks: number;
    apTotal: number;
    apCritical: number;
    loanAvailable: number;
  };

  // LTV Economics
  economics: {
    cac: number;
    paybackMonths: number;
    ltvCacRatio: number;
    contributionMargin: number;
  };

  // Data freshness
  lastUpdated: string;
}

export function useMomentumData(): MomentumData {
  return useMemo(() => {
    // Calculate trajectory from DTC trends
    const months = Object.values(DTC_YTD_2025.monthly);
    const recentMonths = months.slice(-2);
    const [prev, current] = recentMonths;

    // Trajectory scoring
    const cacImproving = current.cac < prev.cac;
    const spendUp = current.spend > prev.spend * 0.9; // Allow 10% drop as stable
    const customersUp = current.newCustomers > prev.newCustomers * 0.9;

    let trajectoryScore = 0;
    if (cacImproving) trajectoryScore += 30;
    if (spendUp) trajectoryScore += 20;
    if (customersUp) trajectoryScore += 25;
    // Add sub revenue trend
    if (current.subRevenue > prev.subRevenue) trajectoryScore += 25;

    const trajectory: 'gaining' | 'losing' | 'stable' =
      trajectoryScore >= 60 ? 'gaining' : trajectoryScore >= 40 ? 'stable' : 'losing';

    const trajectoryPercent = ((current.newCustomers - prev.newCustomers) / prev.newCustomers) * 100;

    let trajectoryReason = '';
    if (trajectory === 'gaining') {
      trajectoryReason = 'CAC improving and subscription revenue growing';
    } else if (trajectory === 'losing') {
      trajectoryReason = 'New customer acquisition declined and CAC increased';
    } else {
      trajectoryReason = 'Metrics holding steady with minor fluctuations';
    }

    // Investment capacity
    const headroom = CASH_POSITION.cashOnHand - CASH_POSITION.minimumReserve;
    const weeklyBurn = CASH_POSITION.weeklyFixedOpex.totalMonthly / 4.33;
    const runwayWeeks = Math.floor(headroom / weeklyBurn);

    let canInvestMore: 'yes' | 'caution' | 'no' = 'no';
    let weeklySpendCeiling = 0;

    if (runwayWeeks > 8 && headroom > 200000) {
      canInvestMore = 'yes';
      weeklySpendCeiling = 55000;
    } else if (runwayWeeks > 4 && headroom > 80000) {
      canInvestMore = 'caution';
      weeklySpendCeiling = 45000;
    } else {
      canInvestMore = 'no';
      weeklySpendCeiling = 30000;
    }

    // Top 4 levers (sorted by impact)
    const levers: Lever[] = [
      {
        name: 'Ads + Creative Iteration',
        category: 'ads',
        current: DTC_YTD_2025.ytd.cac,
        target: GROWTH_GENERATOR.targets.maxCAC,
        currentDisplay: `$${DTC_YTD_2025.ytd.cac.toFixed(0)}`,
        targetDisplay: `$${GROWTH_GENERATOR.targets.maxCAC}`,
        impact: 32000,
        description: 'Lower CAC through better creative and targeting',
      },
      {
        name: 'Website Conversion',
        category: 'conversion',
        current: DTC_YTD_2025.ytd.cvr,
        target: 0.028,
        currentDisplay: `${(DTC_YTD_2025.ytd.cvr * 100).toFixed(1)}%`,
        targetDisplay: '2.8%',
        impact: 47000,
        description: 'More customers from same traffic',
      },
      {
        name: 'Customer Journey / Retention',
        category: 'retention',
        current: UNIT_ECONOMICS.subscription.conversionRate,
        target: 0.55,
        currentDisplay: `${(UNIT_ECONOMICS.subscription.conversionRate * 100).toFixed(0)}%`,
        targetDisplay: '55%',
        impact: 28000,
        description: 'More subscribers, lower churn',
      },
      {
        name: 'Retail Marketing (QR, DTC Bridge)',
        category: 'retail',
        current: VALIDATED_METRICS.alpha,
        target: 0.15,
        currentDisplay: `${(VALIDATED_METRICS.alpha * 100).toFixed(1)}%`,
        targetDisplay: '15%',
        impact: 25000,
        description: 'Higher retail velocity per ad dollar',
      },
    ].sort((a, b) => b.impact - a.impact);

    // The Chain
    const weeklyDtcSpend = DTC_YTD_2025.ytd.spend / 20; // ~20 weeks of data
    const retailWeeklyVelocity = RETAIL_VELOCITY_2025.avgWeeklyRevenue;

    const chain = {
      dtcWeeklySpend: weeklyDtcSpend,
      dtcSpendTrend: current.spend > prev.spend ? 'up' as const : current.spend < prev.spend * 0.9 ? 'down' as const : 'flat' as const,
      demandLagWeeks: 3,
      retailWeeklyVelocity,
      retailLagWeeks: 6,
      alpha: VALIDATED_METRICS.alpha,
    };

    // Cash Guardrails
    const apCritical = CASH_POSITION.accountsPayable.days91plus;
    const cash = {
      current: CASH_POSITION.cashOnHand,
      floor: CASH_POSITION.minimumReserve,
      runwayWeeks,
      apTotal: CASH_POSITION.accountsPayable.total,
      apCritical,
      loanAvailable: CASH_POSITION.loanOption.amount,
    };

    // LTV Economics
    const cac = DTC_YTD_2025.ytd.cac;
    const subValue = DTC_YTD_2025.ytd.subAOV * 12 * 0.43; // Annual sub value at 43% margin
    const paybackMonths = cac / (subValue / 12);

    const economics = {
      cac,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      ltvCacRatio: UNIT_ECONOMICS.ltvMultiples.month12,
      contributionMargin: UNIT_ECONOMICS.margins.dtc.contributionMarginActual,
    };

    return {
      trajectory,
      trajectoryPercent: Math.round(trajectoryPercent * 10) / 10,
      trajectoryReason,
      canInvestMore,
      cashHeadroom: headroom,
      weeklySpendCeiling,
      levers,
      chain,
      cash,
      economics,
      lastUpdated: 'Jan 13, 2026',
    };
  }, []);
}
