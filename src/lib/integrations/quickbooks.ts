/**
 * QuickBooks Integration - Real-time financial data
 * Pulls: Cash balance, AP/AR, Runway, P&L summary
 */

export interface QuickBooksMetrics {
  cash: {
    balance: number;
    availableBalance: number;
    lastDeposit: number;
    lastDepositDate: string;
  };
  ap: {
    total: number;
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90Plus: number;
    vendorCount: number;
  };
  ar: {
    total: number;
    current: number;
    overdue: number;
  };
  runway: {
    weeks: number;
    burnRate: number; // weekly
    monthlyBurn: number;
  };
  pnl: {
    revenuesMTD: number;
    expensesMTD: number;
    netIncomeMTD: number;
  };
  lastUpdated: string;
  dataSource: "quickbooks";
}

// QuickBooks OAuth2 client
class QuickBooksClient {
  private accessToken: string;
  private realmId: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN || "";
    this.realmId = process.env.QUICKBOOKS_REALM_ID || "";
    this.baseUrl = process.env.QUICKBOOKS_SANDBOX === "true"
      ? "https://sandbox-quickbooks.api.intuit.com"
      : "https://quickbooks.api.intuit.com";
  }

  private async fetch(endpoint: string) {
    const url = `${this.baseUrl}/v3/company/${this.realmId}/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`QuickBooks API error: ${response.status} - ${error}`);
    }
    return response.json();
  }

  async query(sql: string) {
    const encoded = encodeURIComponent(sql);
    return this.fetch(`query?query=${encoded}`);
  }

  async getReport(reportName: string, params?: Record<string, string>) {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.fetch(`reports/${reportName}${queryString}`);
  }
}

// Date helpers
function formatQBDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function startOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return formatQBDate(date);
}

function today(): string {
  return formatQBDate(new Date());
}

// Main fetch function
export async function fetchQuickBooksMetrics(): Promise<QuickBooksMetrics> {
  const client = new QuickBooksClient();

  try {
    // Fetch all data in parallel
    const [
      accountsResult,
      apAgingResult,
      arAgingResult,
      pnlResult,
    ] = await Promise.all([
      // Bank accounts for cash balance
      client.query("SELECT * FROM Account WHERE AccountType = 'Bank'"),
      // AP Aging
      client.getReport("AgedPayableDetail"),
      // AR Aging
      client.getReport("AgedReceivableDetail"),
      // P&L MTD
      client.getReport("ProfitAndLoss", {
        start_date: startOfMonth(),
        end_date: today(),
      }),
    ]);

    // Define account type
    type BankAccount = { CurrentBalance?: number };

    // Calculate cash balance from bank accounts
    const bankAccounts: BankAccount[] = accountsResult.QueryResponse?.Account || [];
    const totalCash = bankAccounts.reduce(
      (sum: number, acc: BankAccount) => sum + (acc.CurrentBalance || 0),
      0
    );

    // Parse AP aging
    const apData = parseAgingReport(apAgingResult);

    // Parse AR aging
    const arData = parseAgingReport(arAgingResult);

    // Parse P&L
    const pnlData = parsePnLReport(pnlResult);

    // Calculate burn rate and runway
    const weeklyBurn = pnlData.expenses / 4; // Approximate weekly from MTD
    const runwayWeeks = weeklyBurn > 0 ? Math.floor(totalCash / weeklyBurn) : 52;

    return {
      cash: {
        balance: totalCash,
        availableBalance: totalCash, // Could subtract pending
        lastDeposit: 0, // Would need transaction query
        lastDepositDate: "",
      },
      ap: {
        total: apData.total,
        current: apData.current,
        overdue30: apData.overdue30,
        overdue60: apData.overdue60,
        overdue90Plus: apData.overdue90Plus,
        vendorCount: apData.vendorCount,
      },
      ar: {
        total: arData.total,
        current: arData.current,
        overdue: arData.overdue30 + arData.overdue60 + arData.overdue90Plus,
      },
      runway: {
        weeks: runwayWeeks,
        burnRate: weeklyBurn,
        monthlyBurn: pnlData.expenses,
      },
      pnl: {
        revenuesMTD: pnlData.revenue,
        expensesMTD: pnlData.expenses,
        netIncomeMTD: pnlData.netIncome,
      },
      lastUpdated: new Date().toISOString(),
      dataSource: "quickbooks",
    };
  } catch (error) {
    console.error("QuickBooks fetch error:", error);
    return {
      cash: { balance: 0, availableBalance: 0, lastDeposit: 0, lastDepositDate: "" },
      ap: { total: 0, current: 0, overdue30: 0, overdue60: 0, overdue90Plus: 0, vendorCount: 0 },
      ar: { total: 0, current: 0, overdue: 0 },
      runway: { weeks: 0, burnRate: 0, monthlyBurn: 0 },
      pnl: { revenuesMTD: 0, expensesMTD: 0, netIncomeMTD: 0 },
      lastUpdated: new Date().toISOString(),
      dataSource: "quickbooks",
    };
  }
}

// Aging report types
type AgingReportRow = {
  type?: string;
  ColData?: Array<{ value?: string }>;
};

type AgingReport = {
  Rows?: { Row?: AgingReportRow[] };
};

// Parse aging report into buckets
function parseAgingReport(report: AgingReport) {
  const result = {
    total: 0,
    current: 0,
    overdue30: 0,
    overdue60: 0,
    overdue90Plus: 0,
    vendorCount: 0,
  };

  try {
    const rows = report.Rows?.Row || [];
    const vendors = new Set<string>();

    for (const row of rows) {
      if (row.type === "Data" && row.ColData) {
        const cols = row.ColData;
        // Typical aging columns: Name, Current, 1-30, 31-60, 61-90, 91+, Total
        if (cols.length >= 6) {
          vendors.add(cols[0]?.value || "");
          result.current += parseFloat(cols[1]?.value || "0");
          result.overdue30 += parseFloat(cols[2]?.value || "0");
          result.overdue60 += parseFloat(cols[3]?.value || "0");
          result.overdue90Plus += parseFloat(cols[4]?.value || "0") + parseFloat(cols[5]?.value || "0");
          result.total += parseFloat(cols[cols.length - 1]?.value || "0");
        }
      }
    }
    result.vendorCount = vendors.size;
  } catch (e) {
    console.error("Error parsing aging report:", e);
  }

  return result;
}

// P&L report types
type PnLReportRow = {
  type?: string;
  group?: string;
  Summary?: { ColData?: Array<{ value?: string }> };
  Header?: { ColData?: Array<{ value?: string }> };
};

type PnLReport = {
  Rows?: { Row?: PnLReportRow[] };
};

// Parse P&L report
function parsePnLReport(report: PnLReport) {
  const result = { revenue: 0, expenses: 0, netIncome: 0 };

  try {
    const rows = report.Rows?.Row || [];
    for (const row of rows) {
      if (row.Summary?.ColData) {
        const value = parseFloat(row.Summary.ColData[1]?.value || "0");
        if (row.group === "Income") result.revenue = value;
        else if (row.group === "Expenses") result.expenses = value;
        else if (row.type === "Section" && row.Header?.ColData?.[0]?.value === "Net Income") {
          result.netIncome = value;
        }
      }
    }
    if (result.netIncome === 0) {
      result.netIncome = result.revenue - result.expenses;
    }
  } catch (e) {
    console.error("Error parsing P&L report:", e);
  }

  return result;
}

// Cached fetch with TTL
let cachedMetrics: QuickBooksMetrics | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getQuickBooksMetrics(): Promise<QuickBooksMetrics> {
  const now = Date.now();
  if (cachedMetrics && now - cacheTime < CACHE_TTL) {
    return cachedMetrics;
  }
  cachedMetrics = await fetchQuickBooksMetrics();
  cacheTime = now;
  return cachedMetrics;
}
