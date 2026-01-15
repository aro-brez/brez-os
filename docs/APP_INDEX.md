# BREZ Growth Generator - App Index & Technical Critique

> Generated: 2026-01-13
> Version: 1.0.0

---

## 1. Route Map

| Route | Purpose | Data Sources | Status |
|-------|---------|--------------|--------|
| `/` | **Growth Generator Dashboard** - 5-step sequence, scenario selector (STABILIZE/THRIVE/SCALE/CRITICAL), growth metrics | source-of-truth.ts, devStore | Production |
| `/growth` | **52-Week Simulator** - What-if analysis, quick sim presets, retail alpha modes, cash projections | simulate.ts, localStorage, CSV | Production |
| `/financials` | **Cash Dashboard** - Cash position, runway, AR/AP flow, snapshot history | devStore.financialSnapshots | Production |
| `/plan` | **Master Strategic Plan** - Growth phases, dependent projects, sacred paradox principles | Static content | Production |
| `/tasks` | **Team Task Board** - Tasks by department, priority/status, goal linking | devStore.tasks | Production |
| `/goals` | **OKR Tracking** - Goals, impact scoring, progress visualization | devStore.goals | Production |
| `/channels` | **Team Communication** - Thread-first messaging, AI summaries, decision tracking | devStore.channels, communication/* | Production |
| `/insights` | **Customer Analytics** - Demographics, age/gender, acquisition channels | devStore.customerDemographics | Production |
| `/customers` | **Customer Feedback Portal** - Reviews, sentiment analysis | devStore.customerFeedback | Production |
| `/journey` | **Customer Journey Mapping** - Cans-in-hand, sampling events, conversion funnel | Static + devStore | Production |
| `/files` | **Data Hub** - CSV upload, connector status, file management | localStorage, CSV parsing | Production |
| `/settings` | **Connector Dashboard** - Integration status (Shopify, QB, Meta, GA) | Static stubs | Stub |
| `/operator` | **Operating Manual** - Weekly workflow guide, AI usage, shortcuts | Static content | Production |
| `/auth/signin` | **Login** - Google OAuth + demo login | NextAuth | Production |
| `/auth/error` | **Auth Error** - Error display | NextAuth | Production |

### API Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/auth/[...nextauth]` | Authentication handler | Production |
| `/api/chat` | Claude AI chat endpoint | Production |
| `/api/metrics` | Unified metrics aggregation | Production |
| `/api/health` | Health check | Production |
| `/api/tasks` | Task CRUD | Production |

---

## 2. Data Sources by Page

### Primary Data Store: `devStore` (`src/lib/data/devStore.ts`)
In-memory database with localStorage persistence (`brez-ai-dev-db`).

| Page | Data Source | Type | Freshness |
|------|-------------|------|-----------|
| `/` | source-of-truth.ts | Static validated | Manual update |
| `/growth` | simulate.ts + localStorage | Computed | Real-time |
| `/financials` | devStore.financialSnapshots | Mock | Stale |
| `/tasks` | devStore.tasks | Mock | Session |
| `/goals` | devStore.goals | Mock | Session |
| `/channels` | devStore.channels + messages | Mock | Session |
| `/insights` | devStore.customerDemographics | Mock | Static seed |
| `/files` | CSV uploads → localStorage | User input | Session |
| `/settings` | Static connector status | Hardcoded | Never |

### Source of Truth (`src/lib/data/source-of-truth.ts`)
Validated master metrics - **THE ACTUAL NUMBERS**:

```typescript
// Alpha (validated on 2025 weekly data)
alpha: 0.137  // retail revenue per $1 paid spend
sellInScaledAlpha: 0.306  // aggressive/sensitivity bound

// Unit Economics
COGS: $4.76/4-pack ($1.19/can)
grossMargin: 81%
dtcContributionMargin: 43%
retailContributionMargin: 30%

// LTV Multiples
3mo: 2.5x, 6mo: 3.5x, 9mo: 4.6x, 12mo: 5.2x

// Cash Position (as of last update)
cashOnHand: $380,000
minimumReserve: $300,000
totalAP: $8,600,000

// Loan Option
maxFacility: $3,200,000
factorRate: 1.31
monthlyPayment: $349,333
```

---

## 3. Simulation Engine Summary

### Location: `src/lib/simulate.ts`

### Inputs
```typescript
interface Inputs {
  time: { startDate, weeks (52), dsoWeeks (8) }
  cash: { cashOnHand, reserveFloor ($300K) }
  fixedStack: { payroll, expenses, debtPayments, apMinimum }
  loan: { enabled, maxFacility, drawWeek, drawAmount, monthlyPayment }
  dtc: {
    spendPlan: number[],  // weekly ad spend
    cacModel: { mode, baseCac, scaleFactor },
    firstOrder: { aov, contributionMargin, repeatRate },
    nonSubReturning: { repeatRate, margin }
  }
  subs: { subShare, starting, survival, weeklyRepeat }
  retail: { alpha, lagWeeks, margin, alphaSellInScaled }
  ops: { COGS, productionSchedule, paymentPolicy }
}
```

### Outputs (52 arrays)
```typescript
interface SimulationResult {
  cashBalance: number[]      // Weekly cash position
  cashTrough: number         // Minimum cash reached
  troughWeek: number         // When trough occurs
  breachesFloor: boolean     // GO/NO-GO flag

  dtcSpend: number[]
  impliedCAC: number[]
  newCustomers: number[]
  dtcRevenueTotal: number[]
  activeSubs: number[]

  retailVelocity: number[]   // Sell-in
  retailCashIn: number[]     // DSO-lagged cash

  loanBalance: number[]
  totalCashIn: number[]
  totalCashOut: number[]
}
```

### Key Rules

| Rule | Logic |
|------|-------|
| **Cash Floor** | $300K minimum. If breached → CRITICAL scenario |
| **Retail DSO** | 8-week lag from sell-in to cash-in (55 days actual) |
| **Retail Alpha** | 0.137 × spend(t - lagWeeks) = retail revenue |
| **Production Pay** | 50% pre-production, 20% pack-in, 30% net-30 |
| **CAC Curve** | Base $55, scales up with spend (diminishing returns) |
| **Sub Survival** | 95.8% weekly retention (4.2% monthly churn) |
| **Loan Draw** | Optional timing bridge, factor rate 1.31 |

---

## 4. Persistence Mechanisms

### What is Persisted and Where

| Data | Storage | Key | Sync |
|------|---------|-----|------|
| Simulation inputs (actuals + scenarios) | localStorage | `brez-growth-generator-state` | On change |
| CSV data (spend, velocity, production) | localStorage | `brez-growth-generator-state.csvData` | On upload |
| Retail alpha mode | localStorage | `brez-growth-generator-state.retailAlphaMode` | On change |
| DevStore (users, tasks, goals, channels) | localStorage | `brez-ai-dev-db` | On mutation |
| Auth session | NextAuth cookie | `next-auth.session-token` | On login |
| Selected user | localStorage | `brez-selected-user` | On selection |

### NOT Persisted (Lost on Refresh)
- Simulation results (recomputed)
- AI conversation history
- Unsaved form states
- Real-time metrics (no live connectors)

---

## 5. Connector Status

### Current State: ALL STUBS

| Connector | Status | Priority | Blocks |
|-----------|--------|----------|--------|
| **Shopify** | Stub (errors on call) | CRITICAL | Real revenue, subs, CAC |
| **QuickBooks** | Stub file only | CRITICAL | Real cash, AP/AR |
| **Meta Ads** | Stub | HIGH | Real spend, CAC, ROAS |
| **Google Analytics** | Not started | HIGH | Real traffic, conversion |
| **Retail Data** | CSV only | HIGH | Real velocity by market |
| **Customer Reviews** | Manual entry | MEDIUM | Sentiment analysis |
| **Triple Whale** | Not planned | LOW | Attribution |
| **Recharge** | Not planned | MEDIUM | Sub details |

### Integration Architecture (`src/lib/integrations/`)
- `unified.ts` - Aggregates all sources, provides fallback mock data
- `optimizer.ts` - Auto-optimizer logic (stub)
- Connectors return mock data until implemented

---

## 6. FTUE Flow (First-Time User Experience)

### Path: `src/components/guided/OnboardingWizard.tsx`

```
[User lands on app]
        ↓
[AuthGate checks session]
        ↓ (no session)
[LoginScreen - email input]
        ↓ (signs in)
[AuthGate checks user selection]
        ↓ (no selection)
[User Picker - select from org chart]
        ↓ (selected)
[OnboardingWizard - 5 steps]
        ↓
    Step 1: Welcome (features overview)
    Step 2: Simulation (actuals vs scenarios)
    Step 3: AI Insights (severity levels)
    Step 4: AI Strategist (chat prompts)
    Step 5: Team Collaboration (tasks)
        ↓
[Celebration animation]
        ↓
[Main Dashboard - Growth Generator]
```

### Gaps in FTUE
1. No role-specific guidance (exec vs analyst vs ops)
2. No data connection wizard (CSV upload not prompted)
3. No weekly planning walkthrough
4. No "what to do first" actionable prompt
5. Onboarding doesn't persist completion status

---

## 7. Gaps vs Target System

### Target: Operational OS with Low Manual Work

| Capability | Current | Target | Gap |
|------------|---------|--------|-----|
| **Data freshness** | Manual CSV + stale mocks | Real-time API sync | No connectors |
| **Weekly planning** | None | Guided wizard with approvals | Not built |
| **Scenario approvals** | None | Admin review + lock | Not built |
| **CSV normalization** | Basic parsing | Smart column mapping | Partial |
| **Lane 2 selection** | Manual | Data-driven market selector | Not built |
| **Cash physics** | In simulate.ts | Visible "truth" section | Hidden |
| **Suggested actions** | Generic | Role + phase specific | Basic |
| **Decision tracking** | In channels | Structured decision log | Partial |
| **AP management** | Static display | Vendor payment tracker | Not built |
| **Team rituals** | Documentation only | In-app ELT/LT flows | Not built |

### Critical Missing Pieces (for Operational OS)

1. **Weekly Plan Wizard** - No structured "what's the plan this week" flow
2. **Real Data** - All connectors are stubs, operating on mocks
3. **Approval Workflow** - No way to propose → review → approve plans
4. **CSV Inbox** - CSV upload exists but no normalization/validation
5. **Lane 2 Selector** - No data-driven market targeting tool
6. **Cash Physics Display** - The rules exist but aren't visible to users
7. **Role-Based UX** - Everyone sees same thing regardless of role
8. **Decision Velocity** - No tracking of time-to-decision
9. **Outcome Tracking** - Decisions aren't linked to measured results

---

## 8. Technical Debt & Issues

### Code Quality
- Many unused variables/imports (ESLint warnings)
- Mock data mixed with production logic
- Some pages include Sidebar, others don't (now fixed in AppShell)
- Type inconsistencies between files

### Architecture
- devStore is in-memory (not scalable)
- No real database writes (Supabase configured but unused)
- Auth is email-only (Google OAuth not configured)
- No API rate limiting or error boundaries

### UX
- No loading states on data fetches
- No error recovery flows
- No offline support
- Mobile experience is basic

---

## 9. File Structure Summary

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── channels/          # Communication
│   ├── growth/            # Simulator
│   └── [other pages]/
├── components/
│   ├── auth/              # AuthGate, LoginScreen
│   ├── guided/            # Onboarding, Quest
│   ├── layout/            # AppShell, Sidebar
│   └── ui/                # Design system
├── lib/
│   ├── ai/                # Brain, prioritizer
│   ├── communication/     # Thread system, learning
│   ├── core/              # Learning engine, memory
│   ├── data/              # devStore, source-of-truth
│   ├── integrations/      # Unified, optimizer
│   └── simulate.ts        # THE SIMULATION ENGINE
└── connectors/            # Shopify, QB stubs
```

---

## 10. Summary Assessment

### What Works Well
- Simulation engine is sophisticated and correct
- Growth Generator 5-step framework is clear
- UI is polished with good brand consistency
- Thread-first communication is innovative
- Source of truth has validated numbers

### What Needs Work
1. **No real data** - Everything is mocks/stubs
2. **No weekly workflow** - Missing the operational rhythm
3. **No approvals** - Can't propose and approve plans
4. **Generic UX** - Same for all roles
5. **Hidden physics** - Business rules aren't visible

### Verdict
**The app is a beautiful prototype that needs to become operational.**

The simulation engine and UI are production-quality, but the app runs on mock data with no real integrations, no weekly planning workflow, and no approval process. It's a demo, not an operating system.

**V1.1 should focus on making it operational, not adding features.**
