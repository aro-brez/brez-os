import { Inputs, SimulationOutputs, CSVData } from "./types";

/**
 * Pure simulation engine for BREZ Growth Generator
 * Takes inputs and CSV data, returns weekly projections for 52 weeks
 */
export function simulate(
  inputs: Inputs,
  csvData: CSVData = {},
  retailAlphaMode: "sellThroughProxy" | "sellInScaled" = "sellThroughProxy"
): SimulationOutputs {
  const weeks = inputs.time.weeks;
  const startDate = new Date(inputs.time.startDate);

  // Initialize output arrays
  const output: SimulationOutputs = {
    weeks: [],
    weekDates: [],
    cashBalance: [],
    dtcSpend: [],
    impliedCAC: [],
    newCustomers: [],
    dtcRevenueTotal: [],
    dtcContribution: [],
    retailVelocity: [],
    retailCashIn: [],
    activeSubs: [],
    subscriptionRevenue: [],
    nonSubReturningRevenue: [],
    productionCashOut: [],
    fixedCashOut: [],
    loanBalance: [],
    loanCashOut: [],
    totalCashIn: [],
    totalCashOut: [],
    minCash: Infinity,
    troughWeek: 0,
    goNoGo: true,
  };

  // Build week-indexed CSV lookup maps
  const spendByWeek = buildWeekMap(csvData.weeklySpend, "spend_total");
  const retailByWeek = buildWeekMap(csvData.weeklyRetailVelocity, "retail_revenue");
  const productionByWeek = buildWeekMap(csvData.weeklyProductionCash, "production_cash_due");
  // Cash snapshot data reserved for V2 use
  // const cashSnapshotByWeek = csvData.weeklyCashSnapshot
  //   ? new Map(csvData.weeklyCashSnapshot.map((r) => [r.week_start, r]))
  //   : new Map();

  // Select alpha based on mode
  const alpha =
    retailAlphaMode === "sellInScaled"
      ? inputs.retail.alphaSellInScaled
      : inputs.retail.alpha;

  // Initialize state variables
  let cashBalance = inputs.cash.cashOnHand;
  let activeSubs = inputs.subs.startingActiveSubs;
  let nonSubReturningRevenue = inputs.dtc.nonSubReturningBase.enabled
    ? inputs.dtc.nonSubReturningBase.weeklyBaseRevenue
    : 0;
  let loanBalance = 0;

  // Weekly loan payment calculation
  const weeklyLoanPayment = inputs.loan.monthlyPayment / (52 / 12);

  // Retail velocity buffer for DSO lag
  const retailVelocityBuffer: number[] = [];

  // Main simulation loop
  for (let t = 0; t < weeks; t++) {
    output.weeks.push(t);

    // Calculate week date
    const weekDate = new Date(startDate);
    weekDate.setDate(weekDate.getDate() + t * 7);
    const weekDateStr = weekDate.toISOString().split("T")[0];
    output.weekDates.push(weekDateStr);

    // 1) Get spend for this week
    const dtcSpend =
      spendByWeek.get(weekDateStr) ?? inputs.dtc.spendPlan.weeklySpend;
    output.dtcSpend.push(dtcSpend);

    // 2) Calculate CAC
    let cac: number;
    if (inputs.dtc.cacModel.mode === "constant") {
      cac = inputs.dtc.cacModel.cac;
    } else {
      // Curve mode: CAC = baseCAC + slope * (weeklySpend - baseSpend)
      const { baseSpend, baseCAC, slope } = inputs.dtc.cacModel.curve;
      cac = baseCAC + slope * (dtcSpend - baseSpend);
    }
    output.impliedCAC.push(cac);

    // 3) New customers
    const newCustomers = cac > 0 ? dtcSpend / cac : 0;
    output.newCustomers.push(newCustomers);

    // 4) New revenue from first orders
    const newRevenue = newCustomers * inputs.dtc.firstOrder.firstOrderAOV;

    // 5) Subscription adds
    const subscriptionAdds = newCustomers * inputs.subs.subShareOfNewCustomers;

    // 6) Subscription revenue from existing subs
    const subRevenue = activeSubs * inputs.subs.weeklyRepeatPerActive_pw;
    output.subscriptionRevenue.push(subRevenue);

    // 7) Update active subs (survival + new adds)
    activeSubs =
      activeSubs * inputs.subs.weeklySurvival_sw + subscriptionAdds;
    output.activeSubs.push(activeSubs);

    // 8) Non-subscription returning revenue (decays weekly)
    output.nonSubReturningRevenue.push(nonSubReturningRevenue);
    if (inputs.dtc.nonSubReturningBase.enabled) {
      nonSubReturningRevenue *= inputs.dtc.nonSubReturningBase.weeklyDecay;
    }

    // 9) Total DTC revenue
    const dtcRevenueTotal = newRevenue + subRevenue + output.nonSubReturningRevenue[t];
    output.dtcRevenueTotal.push(dtcRevenueTotal);

    // 10) DTC contribution
    const dtcContribution =
      dtcRevenueTotal * inputs.dtc.firstOrder.dtcContributionMargin;
    output.dtcContribution.push(dtcContribution);

    // 11) Retail velocity = alpha * spend shifted by lagWeeks
    const laggedSpendIndex = t - inputs.retail.lagWeeks;
    const laggedSpend =
      laggedSpendIndex >= 0 ? output.dtcSpend[laggedSpendIndex] : dtcSpend;
    const retailVelocity =
      retailByWeek.get(weekDateStr) ?? alpha * laggedSpend;
    output.retailVelocity.push(retailVelocity);
    retailVelocityBuffer.push(retailVelocity);

    // 12) Retail cash-in (DSO shifted)
    const dsoIndex = t - inputs.time.weeklyRetailDSOWeeks;
    const retailCashIn =
      dsoIndex >= 0 ? retailVelocityBuffer[dsoIndex] : 0;
    output.retailCashIn.push(retailCashIn);

    // 13) Loan draw (if applicable)
    let loanDraw = 0;
    let loanPayment = 0;
    if (inputs.loan.enabled) {
      if (t === inputs.loan.drawWeek) {
        loanDraw = inputs.loan.drawAmount;
        loanBalance = inputs.loan.drawAmount;
      }
      // Weekly payment starts same week as draw (or next week based on config)
      const paymentStartWeek = inputs.loan.assumePaymentStartsSameWeekAsDraw
        ? inputs.loan.drawWeek
        : inputs.loan.drawWeek + 1;
      if (t >= paymentStartWeek && loanBalance > 0) {
        loanPayment = Math.min(weeklyLoanPayment, loanBalance);
        loanBalance = Math.max(0, loanBalance - loanPayment);
      }
    }
    output.loanBalance.push(loanBalance);
    output.loanCashOut.push(loanPayment);

    // 14) Fixed outflows calculation
    const fixedBase =
      inputs.fixedStack.weeklyFixedBase.payroll +
      inputs.fixedStack.weeklyFixedBase.budgetedExpenses +
      inputs.fixedStack.weeklyFixedBase.petrichorPlan +
      inputs.fixedStack.weeklyFixedBase.canasoolPlan;

    // Calculate weekly debt payments (check end dates)
    let debtPayments = 0;
    for (const debt of inputs.fixedStack.weeklyDebt) {
      const endDate = new Date(debt.endDate);
      if (weekDate <= endDate) {
        debtPayments += debt.weeklyPayment;
      }
    }

    const fixedCashOut =
      fixedBase + debtPayments + inputs.fixedStack.weeklyAPMinimum;
    output.fixedCashOut.push(fixedCashOut);

    // 15) Production cash out
    const productionCashOut =
      productionByWeek.get(weekDateStr) ??
      (inputs.ops.productionCashScheduleByWeek[t] ?? 0);
    output.productionCashOut.push(productionCashOut);

    // 16) Total cash in/out
    const totalCashIn = dtcRevenueTotal + retailCashIn + loanDraw;
    const totalCashOut =
      dtcSpend + fixedCashOut + productionCashOut + loanPayment;
    output.totalCashIn.push(totalCashIn);
    output.totalCashOut.push(totalCashOut);

    // 17) Update cash balance
    cashBalance = cashBalance + totalCashIn - totalCashOut;
    output.cashBalance.push(cashBalance);

    // Track min cash and trough week
    if (cashBalance < output.minCash) {
      output.minCash = cashBalance;
      output.troughWeek = t;
    }
  }

  // Determine go/no-go
  output.goNoGo = output.minCash >= inputs.cash.reserveFloor;

  return output;
}

/**
 * Helper to calculate required alpha to achieve target CAC
 */
export function requiredAlphaForCAC(
  inputs: Inputs,
  targetCAC: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _horizonWeeks: number
): number {
  // Guard against division by zero
  if (targetCAC <= 0) {
    return inputs.retail.alpha; // Return current alpha if invalid target
  }

  // This is a simplified calculation
  // In reality, would need to solve the system of equations
  // _horizonWeeks reserved for V2 time-weighted calculations
  const currentAlpha = inputs.retail.alpha;
  const currentCAC = inputs.dtc.cacModel.cac;

  // Linear approximation: alpha scales inversely with CAC improvement needed
  return currentAlpha * (currentCAC / targetCAC);
}

/**
 * Helper to estimate required loan draw to stay above reserve
 */
export function requiredLoanDrawToStayAboveReserve(
  inputs: Inputs,
  csvData: CSVData = {},
  retailAlphaMode: "sellThroughProxy" | "sellInScaled" = "sellThroughProxy"
): number {
  // Run simulation without loan
  const inputsNoLoan = {
    ...inputs,
    loan: { ...inputs.loan, enabled: false },
  };
  const simNoLoan = simulate(inputsNoLoan, csvData, retailAlphaMode);

  // Calculate shortfall
  const shortfall = inputs.cash.reserveFloor - simNoLoan.minCash;

  if (shortfall <= 0) {
    return 0; // No loan needed
  }

  // Add buffer for loan payments
  const weeklyLoanPayment = inputs.loan.monthlyPayment / (52 / 12);
  const weeksOfPayments = inputs.time.weeks - simNoLoan.troughWeek;
  const paymentBuffer = weeklyLoanPayment * weeksOfPayments;

  return Math.min(shortfall + paymentBuffer, inputs.loan.maxFacility);
}

/**
 * Build a week-indexed lookup map from CSV data
 */
function buildWeekMap<T extends { week_start: string }>(
  data: T[] | undefined,
  valueKey: keyof T
): Map<string, number> {
  const map = new Map<string, number>();
  if (data) {
    for (const row of data) {
      map.set(row.week_start, row[valueKey] as number);
    }
  }
  return map;
}

/**
 * Generate weekly date strings from start date
 */
export function generateWeekDates(startDate: string, weeks: number): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < weeks; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
