/**
 * QuickBooks Online Connector Stub (V2)
 *
 * TODO: Implement OAuth 2.0 flow and API integration
 *
 * This connector will:
 * - Sync cash on hand from bank accounts
 * - Track accounts payable (AP)
 * - Track accounts receivable (AR)
 * - Get payroll and fixed expense data
 * - Provide real-time cash position instead of manual input
 */

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  realmId: string;
}

export interface CashPosition {
  date: string;
  cashOnHand: number;
  accountsPayable: number;
  accountsReceivable: number;
  bankAccounts: {
    name: string;
    balance: number;
  }[];
}

export interface PayrollData {
  periodStart: string;
  periodEnd: string;
  grossPayroll: number;
  taxes: number;
  benefits: number;
  netPayroll: number;
}

export interface ExpenseData {
  category: string;
  weeklyAmount: number;
  vendor?: string;
}

/**
 * Initialize QuickBooks connection
 * TODO: Implement OAuth 2.0 flow
 */
export async function initQuickBooks(
  config: QuickBooksConfig
): Promise<boolean> {
  console.log("QuickBooks connector not implemented yet", config);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}

/**
 * Fetch current cash position
 * TODO: Query bank accounts and calculate totals
 */
export async function fetchCashPosition(
  config: QuickBooksConfig
): Promise<CashPosition> {
  console.log("Fetching cash position", config);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}

/**
 * Fetch accounts payable details
 * TODO: Get vendor bills and payment schedules
 */
export async function fetchAccountsPayable(
  config: QuickBooksConfig,
  daysAhead: number
): Promise<{
  total: number;
  dueNext2Weeks: number;
  byVendor: { vendor: string; amount: number; dueDate: string }[];
}> {
  console.log("Fetching AP", config, daysAhead);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}

/**
 * Fetch accounts receivable details
 * TODO: Get customer invoices and expected payments
 */
export async function fetchAccountsReceivable(
  config: QuickBooksConfig,
  daysAhead: number
): Promise<{
  total: number;
  expectedNext2Weeks: number;
  byCustomer: { customer: string; amount: number; expectedDate: string }[];
}> {
  console.log("Fetching AR", config, daysAhead);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}

/**
 * Fetch payroll data
 * TODO: Integrate with QuickBooks Payroll
 */
export async function fetchPayrollData(
  config: QuickBooksConfig,
  startDate: string,
  endDate: string
): Promise<PayrollData[]> {
  console.log("Fetching payroll", config, startDate, endDate);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}

/**
 * Fetch recurring expenses
 * TODO: Get recurring transactions and categorize
 */
export async function fetchRecurringExpenses(
  config: QuickBooksConfig
): Promise<ExpenseData[]> {
  console.log("Fetching expenses", config);
  throw new Error("QuickBooks connector not implemented - V2 feature");
}
