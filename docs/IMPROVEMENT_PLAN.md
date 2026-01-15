# BREZ Growth Generator - Improvement Plan

> Generated: 2026-01-13
> Target: Operational OS with Low Manual Work

---

## Top 10 Improvements Ranked by ROI

| Rank | Improvement | Impact | Effort | ROI | Dependencies |
|------|-------------|--------|--------|-----|--------------|
| **1** | Weekly Plan Wizard | CRITICAL | 1-2 days | 10x | None |
| **2** | Cash Physics Truth Section | HIGH | 0.5 days | 8x | None |
| **3** | Better Suggested Actions | HIGH | 1 day | 7x | #2 |
| **4** | Per-Role Login Guides | MEDIUM | 0.5 days | 6x | None |
| **5** | CSV Inbox + Normalizer | HIGH | 2 days | 5x | None |
| **6** | Approval Workflow | HIGH | 2-3 days | 5x | #1 |
| **7** | Lane 2 Market Selector | MEDIUM | 1-2 days | 4x | #5 |
| **8** | Shopify Connector | CRITICAL | 3-5 days | 4x | API access |
| **9** | QuickBooks Connector | CRITICAL | 3-5 days | 4x | API access |
| **10** | Decision Outcome Tracking | MEDIUM | 2 days | 3x | #6 |

---

## 1. Weekly Plan Wizard

### Purpose
Guide users through a structured weekly planning process that produces an approved spend/action plan.

### Flow (7 screens)

```
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 1: WEEK SELECTOR                                        │
│                                                                 │
│  Planning for: Week of [Jan 13, 2026] ▼                        │
│                                                                 │
│  Last week's plan: ✓ Completed | Spend: $42K | CAC: $52       │
│                                                                 │
│  [Start Weekly Plan →]                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 2: REVIEW LAST WEEK                                     │
│                                                                 │
│  What happened last week?                                       │
│                                                                 │
│  ┌──────────────┬──────────┬──────────┬─────────┐              │
│  │ Metric       │ Planned  │ Actual   │ Delta   │              │
│  ├──────────────┼──────────┼──────────┼─────────┤              │
│  │ Ad Spend     │ $45,000  │ $42,300  │ -6%     │              │
│  │ CAC          │ $55      │ $52      │ ✓ -5%   │              │
│  │ New Custs    │ 818      │ 813      │ -1%     │              │
│  │ Revenue      │ $72,000  │ $68,500  │ -5%     │              │
│  └──────────────┴──────────┴──────────┴─────────┘              │
│                                                                 │
│  Key learnings: [AI-generated summary]                          │
│                                                                 │
│  [← Back]                              [Continue →]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 3: CASH PHYSICS CHECK                                   │
│                                                                 │
│  Current Cash Position                                          │
│                                                                 │
│  Cash on Hand:        $420,000                                  │
│  Reserve Floor:       $300,000                                  │
│  ─────────────────────────────                                  │
│  Available to Deploy: $120,000                                  │
│                                                                 │
│  Upcoming Obligations (next 4 weeks):                           │
│  • Payroll (Jan 15):      -$85,000                             │
│  • AP Payment (Jan 18):   -$50,000                             │
│  • Production (Jan 20):   -$120,000                            │
│                                                                 │
│  ⚠️ WARNING: Production payment may breach floor               │
│                                                                 │
│  [← Back]                              [Continue →]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 4: SET THIS WEEK'S SPEND                                │
│                                                                 │
│  Weekly Ad Spend Plan                                           │
│                                                                 │
│  Current scenario: [STABILIZE ▼]                               │
│  Max CAC allowed: $55 | Max payback: 4 months                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Total spend this week: [$45,000    ]           │           │
│  │                                                 │           │
│  │ Lane 1 (National):     [$38,000] 84%          │           │
│  │ Lane 2 (Retail focus): [$7,000 ] 16%          │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  Projected outcomes:                                            │
│  • New customers: ~820                                          │
│  • Implied CAC: $55                                            │
│  • Payback: 3.8 months ✓                                       │
│                                                                 │
│  [← Back]                              [Continue →]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 5: LANE 2 MARKET SELECTION                              │
│                                                                 │
│  Where should Lane 2 spend go?                                  │
│                                                                 │
│  AI Recommendation: Focus on Texas + Florida                    │
│  (Highest velocity lift per $ based on last 8 weeks)           │
│                                                                 │
│  ┌────────────┬──────────┬──────────┬──────────┬────────┐     │
│  │ Market     │ Velocity │ Doors    │ Lift/1K  │ Select │     │
│  ├────────────┼──────────┼──────────┼──────────┼────────┤     │
│  │ Texas      │ 2.4/door │ 450      │ +0.18    │ [✓]    │     │
│  │ Florida    │ 2.1/door │ 380      │ +0.15    │ [✓]    │     │
│  │ California │ 1.8/door │ 620      │ +0.12    │ [ ]    │     │
│  │ New York   │ 1.5/door │ 290      │ +0.09    │ [ ]    │     │
│  └────────────┴──────────┴──────────┴──────────┴────────┘     │
│                                                                 │
│  Selected: Texas, Florida | Budget: $7,000                     │
│                                                                 │
│  [← Back]                              [Continue →]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 6: KEY ACTIONS THIS WEEK                                │
│                                                                 │
│  Top 3 priorities (AI-suggested, editable)                     │
│                                                                 │
│  1. [✓] Review Q1 creative refresh with Andrew                 │
│         Owner: [Amy ▼]  Due: [Jan 17]                          │
│                                                                 │
│  2. [✓] Confirm Sprouts reorder timing                         │
│         Owner: [Niall ▼] Due: [Jan 15]                         │
│                                                                 │
│  3. [✓] Analyze subscription churn spike                       │
│         Owner: [Al ▼]    Due: [Jan 16]                         │
│                                                                 │
│  [+ Add action]                                                 │
│                                                                 │
│  [← Back]                              [Continue →]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 7: PLAN SUMMARY & APPROVAL                              │
│                                                                 │
│  Weekly Plan: Jan 13-19, 2026                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ SPEND                                           │           │
│  │ Total: $45,000                                  │           │
│  │ Lane 1: $38,000 (National)                     │           │
│  │ Lane 2: $7,000 (TX, FL)                        │           │
│  │                                                 │           │
│  │ TARGETS                                         │           │
│  │ CAC: ≤$55 | Payback: ≤4mo | New Custs: 820    │           │
│  │                                                 │           │
│  │ ACTIONS                                         │           │
│  │ • Creative refresh review (Amy, Jan 17)        │           │
│  │ • Sprouts reorder (Niall, Jan 15)             │           │
│  │ • Churn analysis (Al, Jan 16)                 │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  Status: [DRAFT]                                                │
│                                                                 │
│  [← Back]    [Save Draft]    [Submit for Approval →]           │
│                                                                 │
│  Approver: [Aaron Nosbisch]                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Requirements
- Last week's actuals (CSV or connector)
- Current cash position (source-of-truth or connector)
- Retail velocity by market (CSV)
- Team member list (devStore)

### Implementation Notes
- Store plans in devStore with status: draft | pending | approved | rejected
- Email/notification to approver when submitted
- Lock inputs once approved
- Compare actuals to plan in next week's review

---

## 2. Approval Workflow Design

### States
```
DRAFT → PENDING_APPROVAL → APPROVED
                        → REJECTED → DRAFT (revised)
```

### Roles
| Role | Can Create | Can Approve | Can View |
|------|------------|-------------|----------|
| Analyst | Yes | No | Own plans |
| Manager | Yes | Own team | Team plans |
| Director | Yes | Department | All plans |
| Admin (Aaron, Dan) | Yes | All | All |

### UI Components

**Plan Card (in list view)**
```
┌─────────────────────────────────────────────────────┐
│ Week of Jan 13 • Created by Al Huynh               │
│ Spend: $45K | CAC Target: $55 | 3 actions          │
│                                                     │
│ Status: [PENDING APPROVAL]  Approver: Aaron        │
│                                                     │
│ [View] [Approve ✓] [Request Changes]               │
└─────────────────────────────────────────────────────┘
```

**Approval Modal**
```
┌─────────────────────────────────────────────────────┐
│ Approve Weekly Plan?                                │
│                                                     │
│ This will:                                          │
│ • Lock the spend targets for this week             │
│ • Create tasks for the 3 actions                   │
│ • Notify the team                                  │
│                                                     │
│ Optional note:                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Looks good. Watch CAC closely on Lane 2.       ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ [Cancel]                    [Approve & Lock →]     │
└─────────────────────────────────────────────────────┘
```

---

## 3. CSV Inbox + Normalizer Design

### Problem
Users upload CSVs with different column names, formats, and structures. Current parser assumes specific columns.

### Solution: Smart Column Mapper

**Step 1: Upload**
```
┌─────────────────────────────────────────────────────┐
│ CSV Inbox                                           │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │  Drop CSV files here or click to browse         ││
│ │  [📁]                                           ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Expected file types:                               │
│ • Weekly Spend Report (from Meta/Google)          │
│ • Retail Velocity (from ConduitIQ)                │
│ • Production Schedule (from ops)                  │
│ • Cash Position (from finance)                    │
└─────────────────────────────────────────────────────┘
```

**Step 2: Auto-Detect Type**
```
┌─────────────────────────────────────────────────────┐
│ Detected: Weekly Spend Report                       │
│                                                     │
│ Columns found:                                      │
│ • "Date" → [Week ▼]                                │
│ • "Spend" → [Ad Spend ▼]                           │
│ • "Results" → [New Customers ▼]                    │
│ • "CPA" → [CAC ▼]                                  │
│ • "Campaign" → [Ignore ▼]                          │
│                                                     │
│ Preview (first 5 rows):                            │
│ ┌────────────┬─────────┬─────────┬───────┐        │
│ │ Week       │ Spend   │ Custs   │ CAC   │        │
│ ├────────────┼─────────┼─────────┼───────┤        │
│ │ 2026-01-06 │ $42,300 │ 813     │ $52   │        │
│ │ 2026-01-13 │ $45,100 │ 847     │ $53   │        │
│ └────────────┴─────────┴─────────┴───────┘        │
│                                                     │
│ [Cancel]                    [Import →]             │
└─────────────────────────────────────────────────────┘
```

**Step 3: Validation**
```
┌─────────────────────────────────────────────────────┐
│ Validation Results                                  │
│                                                     │
│ ✓ 12 rows imported                                 │
│ ✓ Date range: Jan 6 - Mar 30, 2026                │
│ ⚠️ 2 rows had missing CAC (calculated from spend) │
│                                                     │
│ Data merged with existing:                         │
│ • 4 weeks updated (newer data)                    │
│ • 8 weeks added (new data)                        │
│                                                     │
│ [View in Simulator →]                              │
└─────────────────────────────────────────────────────┘
```

### Column Mapping Rules
| Detected Pattern | Maps To |
|------------------|---------|
| date, week, period | time.week |
| spend, cost, budget | dtc.spend |
| cac, cpa, cost per | dtc.cac |
| customers, purchases, orders | dtc.newCustomers |
| velocity, upw, units per week | retail.velocity |
| doors, stores, locations | retail.doors |
| cash, balance | cash.position |

---

## 4. Lane 2 Market Selector Design

### Purpose
Data-driven selection of which markets to concentrate Lane 2 (retail ignition) spend.

### Data Inputs
- Retail velocity by state (CSV from ConduitIQ)
- Door count by state
- Historical Lane 2 spend by state
- Velocity lift measured 4-8 weeks after spend

### Algorithm
```
For each market:
  velocity_lift = (velocity_after - velocity_before) / spend_applied
  roi_score = velocity_lift × doors × margin

Rank markets by roi_score
Recommend top 3 with highest lift per dollar
```

### UI
```
┌─────────────────────────────────────────────────────────────────┐
│ Lane 2 Market Selector                                          │
│                                                                 │
│ Budget available: $7,000                                        │
│ Recommended allocation based on last 8 weeks of data           │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ [Map visualization showing state-level heat map]          │  │
│ │ Darker = higher ROI score                                 │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Top Markets by ROI:                                            │
│                                                                 │
│ ┌────────┬────────┬───────┬──────────┬─────────┬──────────┐   │
│ │ Rank   │ State  │ Doors │ Velocity │ Lift/$K │ Allocate │   │
│ ├────────┼────────┼───────┼──────────┼─────────┼──────────┤   │
│ │ 1      │ TX     │ 450   │ 2.4/door │ +0.18   │ [$3,500] │   │
│ │ 2      │ FL     │ 380   │ 2.1/door │ +0.15   │ [$2,500] │   │
│ │ 3      │ AZ     │ 180   │ 1.9/door │ +0.14   │ [$1,000] │   │
│ │ 4      │ CA     │ 620   │ 1.8/door │ +0.12   │ [$0    ] │   │
│ └────────┴────────┴───────┴──────────┴─────────┴──────────┘   │
│                                                                 │
│ Total allocated: $7,000 ✓                                      │
│                                                                 │
│ [Reset to AI Recommendation]           [Apply to Plan →]       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Requirements
- State-level velocity data (CSV)
- Historical spend by state (CSV or manual)
- Door count by state (from retail team)

---

## 5. Per-Role Login Guides

### Purpose
After login, show role-specific "what to do first" guidance.

### Role Definitions
| Role | Department | First Actions |
|------|------------|---------------|
| **Executive** | Exec | Review cash position, approve pending plans, check KPIs |
| **Growth** | Growth, Marketing | Check CAC trends, review spend plan, analyze campaigns |
| **Sales** | Retail, Sales | Check velocity by account, review Lane 2 markets |
| **Finance** | Finance, Ops | Update cash position, review AP/AR, reconcile |
| **Product** | Product, R&D | Check customer feedback, review roadmap items |
| **CX** | CX, Support | Review customer messages, check sentiment trends |

### UI
```
┌─────────────────────────────────────────────────────────────────┐
│ Good morning, Aaron! 👋                                         │
│                                                                 │
│ As CEO, here's your focus for today:                           │
│                                                                 │
│ 1. ⏰ 2 plans pending your approval                            │
│    [Review Plans →]                                            │
│                                                                 │
│ 2. 💰 Cash update needed (last: 3 days ago)                    │
│    [Update Cash Position →]                                    │
│                                                                 │
│ 3. 📊 Weekly ELT summary ready                                 │
│    [View Summary →]                                            │
│                                                                 │
│ ─────────────────────────────────────────                      │
│                                                                 │
│ Quick stats:                                                   │
│ • Cash: $420K (above floor ✓)                                  │
│ • CAC this week: $52 (under target ✓)                         │
│ • AP due this week: $135K                                      │
│                                                                 │
│ [Go to Dashboard →]                   [Skip to full app]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## V1.1 Implementation Plan (1-2 Days)

### Goal
Make the app operational for weekly planning with minimal effort.

### Scope
1. Weekly Plan Wizard (simplified: 4 screens)
2. Cash Physics Truth Section (visible on dashboard)
3. Better Suggested Actions (role + phase aware)
4. Per-Role Login Guides

### Day 1: Foundation

**Morning (4 hours)**
- [ ] Create `src/lib/data/weekly-plans.ts` - Plan storage and state machine
- [ ] Create `src/components/guided/WeeklyPlanWizard.tsx` - 4-screen wizard
- [ ] Add "Start Weekly Plan" button to dashboard

**Afternoon (4 hours)**
- [ ] Create `src/components/dashboard/CashPhysics.tsx` - Truth display
- [ ] Add to main dashboard page
- [ ] Wire up source-of-truth data

### Day 2: Intelligence

**Morning (4 hours)**
- [ ] Update `src/lib/ai/prioritizer.ts` - Role + phase logic
- [ ] Create `src/components/guided/RoleGuide.tsx` - Per-role actions
- [ ] Add to AuthGate after user selection

**Afternoon (4 hours)**
- [ ] Testing and polish
- [ ] Deploy to Vercel
- [ ] Write usage documentation

### Files to Change

| File | Changes |
|------|---------|
| `src/lib/data/weekly-plans.ts` | NEW - Plan data model and storage |
| `src/components/guided/WeeklyPlanWizard.tsx` | NEW - 4-screen wizard |
| `src/app/page.tsx` | Add "Start Weekly Plan" CTA |
| `src/components/dashboard/CashPhysics.tsx` | NEW - Truth section |
| `src/lib/ai/prioritizer.ts` | Add role/phase-aware suggestions |
| `src/components/guided/RoleGuide.tsx` | NEW - Per-role guidance |
| `src/components/auth/AuthGate.tsx` | Add RoleGuide after selection |

### Success Criteria
- [ ] User can complete a weekly plan in <5 minutes
- [ ] Cash physics are visible and understood
- [ ] Suggested actions differ by role
- [ ] New users know what to do first

---

## Summary

The BREZ Growth Generator has a solid simulation engine and beautiful UI, but it's not operational. V1.1 should focus on:

1. **Weekly Plan Wizard** - The core ritual that makes this an operating system
2. **Cash Physics Display** - Make the rules visible and trusted
3. **Smart Suggestions** - Role and phase-aware guidance
4. **Role Onboarding** - Everyone knows their first action

This transforms the app from a demo to a tool the team actually uses every week.
