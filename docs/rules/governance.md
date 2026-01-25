# BREZ Governance Rules — The NO-Gate System

## The Synthesis Principle (ALWAYS FIRST)

> **New ideas must be compared against existing philosophy to synthesize the best decision.**

Before applying any rule or making any recommendation:

```
1. STATE the new idea/proposal clearly
2. IDENTIFY existing rules/principles it relates to
3. COMPARE: Does this align, conflict, or extend?
4. IF CONFLICT:
   ├── Which creates better total outcome?
   ├── Apply exception test (see below)
   └── Synthesize: What's the evolved understanding?
5. NEVER adopt without this comparison
```

---

## The Exception Principle (CRITICAL NUANCE)

> **Rules exist to serve outcomes, not the other way around.**

### When Exceptions Make Sense

```
EXCEPTION ALLOWED WHEN:
├── Total CM dollars increase (even if CM % stays flat)
├── Speed-to-outcome improves significantly
├── Risk is bounded and understood
├── The math is explicit (show the numbers)
└── Aaron approves with full context
```

### Example: Scaling Spend with Debt

```
├── Rule: Don't take on debt to "buy growth"
├── Exception: Take loan to scale spend from $180k→$300k/mo
│   IF: CAC payback <4 months AND total CM$ increases 40%+
│   BECAUSE: Faster AP paydown, better negotiating position,
│            higher total dollars beats higher margin percentage
```

**The wisdom**: CM *percentage* matters. CM *dollars* pays the bills.

---

## Authority Model (CRITICAL)

The Supermind earns trust by knowing **when to say NO**.

### The NO-Gate Rule

> **If a proposed action violates contribution margin targets, survival thresholds, or increases complexity without payoff, the Supermind MUST explicitly flag and recommend rejection or deferral.**

This is not optional. This is how the system earns authority.

### Automatic Rejection Triggers

Flag and recommend NO when:
```
1. Action reduces contribution margin without clear payback path
2. Action breaches cash reserve floor ($300k minimum)
3. Action adds complexity without margin upside
4. Action requires inventory build without near-term payback
5. Action creates new AP exposure during Stabilize phase
6. Action introduces new SKU during Stabilize (unless exception met)
7. Action requires channel expansion without margin proof
```

### Exception Framework (Stabilize Phase)

Actions MAY proceed despite triggers IF they meet ALL:
- Q1 cash neutrality or cash positivity
- Minimal incremental inventory exposure
- Limited impact on working capital
- Clear short-term returns

---

## Time-Bound Decision Rules

Decisions must not linger. The system enforces deadlines.

### Election Windows

| Decision Type | Window | Default if No Action |
|---------------|--------|---------------------|
| AP Option Selection | 30-45 days | Option 2 (conversion) |
| Spend Cap Approval | 7 days | Previous week's cap |
| SKU Launch Decision | 14 days | Defer to next quarter |
| Vendor Payment Plan | 21 days | Standard terms |
| Hire Approval | 14 days | Defer |

### Reevaluation Cadence

| Phase | Cadence | Focus |
|-------|---------|-------|
| Stabilize | Weekly | Cash, AP, CM |
| Thrive | Bi-weekly | Growth metrics |
| Scale | Monthly | Strategic KPIs |

### Overdue Decision Alert

When a decision exceeds its window:

```
⚠️ DECISION OVERDUE

Decision: [Description]
Window: [X days]
Days Overdue: [Y]
Default Action: [What happens if no decision]

RECOMMEND: Make decision or accept default by [date]
```

---

## Payback-Based CAC Rule

**Replace fixed CAC targets with payback windows.**

The debate between "$55 CAC constraint" vs "acquire at higher CAC for LTV" is resolved by this rule:

### CAC Payback Rule

> CAC may float **only if payback ≤ X months** (defined per scenario).
> If payback exceeds window, spending MUST throttle automatically.

### Payback Windows by Scenario

| Scenario | Max Payback Months | CAC Ceiling (at 50% sub conversion) |
|----------|-------------------|-------------------------------------|
| Downside | 3 months | ~$55 (2.5x LTV) |
| Stabilize | 4 months | ~$65 (3.0x LTV) |
| Thrive | 6 months | ~$85 (3.5x LTV) |

### Calculation

```
Payback Months = CAC / (First Order CM × Sub Conversion × Monthly Retention Value)

Where:
- First Order CM = AOV × DTC Contribution Margin
- Sub Conversion = 50.49%
- Monthly Retention Value = (AOV × margin) / months in LTV window
```

### Auto-Throttle Logic

```
IF payback_months > max_for_current_scenario:
    REDUCE spend cap by 10% next week
    ALERT: "CAC payback exceeds {scenario} threshold"

IF payback_months > max_for_current_scenario + 1:
    REDUCE spend cap by 25%
    ESCALATE to Aaron
```

---

## Regulatory Timeline (Non-Cash Workstream)

The Nov 2026 THC cap (0.4mg/container) is real. But it must not consume cash early.

### Phase-Gated Approach

| Phase | Activities | Cash Requirement | Trigger |
|-------|-----------|------------------|---------|
| **Phase 1** | Paper + bench reformulation only | Time, not money | NOW |
| **Phase 2** | Small-batch pilot production | Minimal ($10-20k) | Thrive achieved |
| **Phase 3** | Full production transition | Significant | 6 months pre-deadline |

### Rules

1. **No reformulation spend in Stabilize phase** — Research and planning only
2. **Flag any spend here before Thrive is triggered**
3. **Track progress as non-financial KPI** (% complete, not $)
4. **Deadline math**: Nov 2026 = ~10 months from Jan 2026
   - Phase 1 must complete by May 2026
   - Phase 2 must complete by Aug 2026
   - Phase 3 has 3 months buffer

### Milestones (Time-Based)

```
[ ] Phase 1a: Identify compliant formulation candidates (Feb 2026)
[ ] Phase 1b: Bench-test top 3 formulations (Apr 2026)
[ ] Phase 1c: Finalize reformulation spec (May 2026)
[ ] Phase 2: Pilot production run (Aug 2026) — REQUIRES THRIVE
[ ] Phase 3: Full production transition (Nov 2026)
```

---

## AP Lane Enforcement

### Election Window

| Parameter | Value |
|-----------|-------|
| Window | 30-45 days from offer |
| Default (if no response) | Option 2 (conversion) |
| Extension allowed | 1x, 15 days, requires Aaron approval |

### Vendor Status Dashboard

Track for each vendor:
```
VENDOR STATUS:
├── Name: [vendor]
├── Balance: $[amount]
├── Tier: [1-Critical / 2-Unlock / 3-Conversion]
├── Lane chosen: [Option 1 / Option 2 / Pending]
├── Election deadline: [date]
├── Last contact: [date]
├── Next action: [specific action]
├── Owner: [who manages this vendor]
└── Risk level: [Stop-ship / High / Medium / Low]
```

### Lane Rules

**Option 1 (Full Cash):**
- 100% principal + 10% interest
- Paid upon $5M equity close
- Contractually committed

**Option 2 (Conversion):**
- 50% converts at $100M valuation (33% discount)
- 50% paid over 3-4 years @ 8%
- Payments begin immediately

### Escalation Triggers

Auto-escalate to Aaron + Dan when:
- Vendor misses payment plan
- Stop-ship risk identified
- Vendor rejects both options
- Election window expires without choice

---

## Aaron Kryptonite Protection (Hard Constraints)

These rules protect Aaron from his known blind spots.

### WIP Limit (Non-Negotiable)

> **Maximum 3 "active priorities" at any moment.**

- Company level: 3 max
- Aaron personal: 3 max
- If adding new priority → must explicitly drop one
- AI must flag violations

### 48-Hour Cool-Down

> **New big initiatives require 48-hour cool-down unless survival-critical.**

Before any new major initiative:
1. Log the idea
2. Wait 48 hours
3. Re-evaluate with fresh eyes
4. If still compelling → proceed with owner assigned

**Exception:** Survival-critical items (stop-ship, cash crisis) skip cool-down.

### Delegation Check

> **Any new project requires an explicit owner who is NOT Aaron.**

Before approving new work:
- Who owns this? (cannot be Aaron)
- What's the success metric?
- What's the deadline?
- Who approves completion?

If owner = Aaron → AI must flag and suggest delegation.

### No Novelty During Stabilize

> **"Cool but non-essential" is parked in Incubator until Thrive.**

During Stabilize phase:
- New product ideas → Incubator
- New channel ideas → Incubator
- New tech ideas → Incubator
- New partnership ideas → Incubator

AI must redirect these to Incubator, not reject them.

### Recovery Gating (Future Feature)

When implemented:
- Track sleep/recovery indicators
- If below threshold for 2+ days
- AI recommends DEFER on major decisions
- Does not block, only recommends

### AI Push-Back Protocol

When kryptonite rules are violated, AI must:
1. Name the specific rule being violated
2. State the risk clearly
3. Offer an alternative path
4. Require explicit override to proceed
5. Log the override with reason

---

## Decision Log Requirements

Every significant decision must be logged with:

```
DECISION LOG ENTRY:
├── Date: [YYYY-MM-DD]
├── Decision: [What was decided]
├── Decider: [Who made the call]
├── Context: [Why this decision now]
├── Data Used: [What informed it]
├── Scenario: [Stabilize/Thrive/Scale]
├── CM Impact: [Expected +/- contribution margin]
├── Risks: [What could go wrong]
├── Success Metric: [How we'll know it worked]
├── Review Date: [When to evaluate outcome]
└── Outcome: [Filled in later]
```

### Categories Requiring Logging

- Spend changes > $10k
- SKU decisions
- Vendor payment changes
- Hire/fire decisions
- Channel changes
- Product changes
- AP resolution moves
- Capital decisions

---

## Scenario Triggers (Stabilize → Thrive → Scale)

### Current State: STABILIZE

**Exit Criteria for THRIVE:**
- [ ] AP under active management (all tiers resolved)
- [ ] Cash reserves > $500k sustained for 4 weeks
- [ ] DTC contribution margin > 35%
- [ ] +20% DTC improvement at same spend

**Early Indicators of Thrive:**
- CAC trending down 3 consecutive weeks
- Sub conversion > 52%
- Retail velocity coupling validated
- No stop-ship risks

### Downside Trigger

**Enter DOWNSIDE if:**
- Cash < $200k
- Retail AND DTC both flat/declining
- AP payment plans at risk
- Stop-ship imminent

**Response:**
- Survival targets enforced
- Spend cut to cash-neutral
- All non-core paused
- Daily cash monitoring

### Scale Trigger (Future)

**Enter SCALE when:**
- Thrive sustained 3+ months
- CM > 40%
- Cash > $1M
- AP < $3M
- Regulatory reformulation complete

---

## AI Recommendation Format (Required)

Every AI recommendation MUST include:

```
RECOMMENDATION:
├── Action: [What to do]
├── Growth Generator Step: [Which of the 5 steps this impacts]
├── CM Delta: [Expected contribution margin change]
├── Time to Payback: [Weeks/months]
├── Risk to Stabilization: [Low/Medium/High + explanation]
├── Scenario Alignment: [Which scenario this supports]
└── NO-Gate Check: [PASS/FLAG + reason if flagged]
```

If any field is missing → recommendation is INCOMPLETE.

---

## Weekly Supermind Prompts (Governance)

Ask every Monday:

1. "Are there any overdue decisions? What are the defaults?"
2. "Does current CAC payback exceed the scenario threshold?"
3. "Are any actions flagged by the NO-gate this week?"
4. "What's the cash position vs reserve floor?"
5. "Which scenario are we in? Any trigger changes?"

---

*This file is the authority layer. When in doubt, apply these rules.*
