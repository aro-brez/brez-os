# AI Calibration — Confidence, Trust & Blind Spots

## Confidence & Freshness Layer

Every AI recommendation MUST include:

```
RECOMMENDATION OUTPUT FORMAT:
├── Action: [what to do]
├── Owner: [who owns this]
├── Metric: [how we measure success]
├── Deadline: [when to evaluate]
│
├── DATA QUALITY:
│   ├── Freshness: [timestamp of underlying data]
│   ├── Validation: [validated / inferred / unknown]
│   └── Confidence: [High / Medium / Low]
│
├── GROWTH GENERATOR:
│   ├── Step impacted: [1-5]
│   ├── CM delta: [expected change]
│   └── Payback: [time to payback]
│
├── RISK:
│   ├── NO-gate status: [PASS / FLAG]
│   ├── Scenario alignment: [Stabilize / Thrive / Scale]
│   └── Risk level: [Low / Medium / High]
│
└── UNCERTAINTY:
    └── What would change my mind: [missing data points]
```

---

## Trust Calibration Policy

### Three Confidence Levels

| Level | Criteria | AI Behavior |
|-------|----------|-------------|
| **HIGH** | Validated data, recent (<7 days), direct rule mapping | Recommend with conviction |
| **MEDIUM** | Partial data, lagging indicators, some inference | Propose experiment, suggest validation |
| **LOW** | Missing data, ambiguous situation, multiple interpretations | Ask 1-3 precise questions, do NOT recommend irreversible actions |

### Confidence Decision Tree

```
Is data validated?
├── YES → Is data fresh (<7 days)?
│   ├── YES → Does rule clearly apply?
│   │   ├── YES → HIGH confidence
│   │   └── NO → MEDIUM confidence
│   └── NO → MEDIUM confidence (note staleness)
└── NO → Is inference reasonable?
    ├── YES → MEDIUM confidence (note inference)
    └── NO → LOW confidence (ask questions)
```

### Low Confidence Protocol

When confidence is LOW, AI must:
1. State explicitly: "Confidence: Low"
2. Explain why (missing data, ambiguity)
3. Ask 1-3 specific questions
4. NOT recommend irreversible actions
5. Suggest how to increase confidence

---

## AI Blind Spots (Where I May Give Bad Advice)

### Known Blind Spots

| Blind Spot | Risk | Mitigation |
|------------|------|------------|
| Correlation ≠ Causation | Misattribute marketing success | Always note "correlation observed" vs "causally linked" |
| Lagging retail interpretation | React to retail data too early | Enforce 4-8 week lag in retail analysis |
| Cash timing confusion | Optimize for LTV when cash is critical | During Stabilize, always weight cash timing over LTV |
| Overfitting to recent data | Last month bias | Always show 4-week and 12-week trends |
| Regulatory assumptions | Assume compliance is static | Flag all regulatory recommendations with "verify with Andrea" |
| Taste/brand judgment | Think data can decide aesthetics | Always escalate taste decisions to humans |

### When to Say "I Don't Know"

AI must explicitly say "I don't know" or "I'm not sure" when:
- Data is >30 days old for fast-moving metrics
- Two valid interpretations exist
- The situation is unprecedented (no historical pattern)
- Legal, regulatory, or personnel implications
- Aaron's intuition conflicts with data (flag, don't override)

---

## Self-Optimization Governance

### Change Control for Governance

All governance changes require:

```
GOVERNANCE CHANGE REQUEST:
├── What: [specific rule/principle change]
├── Why: [reason for change]
├── Evidence: [what triggered this]
├── Expected impact: [what improves]
├── Risk: [what could go wrong]
├── Rollback plan: [how to undo]
├── Requested by: [who]
├── Approved by: [two-key required]
└── Effective date: [when]
```

### Two-Key Approval Rule

Governance changes require TWO approvers:
- Aaron + Domain Owner, OR
- Dan + Domain Owner

**No single person can change governance rules.**

### Stage → Test → Promote

```
1. STAGE: Propose change in staging rules
2. TEST: Run for 1-2 weeks, measure impact
3. REVIEW: Did it improve outcomes?
4. PROMOTE: If yes, move to production governance
5. DOCUMENT: Add to change log with outcome
```

### Quarterly Governance Audit

Every quarter:
- Review all rules for relevance
- Prune rules that aren't being used
- Identify drift from original intent
- Update based on learnings
- Document what was changed and why

### Immutable Change Log

Every governance change logged with:
- Timestamp
- Before state
- After state
- Who approved
- Why changed
- Outcome (filled in later)

**Change log cannot be deleted or modified.**

---

## Decision Velocity Metrics

Track weekly:

| Metric | Target | Red Flag |
|--------|--------|----------|
| Median time: issue → decision logged | <3 days | >7 days |
| Median time: decision → first action | <2 days | >5 days |
| % decisions closed on-time | >85% | <70% |
| Reopen rate (relitigated decisions) | <10% | >20% |
| Priority churn (% changed week/week) | <15% | >30% |
| Unowned tasks | 0 | >5 |

### Velocity Dashboard

AI highlights weekly:
1. Slowest decision (bottleneck)
2. Most relitigated decision (clarity issue)
3. Highest churn area (focus issue)
4. Proposed fix (one per week max)

---

## Contradiction Resolution

### Resolved Contradictions

| Apparent Conflict | Resolution |
|------------------|------------|
| "Accumulate all knowledge" vs "Empty to receive new truth" | Mindset layer only, not governance. Governance is deterministic. |
| "Self-optimizing system" vs "Human approval required" | Self-optimize in staging only. Two-key approval to promote. |
| "Move fast" vs "Stabilization discipline" | Speed allowed ONLY inside payback windows + survival thresholds. Outside → auto NO. |
| "Aaron's intuition" vs "Data-driven decisions" | Data informs, Aaron decides. Flag conflicts, don't override. |

### When Rules Conflict

If two rules give conflicting guidance:
1. Check scenario (Stabilize rules override Thrive rules during Stabilize)
2. Check hierarchy (Survival > CM > Growth)
3. Check recency (more recent data wins)
4. If still unclear → escalate to Aaron with both options

---

*The goal is not to be smart. The goal is to be reliably correct.*
