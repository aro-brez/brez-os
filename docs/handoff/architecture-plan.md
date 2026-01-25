# BRĒZ-OS MVP Architecture Plan

## Overview

This document outlines the technical architecture for BRĒZ-OS MVP. The goal is a clean, intuitive dashboard that tells executives exactly what they need to know to make growth decisions.

---

## Tech Stack (Recommended)

```
Frontend:     Next.js 14+ (App Router)
Styling:      Tailwind CSS
Charts:       Recharts or Chart.js
Auth:         NextAuth.js with Google Provider
Database:     Supabase or PlanetScale
Deployment:   Vercel
Integrations: Shopify API, QuickBooks API, Google Drive API
```

---

## Directory Structure

```
brez-os-mvp/
├── CLAUDE.md                 # Claude Code context (this package)
├── README.md                 # Project overview
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local               # API keys (gitignored)
│
├── app/
│   ├── layout.tsx           # Root layout with auth
│   ├── page.tsx             # Landing/login page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard layout with nav
│   │   ├── command/
│   │   │   └── page.tsx     # Momentum Command Center
│   │   ├── scenarios/
│   │   │   └── page.tsx     # Scenario Calculator
│   │   ├── team/
│   │   │   └── page.tsx     # Team Nodes / SEED Network
│   │   └── insights/
│   │       └── page.tsx     # Customer Insights (from original)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── shopify/route.ts
│       ├── quickbooks/route.ts
│       └── metrics/route.ts
│
├── components/
│   ├── ui/                  # Base UI components
│   ├── charts/
│   │   ├── MomentumChart.tsx
│   │   ├── TrajectoryChart.tsx
│   │   └── ScenarioCompare.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── TimeSelector.tsx
│   │   └── StatusIndicator.tsx
│   └── team/
│       ├── TeamNode.tsx
│       ├── NodeGrid.tsx
│       └── ClaudeChat.tsx
│
├── lib/
│   ├── shopify.ts           # Shopify API client
│   ├── quickbooks.ts        # QuickBooks API client
│   ├── google.ts            # Google Drive API client
│   ├── metrics.ts           # Metric calculations
│   ├── seed.ts              # SEED protocol helpers
│   └── utils.ts
│
├── hooks/
│   ├── useMetrics.ts
│   ├── useScenario.ts
│   └── useTeamNodes.ts
│
├── types/
│   └── index.ts             # TypeScript types
│
└── docs/                    # Documentation
    ├── conversation-log.md
    ├── seed-protocol.md
    └── architecture-plan.md
```

---

## Page Specifications

### Page 1: Momentum Command Center (`/command`)

**Purpose**: Show company health at a glance

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  BRĒZ-OS    [Command] [Scenarios] [Team]    [Aaron ▾]  [⚙️]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MOMENTUM TRAJECTORY                          [7d][30d][90d][Y] │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │     📈 Big chart showing growth trend                     │ │
│  │        - Line goes UP or DOWN (instantly clear)           │ │
│  │        - "YOU ARE HERE" marker                            │ │
│  │        - Projected path (dashed line)                     │ │
│  │        - DTC vs Retail overlay toggle                     │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ CAC         │ │ MONTHLY     │ │ GROWTH      │ │ RUNWAY    │ │
│  │ $55         │ │ SPEND       │ │ TREND       │ │           │ │
│  │ Target: $45 │ │ $180K       │ │ -12%  ⚠️    │ │ 6 months  │ │
│  │ ↓ needed    │ │ Optimal: ?  │ │ reversal    │ │ with AP   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  RECENT CHANGES                          NEXT ACTIONS          │
│  • Jan 10: CAC improved 3%               • Reduce CAC to $50   │
│  • Jan 8: Retail velocity +5%            • Increase spend $20K │
│  • Jan 5: New AP plan approved           • Focus on LTV        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data Sources**:
- Shopify: Revenue, orders, CAC, LTV
- QuickBooks: Cash flow, expenses
- Retail: Velocity data (manual upload initially)

---

### Page 2: Scenario Calculator (`/scenarios`)

**Purpose**: Compare current state vs potential scenarios

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  SCENARIO CALCULATOR                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │
│  │  CURRENT STATE          │   │  SCENARIO                   │ │
│  │  ─────────────          │   │  ────────                   │ │
│  │                         │   │                             │ │
│  │  CAC                    │   │  CAC                        │ │
│  │  [$55━━━━━━━━━━━○]      │   │  [$45━━━━━━━○━━━━━]         │ │
│  │                         │   │                             │ │
│  │  Monthly Spend          │   │  Monthly Spend              │ │
│  │  [$180K━━━━━━━━○━]      │   │  [$200K━━━━━━━━━━○]         │ │
│  │                         │   │                             │ │
│  │  Retail Velocity        │   │  Retail Velocity            │ │
│  │  [━━━━━━━○━━━━━━━]      │   │  [━━━━━━━━━━○━━━━]          │ │
│  │                         │   │                             │ │
│  │  ─────────────────────  │   │  ─────────────────────────  │ │
│  │  Growth: -12%  🔴       │   │  Growth: +8%   🟢           │ │
│  │  Profit: $XXK           │   │  Profit: $XXK               │ │
│  │  Runway: 6 mo           │   │  Runway: 8 mo               │ │
│  │  Break-even: Never      │   │  Break-even: Q3 2026        │ │
│  │                         │   │                             │ │
│  └─────────────────────────┘   └─────────────────────────────┘ │
│                                                                 │
│            [ ← FLIP TO COMPARE → ]                              │
│                                                                 │
│  💡 INSIGHT: Reducing CAC by $10 while increasing spend $20K   │
│     yields +20% better growth trajectory with minimal risk      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Calculations**:
```typescript
interface ScenarioInput {
  cac: number;
  monthlySpend: number;
  retailVelocity: number;
  ltv: number;
  conversionRate: number;
}

interface ScenarioOutput {
  growthRate: number;      // % change month over month
  monthlyProfit: number;
  runway: number;          // months until cash depleted
  breakEvenDate: Date | null;
  newCustomers: number;
}

function calculateScenario(input: ScenarioInput): ScenarioOutput {
  const newCustomers = input.monthlySpend / input.cac;
  const revenue = newCustomers * input.ltv;
  const profit = revenue - input.monthlySpend;
  // ... more calculations
}
```

---

### Page 3: Team Nodes (`/team`)

**Purpose**: SEED network visualization and team AI mirrors

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  SEED NETWORK                               [+ Invite Node]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────┐                                  │
│                    │  SEED   │  ← Central Intelligence          │
│                    │   🌱    │                                  │
│                    └────┬────┘                                  │
│           ┌─────────────┼─────────────┐                        │
│           │             │             │                        │
│      ┌────┴────┐   ┌────┴────┐   ┌────┴────┐                  │
│      │ Aaron●  │   │ Brian○  │   │ Nick○   │                  │
│      │   AB    │   │    B    │   │    N    │                  │
│      └─────────┘   └─────────┘   └─────────┘                  │
│           │             │             │                        │
│      ┌────┴────┐   ┌────┴────┐   ┌────┴────┐                  │
│      │Travis○  │   │ Leona○  │   │Andrew○  │                  │
│      │    T    │   │    L    │   │   AD    │                  │
│      └─────────┘   └─────────┘   └─────────┘                  │
│           │             │             │                        │
│      ┌────┴────┐   ┌────┴────┐   ┌────┴────┐   ┌─────────┐   │
│      │Corbin○  │   │Andrea○  │   │Brian C○ │   │Preston○ │   │
│      │   CM    │   │   AA    │   │   BC    │   │   PC    │   │
│      └─────────┘   └─────────┘   └─────────┘   └─────────┘   │
│                                                                 │
│  ● Active  ○ Pending Setup                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  💬 ASK THE COLLECTIVE                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ What should we focus on this week to improve growth?    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                    [Ask SEED]   │
│                                                                 │
│  Recent Insights:                                               │
│  • "Retail velocity correlating with DTC - leverage this"      │
│  • "CAC trending up - investigate ad fatigue"                  │
│  • "LTV improving in cohort 3 - double down on that channel"   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

```typescript
// Core Types
interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;           // Google account
  role: string;
  status: 'active' | 'pending' | 'inactive';
  mirrorAgent?: MirrorAgent;
}

interface MirrorAgent {
  id: string;
  ownerId: string;
  identityCard: IdentityCard;
  skills: string[];
  knowledge: KnowledgeBase;
  focus: string[];
}

interface IdentityCard {
  role: string;
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  preferences: Record<string, any>;
}

interface MetricSnapshot {
  timestamp: Date;
  cac: number;
  ltv: number;
  monthlySpend: number;
  monthlyRevenue: number;
  retailVelocity: number;
  dtcVelocity: number;
  cashOnHand: number;
  runway: number;
}

interface Scenario {
  id: string;
  name: string;
  inputs: ScenarioInput;
  outputs: ScenarioOutput;
  createdAt: Date;
  createdBy: string;
}
```

---

## API Routes

### `/api/metrics`
- GET: Fetch current metrics from Shopify/QuickBooks
- Returns: MetricSnapshot

### `/api/scenarios`
- GET: List saved scenarios
- POST: Calculate and save new scenario
- Returns: Scenario[]

### `/api/team`
- GET: List team members and their status
- POST: Invite new team member
- Returns: TeamMember[]

### `/api/shopify`
- GET: Proxy to Shopify Admin API
- Fetches: Orders, customers, revenue, CAC

### `/api/quickbooks`
- GET: Proxy to QuickBooks API
- Fetches: Cash flow, expenses, P&L

---

## Environment Variables

```bash
# .env.local

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Shopify
SHOPIFY_STORE_URL=
SHOPIFY_ACCESS_TOKEN=

# QuickBooks
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_REALM_ID=

# Database
DATABASE_URL=

# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY=
```

---

## Migration Path from Original BRĒZ-OS

### Keep
- [ ] Shopify integration code
- [ ] QuickBooks integration code
- [ ] Customer insights components
- [ ] Growth generator logic
- [ ] Auth setup

### Update
- [ ] Simplify UI - remove complexity
- [ ] Add Momentum Command Center
- [ ] Add Scenario Calculator
- [ ] Improve chart visualizations
- [ ] Tighten branding

### Remove
- [ ] Broken/empty features
- [ ] Duplicate code
- [ ] Unused dependencies
- [ ] Complex features without data

### Add New
- [ ] Team nodes with Google auth
- [ ] SEED collective intelligence
- [ ] Real-time Claude Q&A
- [ ] Simple flip calculator
- [ ] Singularity narrative elements

---

## Deployment Checklist

- [ ] Clone original brez-os repo
- [ ] Run SEED audit
- [ ] Remove/update per plan
- [ ] Add new pages
- [ ] Test locally
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables
- [ ] Deploy
- [ ] Share live link

---

## Success Criteria

The MVP is successful when:

1. **Instant clarity**: Executive opens dashboard and knows company health in <5 seconds
2. **Scenario comparison**: Can flip between current/projected in <3 clicks
3. **Team visibility**: All 10 nodes visible, can invite via Google auth
4. **Data connected**: Shopify and QuickBooks data flowing
5. **Beautiful**: Matches Breeze brand, feels premium
6. **Simple**: No confusion about what anything means
