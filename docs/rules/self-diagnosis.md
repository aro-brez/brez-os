# Self-Diagnosis Engine — What Does The Supermind Need?

> **The system that knows its gaps can close them.**
> **The system that's blind to its blindness stays blind.**

---

## AUTOMATIC DETECTION PROTOCOLS

### Data Staleness Detection

```
FOR EACH DATA SOURCE:

1. CHECK last_updated timestamp
2. COMPARE to freshness threshold:
   ├── Cash/AP: 24 hours
   ├── DTC funnel: 7 days
   ├── Retail velocity: 7 days
   ├── Customer voice: 7 days
   └── Inventory: 7 days

3. IF stale:
   ├── FLAG in seed-state.json
   ├── GENERATE refresh question
   └── ESCALATE if survival-critical

4. ALERT format:
   "⚠️ DATA STALE: [source] last updated [X days ago].
    Impact: [what decisions are blocked].
    Action: [how to refresh]"
```

### Rule Relevance Detection

```
FOR EACH RULE:

1. TRACK invocation frequency
   ├── Last 7 days: [count]
   ├── Last 30 days: [count]
   └── Ever: [count]

2. IF never invoked (30+ days):
   └── FLAG for review: "Rule [X] never triggered. Still needed?"

3. IF invoked >10x/week:
   └── Consider automation or skill creation

4. IF contradicts another rule:
   └── ESCALATE for synthesis resolution
```

### Knowledge Gap Detection

```
TRIGGERS FOR GAP DETECTION:

1. UNANSWERABLE QUESTIONS
   When Supermind can't answer a question:
   ├── LOG the question
   ├── CLASSIFY: data gap vs rule gap vs philosophy gap
   └── ADD to question queue

2. PREDICTION FAILURES
   When prediction misses reality:
   ├── LOG the miss
   ├── ANALYZE: wrong data? wrong model? wrong assumption?
   └── UPDATE calibration

3. RECOMMENDATION REJECTIONS
   When recommendations aren't followed:
   ├── LOG the rejection
   ├── ANALYZE: irrelevant? wrong timing? wrong format?
   └── IMPROVE relevance model

4. REPEATED QUESTIONS
   Same question asked 3+ times:
   ├── CREATE rule or FAQ
   ├── STORE in learnings
   └── UPDATE CLAUDE.md if philosophical
```

### Connection Gap Detection

```
FOR EACH KNOWLEDGE NODE:

1. COUNT connections
   ├── If 0 connections: ORPHAN (should not exist alone)
   ├── If 1-2 connections: WEAK (look for more)
   ├── If 3+ connections: HEALTHY

2. CHECK cross-domain connections
   ├── If all same domain: SILOED (look for cross-pollination)
   ├── If 2+ domains: HEALTHY

3. GENERATE connection questions:
   "Does [node A] in [domain X] relate to [node B] in [domain Y]?"
```

---

## WHAT THE SUPERMIND NEEDS (Auto-Generated)

### Priority 1: Survival Needs

```
SURVIVAL DETECTION:

IF cash_position < $300k OR cash_position == unknown:
├── NEED: Real-time cash visibility
├── SOLUTION: QuickBooks integration
└── URGENCY: CRITICAL

IF stop_ship_risk == true OR stop_ship_risk == unknown:
├── NEED: Vendor payment status
├── SOLUTION: AP tracking system
└── URGENCY: CRITICAL

IF bottleneck_1 != cash:
├── NEED: Validate bottleneck stack
├── SOLUTION: Manual verification with Dan/Abla
└── URGENCY: HIGH
```

### Priority 2: CM Needs

```
CM OPTIMIZATION DETECTION:

IF dtc_cac > payback_threshold OR dtc_cac == unknown:
├── NEED: CAC/payback visibility
├── SOLUTION: Meta + Shopify integration
└── URGENCY: HIGH

IF retail_cm < 30% OR retail_cm == unknown:
├── NEED: Retail margin by account
├── SOLUTION: Retail data feed
└── URGENCY: HIGH

IF subscription_conversion < 50% OR subscription_conversion == unknown:
├── NEED: Subscription funnel data
├── SOLUTION: Shopify subscription tracking
└── URGENCY: MEDIUM
```

### Priority 3: System Needs

```
SYSTEM IMPROVEMENT DETECTION:

IF data_freshness_score < 70%:
├── NEED: More integrations
├── SOLUTION: Prioritize by impact
└── URGENCY: MEDIUM

IF recommendation_follow_rate < 80%:
├── NEED: Better relevance
├── SOLUTION: Learn from rejections
└── URGENCY: MEDIUM

IF question_resolution_rate < 50%:
├── NEED: Faster answers
├── SOLUTION: Better question routing
└── URGENCY: LOW
```

### Priority 4: Expansion Needs

```
EXPANSION DETECTION:

IF skills_created == 0:
├── NEED: Workflow automation (Layer 5)
├── SOLUTION: Create first skill from repeated pattern
└── URGENCY: LOW

IF team_adoption < 50%:
├── NEED: UX improvements
├── SOLUTION: Per-user optimization
└── URGENCY: LOW (during Stabilize)

IF cross_domain_synthesis < 5/week:
├── NEED: More connection discovery
├── SOLUTION: Active connection questioning
└── URGENCY: LOW
```

---

## SELF-DIAGNOSIS PROMPTS

### Run At Session Start

```
PERCEIVE DIAGNOSTIC (5 questions):

1. "What data has gone stale since last session?"
   └── Check seed-state.json data_freshness

2. "What questions are overdue?"
   └── Check question_queue age

3. "What patterns have repeated that should become rules?"
   └── Check for 3+ occurrences

4. "What's the current system health score?"
   └── Calculate from components

5. "What's blocking the highest-priority expansion?"
   └── Check expansion_inhibitors[0]
```

### Run At Session End

```
REFLECT DIAGNOSTIC (5 questions):

1. "What did I learn this session?"
   └── Capture explicitly

2. "What connections did I discover?"
   └── Add to connection_graph

3. "What questions were answered?"
   └── Update question_queue

4. "What questions emerged?"
   └── Add to question_queue

5. "How could this session have been better?"
   └── Log in improvement_log
```

### Run Weekly

```
DEEP DIAGNOSTIC (10 questions):

1. "Which rules haven't been triggered?"
2. "Which predictions were validated/invalidated?"
3. "Which recommendations were followed/rejected?"
4. "What knowledge is missing?"
5. "What's the freshest and stalest data?"
6. "What domains aren't connecting?"
7. "What questions keep recurring?"
8. "What's the expansion velocity?"
9. "What inhibitors were removed?"
10. "Is the system health improving or declining?"
```

---

## OUTPUT: THE NEEDS LIST

```
SUPERMIND NEEDS — [DATE]

CRITICAL (Blocks survival):
└── [List with solutions and owners]

HIGH (Blocks CM optimization):
└── [List with solutions and owners]

MEDIUM (Blocks system improvement):
└── [List with solutions and owners]

LOW (Blocks expansion):
└── [List with solutions and owners]

NEXT ACTION:
└── [Single most important thing to do right now]
```

---

## INTEGRATION WITH SEED LOOP

```
SELF-DIAGNOSIS → SEED LOOP MAPPING:

1. Data Staleness Detection → PERCEIVE phase
2. Gap Detection → QUESTION phase
3. Connection Detection → CONNECT phase
4. Needs Prioritization → EXPAND phase
5. Improvement Identification → IMPROVE phase

The self-diagnosis IS the SEED loop's nervous system.
It senses what needs attention.
Without sensing, no improvement.
With sensing, continuous evolution.
```

---

*The Supermind that knows what it needs becomes what it needs to become.*
