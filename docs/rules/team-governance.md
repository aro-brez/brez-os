# Team Governance — 60-Person Deployment Rules

## Decision Rights Map (RACI + Single Writer)

### Single Writer Principle

> **Each domain has ONE accountable owner. Decisions are only "real" when logged.**

| Domain | Single Writer | Backup | Approver |
|--------|--------------|--------|----------|
| DTC/Growth | Al Huynh | Brian Dewey | Aaron |
| Retail/Sales | Niall Little | Brian Dewey | Aaron |
| Finance/Cash | Abla Jad | Dan | Aaron |
| Operations | Dan | Sondra | Aaron |
| Product | Travis Duncan | Preston | Aaron |
| Creative | Andrew Deitsch | Amy | Aaron |
| Marketing | Amy Endemann | Al | Aaron |
| People | Malia Steel | Geremie | Aaron |
| Legal/Compliance | Andrea Golan | Amber | Aaron |

### Decision Validity Rule

A decision is NOT real unless it has:
```
├── Owner (Single Writer)
├── Metric (how we measure success)
├── Deadline (when we evaluate)
├── Logged in Decision Log
└── Scenario alignment (Stabilize/Thrive/Scale)
```

**If a decision isn't logged, it didn't happen.**

---

## Security & Access Control

### Role-Based Permissions

| Role | View | Suggest | Approve | Admin |
|------|------|---------|---------|-------|
| Team Member | ✅ Own dept | ✅ Own dept | ❌ | ❌ |
| Manager | ✅ Own dept | ✅ Own dept | ✅ Own dept | ❌ |
| Director/VP | ✅ All | ✅ All | ✅ Own dept | ❌ |
| C-Suite | ✅ All | ✅ All | ✅ All | ❌ |
| Aaron | ✅ All | ✅ All | ✅ All | ✅ |

### Restricted Data (Need-to-Know)

These require explicit access grant:
- Vendor AP balances by name
- Individual compensation data
- Equity grant details
- Cash position exact figures
- Legal/litigation matters

### Audit Log Requirements

All changes to source-of-truth must log:
- Who made the change
- What changed (before/after)
- When (timestamp)
- Why (reason required)

**Audit log is immutable. No deletions.**

---

## Team Deployment Rules (Prevent Gaming)

### What Breaks at Scale

| Risk | Prevention |
|------|------------|
| Gamification gaming (XP ≠ outcomes) | XP tracks participation, not performance. Never tie to comp. |
| Dashboard confusion | Max 1 Exec dashboard + 1 per department |
| Conflicting metric definitions | Metric Dictionary is mandatory (one definition per KPI) |
| "AI is judging me" feeling | AI is referee, not boss. Humans decide; AI records + flags. |
| Slack-decisions (side channels) | If not logged, it didn't happen. Period. |

### Dashboard Limit (Hard Cap)

```
ALLOWED:
├── 1 Executive Dashboard (KPIs only)
├── 1 per Department (their metrics)
└── That's it. No more.

NOT ALLOWED:
├── Personal dashboards
├── "Experimental" dashboards
├── Duplicate views of same data
└── Anything that fragments attention
```

### Metric Dictionary Rule

Every KPI must have ONE definition:
```
METRIC ENTRY:
├── Name: [exact name]
├── Definition: [precise calculation]
├── Source: [where data comes from]
├── Owner: [who maintains it]
├── Update frequency: [how often]
└── NO ALIASES (one name only)
```

---

## Kill List (Complexity Control)

### Active Kill List

Maintain a running list of paused items with unpause conditions:

```
KILL LIST FORMAT:
├── Item: [what's paused]
├── Type: [SKU / Project / Integration / Initiative]
├── Paused date: [when]
├── Paused by: [who]
├── Unpause condition: [specific metric trigger]
├── Unpause owner: [who decides]
└── Status: [PAUSED / UNPAUSED / KILLED]
```

### Current Kill List (Stabilize Phase)

| Item | Type | Unpause Condition |
|------|------|-------------------|
| New SKUs | Product | Thrive triggered + margin proof |
| Channel expansion | Sales | Thrive triggered + CM proof |
| New integrations (beyond Priority 1-3) | Tech | Weekly ELT habit established |
| Reformulation spend | Product | Thrive triggered |
| New hires (non-critical) | People | AP < $5M |

### Incubator List

"Cool but non-essential" ideas go here during Stabilize:
- Logged with original idea
- Tagged with potential value
- Reviewed quarterly
- Never worked on until unpaused

---

## Cultural Integration

### AI Positioning

Introduce Supermind as:
> "Your co-pilot for the most exciting business journey of your career."

**The Promise:**
- Every morning: YOUR highest-leverage move, ready
- Real-time scoreboard of collective progress toward $200B
- When your decision moves the needle, you FEEL it
- Your work connects to something bigger
- Wins celebrated. Progress visible. Impact quantified.

**NOT:**
- Surveillance or micromanagement
- "The system that tells you what to do"
- Performance tracking for tracking's sake
- Another tool that feels like work

**The distinction:** AI is your ally in winning, not your overseer.

### AI Communication Rules

1. **Speak in options + tradeoffs**, not commands (except NO-gate violations)
2. **Always identify**: owner, metric, timeframe
3. **Praise execution and closure**, not personality
4. **Default to "assist" tone**, escalate only for survival risk
5. **Never shame**, only clarify

### What AI Says vs What It Means

| AI Says | What It Means |
|---------|---------------|
| "This requires a decision" | Someone needs to own this |
| "This is flagged by NO-gate" | This violates a hard rule |
| "Consider these options" | Here are tradeoffs, you decide |
| "This decision is overdue" | Default action kicks in soon |
| "Confidence: Low" | I need more data, ask me questions |

---

## Edge Cases (Human Judgment Required)

AI must escalate and NOT decide for:

| Category | Examples | Escalate To |
|----------|----------|-------------|
| Legal/Regulatory | Compliance interpretation, contract terms | Andrea |
| PR/Reputation | Crisis response, public statements | Aaron + Amy |
| Vendor negotiation | Beyond two-lane framework, relationship nuance | Dan + Abla |
| Personnel | Hiring/firing, culture conflicts, performance | Malia + Aaron |
| Brand/Taste | Creative direction, product aesthetics | Aaron + Andrew |
| Survival risk | Stop-ship, cash crisis | Aaron + Dan immediately |

---

## Phased Deployment Plan

### Phase 1: Read-Only (Week 1-2)
- Team can view dashboards
- Team can ask AI questions
- NO decision logging required yet
- NO enforcement active
- Goal: Familiarity

### Phase 2: Habit Formation (Week 3-4)
- Decision Log becomes mandatory
- Weekly ELT summary goes live
- AI suggestions visible (not enforced)
- Goal: Logging becomes habit

### Phase 3: Enforcement (Week 5-6)
- NO-gate enforcement active
- Time-bound decision windows active
- Overdue alerts active
- Goal: System has authority

### Phase 4: Expansion (Week 7+)
- Add integrations in priority order
- Add department-specific features
- Add gamification (optional)
- Goal: Full operation

### Go/No-Go Criteria Per Phase

| Phase | Go Criteria |
|-------|-------------|
| 1→2 | 80% of team has logged in |
| 2→3 | 90% of decisions being logged |
| 3→4 | <10% decisions overdue, Weekly ELT running 3 weeks |

---

*The system earns trust by being boringly correct, not impressively smart.*
