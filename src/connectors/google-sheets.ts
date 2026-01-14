/**
 * Google Sheets Connector for Cash Flow Data
 *
 * Connects to a Google Spreadsheet containing cash flow projections
 * Provides: working capital, projections, runway calculations
 *
 * Expected spreadsheet format:
 * - Sheet: "Cash Flow"
 * - Columns: Date | Expected Inflow | Expected Outflow | Loan Payment | Notes
 * - Plus a "Summary" sheet with current balance and key figures
 */

export interface GoogleSheetsCredentials {
  apiKey?: string;           // For public sheets
  accessToken?: string;      // For OAuth-authenticated access
  spreadsheetId: string;
}

export interface CashFlowRow {
  date: string;
  expectedInflow: number;
  expectedOutflow: number;
  loanPayment: number;
  netFlow: number;
  notes: string;
}

export interface CashFlowSummary {
  currentBalance: number;
  projectedBalance30Days: number;
  projectedBalance60Days: number;
  projectedBalance90Days: number;
  totalExpectedInflow30Days: number;
  totalExpectedOutflow30Days: number;
  totalLoanPayments30Days: number;
  runwayDays: number;
  runwayWeeks: number;
  cashFloor: number;
  daysUntilFloor: number | null;
  status: 'healthy' | 'watch' | 'critical';
}

export interface WorkingCapitalMetrics {
  summary: CashFlowSummary;
  next30Days: CashFlowRow[];
  weeklyProjections: Array<{
    weekEnding: string;
    projectedBalance: number;
    netFlow: number;
  }>;
  connected: boolean;
  lastSync: string;
  sheetName: string;
}

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetch data from a Google Sheet range
 */
async function fetchSheetRange(
  creds: GoogleSheetsCredentials,
  range: string
): Promise<string[][]> {
  const authParam = creds.accessToken
    ? `access_token=${creds.accessToken}`
    : `key=${creds.apiKey}`;

  const response = await fetch(
    `${SHEETS_API_BASE}/${creds.spreadsheetId}/values/${encodeURIComponent(range)}?${authParam}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch sheet data');
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Parse a currency string to number (handles $, commas, parentheses for negative)
 */
function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,]/g, '').trim();
  // Handle parentheses for negative numbers: (100) = -100
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.slice(1, -1)) || 0;
  }
  return parseFloat(cleaned) || 0;
}

/**
 * Parse date string (handles various formats)
 */
function parseDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Validate Google Sheets credentials
 */
export async function validateSheetsCredentials(
  creds: GoogleSheetsCredentials
): Promise<{ valid: boolean; sheetName?: string; error?: string }> {
  try {
    const authParam = creds.accessToken
      ? `access_token=${creds.accessToken}`
      : `key=${creds.apiKey}`;

    const response = await fetch(
      `${SHEETS_API_BASE}/${creds.spreadsheetId}?fields=properties.title&${authParam}`
    );

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.error?.message || 'Invalid credentials or sheet ID' };
    }

    const data = await response.json();
    return { valid: true, sheetName: data.properties?.title };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

/**
 * Fetch cash flow projections from the spreadsheet
 * Assumes sheet has header row and data in columns: Date, Inflow, Outflow, Loan Payment, Notes
 */
export async function fetchCashFlowData(
  creds: GoogleSheetsCredentials,
  sheetName: string = 'Cash Flow'
): Promise<CashFlowRow[]> {
  const rows = await fetchSheetRange(creds, `'${sheetName}'!A2:E100`);

  return rows
    .filter(row => row[0]) // Has a date
    .map(row => {
      const expectedInflow = parseCurrency(row[1] || '0');
      const expectedOutflow = parseCurrency(row[2] || '0');
      const loanPayment = parseCurrency(row[3] || '0');

      return {
        date: parseDate(row[0]),
        expectedInflow,
        expectedOutflow,
        loanPayment,
        netFlow: expectedInflow - expectedOutflow - loanPayment,
        notes: row[4] || '',
      };
    })
    .filter(row => row.date) // Valid date
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch summary data (current balance, floor) from Summary sheet
 * Expects named cells or specific layout:
 * A1: "Current Balance", B1: value
 * A2: "Cash Floor", B2: value
 */
export async function fetchCashSummary(
  creds: GoogleSheetsCredentials,
  sheetName: string = 'Summary'
): Promise<{ currentBalance: number; cashFloor: number }> {
  try {
    const rows = await fetchSheetRange(creds, `'${sheetName}'!A1:B10`);

    let currentBalance = 0;
    let cashFloor = 300000; // Default

    for (const row of rows) {
      const label = (row[0] || '').toLowerCase();
      if (label.includes('current balance') || label.includes('cash balance')) {
        currentBalance = parseCurrency(row[1] || '0');
      }
      if (label.includes('cash floor') || label.includes('minimum')) {
        cashFloor = parseCurrency(row[1] || '300000');
      }
    }

    return { currentBalance, cashFloor };
  } catch {
    // Summary sheet might not exist, return defaults
    return { currentBalance: 0, cashFloor: 300000 };
  }
}

/**
 * Calculate projections from cash flow data
 */
function calculateProjections(
  currentBalance: number,
  cashFloor: number,
  cashFlowData: CashFlowRow[]
): CashFlowSummary {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];

  // Filter to future dates
  const futureData = cashFlowData.filter(row => row.date >= format(today));

  // Calculate 30/60/90 day projections
  const date30 = new Date(today);
  date30.setDate(date30.getDate() + 30);
  const date60 = new Date(today);
  date60.setDate(date60.getDate() + 60);
  const date90 = new Date(today);
  date90.setDate(date90.getDate() + 90);

  const next30 = futureData.filter(row => row.date <= format(date30));
  const next60 = futureData.filter(row => row.date <= format(date60));
  const next90 = futureData.filter(row => row.date <= format(date90));

  const sum30 = next30.reduce((acc, row) => acc + row.netFlow, 0);
  const sum60 = next60.reduce((acc, row) => acc + row.netFlow, 0);
  const sum90 = next90.reduce((acc, row) => acc + row.netFlow, 0);

  const projected30 = currentBalance + sum30;
  const projected60 = currentBalance + sum60;
  const projected90 = currentBalance + sum90;

  // Calculate when we hit cash floor
  let runningBalance = currentBalance;
  let daysUntilFloor: number | null = null;
  let dayCount = 0;

  for (const row of futureData) {
    runningBalance += row.netFlow;
    dayCount++;
    if (runningBalance < cashFloor && daysUntilFloor === null) {
      daysUntilFloor = dayCount;
    }
  }

  // If we never hit floor in the data, estimate based on burn rate
  const avgDailyBurn = next30.length > 0
    ? -next30.reduce((acc, row) => acc + row.netFlow, 0) / 30
    : 0;

  const runway = avgDailyBurn > 0
    ? Math.floor((currentBalance - cashFloor) / avgDailyBurn)
    : 999;

  // Determine status
  let status: 'healthy' | 'watch' | 'critical' = 'healthy';
  if (currentBalance < cashFloor) {
    status = 'critical';
  } else if (currentBalance < cashFloor * 1.5 || runway < 60) {
    status = 'watch';
  }

  return {
    currentBalance,
    projectedBalance30Days: projected30,
    projectedBalance60Days: projected60,
    projectedBalance90Days: projected90,
    totalExpectedInflow30Days: next30.reduce((acc, row) => acc + row.expectedInflow, 0),
    totalExpectedOutflow30Days: next30.reduce((acc, row) => acc + row.expectedOutflow, 0),
    totalLoanPayments30Days: next30.reduce((acc, row) => acc + row.loanPayment, 0),
    runwayDays: runway,
    runwayWeeks: Math.floor(runway / 7),
    cashFloor,
    daysUntilFloor,
    status,
  };
}

/**
 * Generate weekly projection breakdown
 */
function generateWeeklyProjections(
  currentBalance: number,
  cashFlowData: CashFlowRow[]
): Array<{ weekEnding: string; projectedBalance: number; netFlow: number }> {
  const today = new Date();
  const weeks: Array<{ weekEnding: string; projectedBalance: number; netFlow: number }> = [];

  let runningBalance = currentBalance;

  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekData = cashFlowData.filter(
      row => row.date >= weekStartStr && row.date <= weekEndStr
    );

    const netFlow = weekData.reduce((acc, row) => acc + row.netFlow, 0);
    runningBalance += netFlow;

    weeks.push({
      weekEnding: weekEndStr,
      projectedBalance: runningBalance,
      netFlow,
    });
  }

  return weeks;
}

/**
 * Get complete working capital metrics from Google Sheets
 */
export async function getWorkingCapitalMetrics(
  creds: GoogleSheetsCredentials,
  cashFlowSheetName: string = 'Cash Flow',
  summarySheetName: string = 'Summary'
): Promise<WorkingCapitalMetrics> {
  const [cashFlowData, summaryData] = await Promise.all([
    fetchCashFlowData(creds, cashFlowSheetName),
    fetchCashSummary(creds, summarySheetName),
  ]);

  const today = new Date();
  const date30 = new Date(today);
  date30.setDate(date30.getDate() + 30);
  const todayStr = today.toISOString().split('T')[0];
  const date30Str = date30.toISOString().split('T')[0];

  const next30Days = cashFlowData.filter(
    row => row.date >= todayStr && row.date <= date30Str
  );

  return {
    summary: calculateProjections(
      summaryData.currentBalance,
      summaryData.cashFloor,
      cashFlowData
    ),
    next30Days,
    weeklyProjections: generateWeeklyProjections(
      summaryData.currentBalance,
      cashFlowData
    ),
    connected: true,
    lastSync: new Date().toISOString(),
    sheetName: cashFlowSheetName,
  };
}

/**
 * Fallback metrics when not connected
 */
export function getWorkingCapitalFallback(): WorkingCapitalMetrics {
  return {
    summary: {
      currentBalance: 0,
      projectedBalance30Days: 0,
      projectedBalance60Days: 0,
      projectedBalance90Days: 0,
      totalExpectedInflow30Days: 0,
      totalExpectedOutflow30Days: 0,
      totalLoanPayments30Days: 0,
      runwayDays: 0,
      runwayWeeks: 0,
      cashFloor: 300000,
      daysUntilFloor: null,
      status: 'critical',
    },
    next30Days: [],
    weeklyProjections: [],
    connected: false,
    lastSync: '',
    sheetName: '',
  };
}
