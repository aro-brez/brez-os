// BREZ Retail Q1 Goals by Region/Rep
// Data from Q1 Goals spreadsheet

export interface RetailGoal {
  month: string;
  kpi: string;
  goalName: string;
  regions: {
    southeast_lucas: number;
    west_blake: number;
    midwest_mike: number;
    northeast_zach: number;
    mid_atlantic_nick: number;
    other_niall: number;
  };
  total: number;
}

export interface RetailRep {
  id: string;
  name: string;
  region: string;
  color: string;
}

export const RETAIL_REPS: RetailRep[] = [
  { id: 'lucas', name: 'Lucas', region: 'Southeast', color: '#e3f98a' },
  { id: 'blake', name: 'Blake', region: 'West', color: '#65cdd8' },
  { id: 'mike', name: 'Mike', region: 'Midwest', color: '#8533fc' },
  { id: 'zach', name: 'Zach', region: 'Northeast', color: '#EC4899' },
  { id: 'nick', name: 'Nick', region: 'Mid-Atlantic', color: '#F59E0B' },
  { id: 'niall', name: 'Niall', region: 'Other', color: '#6BCB77' },
  { id: 'robbie', name: 'Robbie', region: 'National', color: '#06B6D4' },
  { id: 'cat', name: 'Cat', region: 'National', color: '#F472B6' },
];

// January Goals
export const JANUARY_GOALS: RetailGoal[] = [
  {
    month: 'January',
    kpi: 'KPI 1',
    goalName: 'Infused 25% Growth',
    regions: {
      southeast_lucas: 1400,
      west_blake: 140,
      midwest_mike: 592,
      northeast_zach: 250,
      mid_atlantic_nick: 500,
      other_niall: 50,
    },
    total: 2932,
  },
  {
    month: 'January',
    kpi: 'KPI 2',
    goalName: 'Functional Doors',
    regions: {
      southeast_lucas: 200,
      west_blake: 88,
      midwest_mike: 75,
      northeast_zach: 150,
      mid_atlantic_nick: 50,
      other_niall: 200,
    },
    total: 763,
  },
  {
    month: 'January',
    kpi: 'KPI 3',
    goalName: 'Functional Pod Goal',
    regions: {
      southeast_lucas: 300,
      west_blake: 163,
      midwest_mike: 300,
      northeast_zach: 350,
      mid_atlantic_nick: 100,
      other_niall: 400,
    },
    total: 1613,
  },
  {
    month: 'January',
    kpi: 'KPI 4',
    goalName: 'Visits - See per Employee',
    regions: {
      southeast_lucas: 100,
      west_blake: 75,
      midwest_mike: 75,
      northeast_zach: 80,
      mid_atlantic_nick: 50,
      other_niall: 75,
    },
    total: 455,
  },
];

// February Goals
export const FEBRUARY_GOALS: RetailGoal[] = [
  {
    month: 'February',
    kpi: 'KPI 1',
    goalName: 'Infused 25% Growth',
    regions: {
      southeast_lucas: 1550,
      west_blake: 274,
      midwest_mike: 682,
      northeast_zach: 275,
      mid_atlantic_nick: 550,
      other_niall: 50,
    },
    total: 3381,
  },
  {
    month: 'February',
    kpi: 'KPI 2',
    goalName: 'Functional Doors',
    regions: {
      southeast_lucas: 250,
      west_blake: 172,
      midwest_mike: 105,
      northeast_zach: 250,
      mid_atlantic_nick: 75,
      other_niall: 200,
    },
    total: 1052,
  },
  {
    month: 'February',
    kpi: 'KPI 3',
    goalName: 'Functional Pod Goal',
    regions: {
      southeast_lucas: 500,
      west_blake: 331,
      midwest_mike: 400,
      northeast_zach: 500,
      mid_atlantic_nick: 150,
      other_niall: 400,
    },
    total: 2281,
  },
  {
    month: 'February',
    kpi: 'KPI 4',
    goalName: 'Visits - See per Employee',
    regions: {
      southeast_lucas: 50,
      west_blake: 151,
      midwest_mike: 75,
      northeast_zach: 65,
      mid_atlantic_nick: 75,
      other_niall: 45,
    },
    total: 461,
  },
];

// March Goals
export const MARCH_GOALS: RetailGoal[] = [
  {
    month: 'March',
    kpi: 'KPI 1',
    goalName: 'Infused 25% Growth',
    regions: {
      southeast_lucas: 1671,
      west_blake: 400,
      midwest_mike: 792,
      northeast_zach: 312,
      mid_atlantic_nick: 590,
      other_niall: 50,
    },
    total: 3815,
  },
  {
    month: 'March',
    kpi: 'KPI 2',
    goalName: 'Functional Doors',
    regions: {
      southeast_lucas: 350,
      west_blake: 250,
      midwest_mike: 120,
      northeast_zach: 325,
      mid_atlantic_nick: 125,
      other_niall: 200,
    },
    total: 1370,
  },
  {
    month: 'March',
    kpi: 'KPI 3',
    goalName: 'Functional Pod Goal',
    regions: {
      southeast_lucas: 700,
      west_blake: 500,
      midwest_mike: 500,
      northeast_zach: 650,
      mid_atlantic_nick: 250,
      other_niall: 400,
    },
    total: 3000,
  },
  {
    month: 'March',
    kpi: 'KPI 4',
    goalName: 'Visits - See per Employee',
    regions: {
      southeast_lucas: 75,
      west_blake: 228,
      midwest_mike: 75,
      northeast_zach: 80,
      mid_atlantic_nick: 100,
      other_niall: 60,
    },
    total: 618,
  },
];

// Q1 Revenue Targets by Region
export const Q1_REVENUE_TARGETS = {
  january: {
    southeast_lucas: 300000,
    west_blake: 90000,
    midwest_mike: 110000,
    northeast_zach: 75000,
    mid_atlantic_nick: 50000,
    other_niall: 105000,
    total: 730000,
  },
  february: {
    southeast_lucas: 350000,
    west_blake: 100000,
    midwest_mike: 120000,
    northeast_zach: 75000,
    mid_atlantic_nick: 100000,
    other_niall: 115000,
    total: 860000,
  },
  march: {
    southeast_lucas: 405000,
    west_blake: 100000,
    midwest_mike: 130000,
    northeast_zach: 100000,
    mid_atlantic_nick: 105000,
    other_niall: 115000,
    total: 955000,
  },
  q1_total: {
    southeast_lucas: 1055000,
    west_blake: 290000,
    midwest_mike: 350000,
    northeast_zach: 250000,
    mid_atlantic_nick: 255000,
    other_niall: 310000,
    total: 2510000,
  },
};

// Q1 Totals Summary
export const Q1_TOTALS = {
  infused_25_growth: 3915,
  functional_doors: 1550,
  functional_pod_goal: 3100,
  visits_per_employee: 1305,
  quarterly_revenue_target: 2510000,
};

// Get all goals for a specific month
export function getGoalsByMonth(month: 'January' | 'February' | 'March'): RetailGoal[] {
  switch (month) {
    case 'January':
      return JANUARY_GOALS;
    case 'February':
      return FEBRUARY_GOALS;
    case 'March':
      return MARCH_GOALS;
    default:
      return [];
  }
}

// Get goals by KPI type across all months
export function getGoalsByKPI(kpiNumber: 1 | 2 | 3 | 4): RetailGoal[] {
  const allGoals = [...JANUARY_GOALS, ...FEBRUARY_GOALS, ...MARCH_GOALS];
  return allGoals.filter((g) => g.kpi === `KPI ${kpiNumber}`);
}

// Calculate regional totals for Q1
export function getRegionalQ1Totals() {
  const allGoals = [...JANUARY_GOALS, ...FEBRUARY_GOALS, ...MARCH_GOALS];

  const totals: Record<string, Record<string, number>> = {};

  for (const goal of allGoals) {
    if (!totals[goal.kpi]) {
      totals[goal.kpi] = {
        southeast_lucas: 0,
        west_blake: 0,
        midwest_mike: 0,
        northeast_zach: 0,
        mid_atlantic_nick: 0,
        other_niall: 0,
        total: 0,
      };
    }

    for (const [region, value] of Object.entries(goal.regions)) {
      totals[goal.kpi][region] += value;
    }
    totals[goal.kpi].total += goal.total;
  }

  return totals;
}
