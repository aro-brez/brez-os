import { z } from "zod";

// Zod schemas for validation
export const MetaSchema = z.object({
  org: z.string(),
  unit: z.string(),
  notes: z.string().optional(),
});

export const TimeSchema = z.object({
  startDate: z.string(),
  weeks: z.number().min(1).max(104),
  weeklyRetailDSOWeeks: z.number().min(0).max(26),
});

export const CashSchema = z.object({
  cashOnHand: z.number(),
  reserveFloor: z.number(),
});

export const WeeklyDebtSchema = z.object({
  name: z.string(),
  weeklyPayment: z.number(),
  endDate: z.string(),
});

export const WeeklyFixedBaseSchema = z.object({
  payroll: z.number(),
  budgetedExpenses: z.number(),
  petrichorPlan: z.number(),
  canasoolPlan: z.number(),
});

export const FixedStackSchema = z.object({
  weeklyFixedBase: WeeklyFixedBaseSchema,
  weeklyDebt: z.array(WeeklyDebtSchema),
  weeklyAPMinimum: z.number(),
  notes: z.string().optional(),
});

export const PrepayFactorsSchema = z.object({
  "30d": z.number(),
  "60d": z.number(),
  "90d": z.number(),
});

export const LoanSchema = z.object({
  enabled: z.boolean(),
  maxFacility: z.number(),
  drawWeek: z.number(),
  drawAmount: z.number(),
  factorRateFullTerm: z.number(),
  monthlyPayment: z.number(),
  prepayFactors: PrepayFactorsSchema,
  assumePaymentStartsSameWeekAsDraw: z.boolean(),
  notes: z.string().optional(),
});

export const LaneSplitSchema = z.object({
  national: z.number(),
  retailIgnition: z.number(),
});

export const SpendPlanSchema = z.object({
  mode: z.enum(["constant", "ramp"]),
  weeklySpend: z.number(),
  laneSplit: LaneSplitSchema,
  retailIgnitionMarkets: z.array(z.string()),
  notes: z.string().optional(),
});

export const CACCurveSchema = z.object({
  baseSpend: z.number(),
  baseCAC: z.number(),
  slope: z.number(),
});

export const CACModelSchema = z.object({
  mode: z.enum(["constant", "curve"]),
  cac: z.number(),
  curve: CACCurveSchema,
  notes: z.string().optional(),
});

export const FirstOrderSchema = z.object({
  firstOrderAOV: z.number(),
  dtcContributionMargin: z.number(),
});

export const NonSubReturningBaseSchema = z.object({
  enabled: z.boolean(),
  weeklyBaseRevenue: z.number(),
  weeklyDecay: z.number(),
  notes: z.string().optional(),
});

export const DTCSchema = z.object({
  spendPlan: SpendPlanSchema,
  cacModel: CACModelSchema,
  firstOrder: FirstOrderSchema,
  nonSubReturningBase: NonSubReturningBaseSchema,
});

export const SubsSchema = z.object({
  subShareOfNewCustomers: z.number(),
  startingActiveSubs: z.number(),
  weeklySurvival_sw: z.number(),
  weeklyRepeatPerActive_pw: z.number(),
  notes: z.string().optional(),
});

export const RetailSchema = z.object({
  alpha: z.number(),
  lagWeeks: z.number(),
  retailContributionMargin: z.number(),
  mode: z.enum(["sellThroughProxy", "sellInScaled"]),
  alphaSellInScaled: z.number(),
  notes: z.string().optional(),
});

export const ProductionPaymentPolicySchema = z.object({
  preProduction: z.number(),
  packIn: z.number(),
  net30: z.number(),
});

export const OpsSchema = z.object({
  cogsPer4PackCash: z.number(),
  productionCashScheduleByWeek: z.array(z.number()),
  productionPaymentPolicy: ProductionPaymentPolicySchema,
  notes: z.string().optional(),
});

export const CSVSchemasSchema = z.object({
  weeklySpendCsv: z.array(z.string()),
  weeklyRetailVelocityCsv: z.array(z.string()),
  weeklyProductionCashCsv: z.array(z.string()),
  weeklyCashSnapshotCsv: z.array(z.string()),
});

export const InputsSchema = z.object({
  meta: MetaSchema,
  time: TimeSchema,
  cash: CashSchema,
  fixedStack: FixedStackSchema,
  loan: LoanSchema,
  dtc: DTCSchema,
  subs: SubsSchema,
  retail: RetailSchema,
  ops: OpsSchema,
  csvSchemas: CSVSchemasSchema,
});

// Infer types from schemas
export type Meta = z.infer<typeof MetaSchema>;
export type Time = z.infer<typeof TimeSchema>;
export type Cash = z.infer<typeof CashSchema>;
export type WeeklyDebt = z.infer<typeof WeeklyDebtSchema>;
export type WeeklyFixedBase = z.infer<typeof WeeklyFixedBaseSchema>;
export type FixedStack = z.infer<typeof FixedStackSchema>;
export type Loan = z.infer<typeof LoanSchema>;
export type SpendPlan = z.infer<typeof SpendPlanSchema>;
export type CACModel = z.infer<typeof CACModelSchema>;
export type FirstOrder = z.infer<typeof FirstOrderSchema>;
export type NonSubReturningBase = z.infer<typeof NonSubReturningBaseSchema>;
export type DTC = z.infer<typeof DTCSchema>;
export type Subs = z.infer<typeof SubsSchema>;
export type Retail = z.infer<typeof RetailSchema>;
export type Ops = z.infer<typeof OpsSchema>;
export type Inputs = z.infer<typeof InputsSchema>;

// CSV row types
export interface WeeklySpendRow {
  week_start: string;
  spend_total: number;
}

export interface WeeklyRetailVelocityRow {
  week_start: string;
  retail_revenue: number;
  units: number;
  doors: number;
}

export interface WeeklyProductionCashRow {
  week_start: string;
  production_cash_due: number;
}

export interface WeeklyCashSnapshotRow {
  week_start: string;
  cash_on_hand: number;
  ap_due_next_2w: number;
  ar_expected_next_2w: number;
}

export interface WeeklyWholesaleOrdersRow {
  week_start: string;
  wholesale_orders: number;
  wholesale_revenue: number;
}

export interface SKUCatalogRow {
  item_name: string;
  unit_weight: string;
  flavor: string;
  blend: string;
  doses: string;
  units_per_case: number;
  unit_upc: string;
  case_upc: string;
  sku: string;
}

// CSV data store
export interface CSVData {
  weeklySpend?: WeeklySpendRow[];
  weeklyRetailVelocity?: WeeklyRetailVelocityRow[];
  weeklyProductionCash?: WeeklyProductionCashRow[];
  weeklyCashSnapshot?: WeeklyCashSnapshotRow[];
  weeklyWholesaleOrders?: WeeklyWholesaleOrdersRow[];
  skuCatalog?: SKUCatalogRow[];
}

// Simulation output types
export interface SimulationOutputs {
  weeks: number[];
  weekDates: string[];
  cashBalance: number[];
  dtcSpend: number[];
  impliedCAC: number[];
  newCustomers: number[];
  dtcRevenueTotal: number[];
  dtcContribution: number[];
  retailVelocity: number[];
  retailCashIn: number[];
  activeSubs: number[];
  subscriptionRevenue: number[];
  nonSubReturningRevenue: number[];
  productionCashOut: number[];
  fixedCashOut: number[];
  loanBalance: number[];
  loanCashOut: number[];
  totalCashIn: number[];
  totalCashOut: number[];
  // KPIs
  minCash: number;
  troughWeek: number;
  goNoGo: boolean;
}

// State for the app
export interface AppState {
  actualsInputs: Inputs;
  scenarioInputs: Inputs;
  csvData: CSVData;
  retailAlphaMode: "sellThroughProxy" | "sellInScaled";
}
