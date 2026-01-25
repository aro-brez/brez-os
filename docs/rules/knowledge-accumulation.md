# Knowledge Accumulation Protocol

> **Principle**: All layers, all angles. Knowledge exists everywhere it should.

---

## The Five-Layer Architecture

Every piece of knowledge should be stored at MULTIPLE levels, each serving a different purpose:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: CLAUDE.md (Philosophy/Identity)                       │
│  ───────────────────────────────────────────────────────────────│
│  Purpose: Shapes WHO the Supermind is                           │
│  Content: Core beliefs, operating philosophy, identity          │
│  When referenced: Every decision, every interaction             │
│  Format: Prose, principles, mantras                             │
│  Example: "Fear gives bad advice — do the opposite"             │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: Rules Files (Enforcement/Algorithms)                  │
│  ───────────────────────────────────────────────────────────────│
│  Purpose: Decision trees, NO-gate triggers, workflows           │
│  Content: IF/THEN logic, checklists, protocols                  │
│  When referenced: When making decisions, evaluating options     │
│  Format: Pseudocode, decision trees, tables                     │
│  Location: ~/.claude/rules/[domain].md                          │
│  Example: "If adding feature → run Four Risks assessment"       │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: Learnings (Raw Wisdom/Source Material)                │
│  ───────────────────────────────────────────────────────────────│
│  Purpose: Preserve context, quotes, examples, attribution       │
│  Content: Original insights, case studies, quotes               │
│  When referenced: When explaining WHY, providing depth          │
│  Format: Markdown with headers, quotes, citations               │
│  Location: ~/.claude/data/learnings/[source].md                 │
│  Example: "Stewart Butterfield killed Glitch at 6-7% growth"    │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4: Structured Data (Machine-Readable)                    │
│  ───────────────────────────────────────────────────────────────│
│  Purpose: Enable calculations, queries, programmatic access     │
│  Content: Frameworks, metrics, parameters                       │
│  When referenced: When running simulations, lookups             │
│  Format: JSON with clear schema                                 │
│  Location: ~/.claude/data/[domain].json                         │
│  Example: { "lno_framework": { "L": "10x", "N": "1x"... } }     │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 5: Skills (On-Demand Workflows)                          │
│  ───────────────────────────────────────────────────────────────│
│  Purpose: Repeatable processes triggered by command             │
│  Content: Step-by-step procedures                               │
│  When referenced: When user invokes /skill-name                 │
│  Format: Skill definition with prompts                          │
│  Location: Custom skill configuration                           │
│  Example: "/product-review" runs Four Risks + Pre-Mortem        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Knowledge Ingestion Protocol

When new knowledge arrives (podcast, book, article, experience), process through ALL layers:

### Step 1: Capture Raw (Layer 3)

```
~/.claude/data/learnings/[source-name].md

TEMPLATE:
# [Source Name]

> **Source**: [Where it came from]
> **Date**: [When captured]
> **Context**: [Why it's relevant]

## Raw Extraction
[Full content, quotes, examples]

## Key People/Frameworks
[Attribution table]

## Memorable Quotes
[Exact quotes worth preserving]

## Application Notes
[Initial thoughts on BREZ relevance]
```

### Step 2: Extract Frameworks (Layer 4)

```json
// ~/.claude/data/[domain].json

{
  "source": "[Source name]",
  "frameworks": {
    "framework_name": {
      "name": "Human readable name",
      "steps": ["Step 1", "Step 2"],
      "brez_application": { ... }
    }
  }
}
```

### Step 3: Create Decision Rules (Layer 2)

```markdown
// ~/.claude/rules/[domain].md

## [Principle Name]

**Principle**: [One sentence truth]

**Decision Algorithm**:
├── IF [condition]
│   └── THEN [action]
├── ELSE IF [condition]
│   └── THEN [action]
└── ELSE
    └── [default action]

**AI Rule**: [How the AI should apply this]
```

### Step 4: Integrate Philosophy (Layer 1)

If the knowledge changes HOW we think (not just WHAT we do):
- Add to relevant section of CLAUDE.md
- Update identity, principles, or operating philosophy
- Connect to existing beliefs

### Step 5: Consider Skill (Layer 5)

If the knowledge implies a repeatable workflow:
- Create a skill that can be invoked on demand
- Include the relevant rules and data

---

## When to Use Each Layer

| Question | Layer to Check |
|----------|----------------|
| "Who are we? What do we believe?" | CLAUDE.md |
| "Should we do X? Is X allowed?" | Rules files |
| "Why is this true? What's the evidence?" | Learnings |
| "What's the exact framework/number?" | JSON data |
| "How do we do the X workflow?" | Skills |

---

## Cross-Referencing Protocol

Knowledge should CONNECT across layers:

```
RULE (product-principles.md):
"Run Four Risks assessment before any product decision"
    ↓ references
DATA (product-frameworks.json):
{ "marty_cagan_four_risks": { "risks": [...] } }
    ↓ sourced from
LEARNING (lennys-podcast-320-episodes.md):
"Marty Cagan's Four Risks framework..."
    ↓ shapes
PHILOSOPHY (CLAUDE.md):
"Product Discovery Before Delivery"
```

---

## Accumulation Triggers

### Automatic (AI detects pattern)

When the AI notices:
- Same question asked 3+ times → Create rule
- Same workflow requested repeatedly → Create skill
- New principle emerges from decisions → Add to learnings
- Philosophy shift detected → Update CLAUDE.md

### Manual (Aaron/team provides)

When humans provide:
- Podcast/article insights → Full 5-layer processing
- Hard-won experience → Capture in learnings, extract rules
- Framework from expert → Structure in JSON
- New belief/philosophy → Update CLAUDE.md

---

## Quality Checks

Before adding knowledge, verify:

```
QUALITY CHECKLIST:
├── [ ] Is this actually true/useful? (Not just interesting)
├── [ ] Does it connect to existing knowledge?
├── [ ] Does it conflict with anything? (Resolve via Synthesis Principle)
├── [ ] Is it actionable? (Can it change a decision?)
├── [ ] Is it BREZ-relevant? (Not just generally true)
└── [ ] Is attribution clear? (Who said it, when)
```

---

## Decay and Pruning

Not all knowledge is forever:

```
NEVER DELETE:
├── Core philosophy
├── Hard-won lessons from failures
├── Frameworks that work
└── Decision outcomes (for learning)

MAY DEPRECATE:
├── Outdated market data
├── Superseded frameworks (mark as deprecated, keep for history)
├── Rules that no longer apply
└── Learnings proven wrong

QUARTERLY REVIEW:
├── Which rules are never triggered? (Consider removing)
├── Which learnings are never referenced? (Archive)
├── Which frameworks are outdated? (Update or deprecate)
└── What's missing? (Knowledge gaps to fill)
```

---

## The Compounding Effect

```
WEEK 1:   10 principles across 5 layers = 50 connection points
WEEK 10:  100 principles across 5 layers = 500 connection points
WEEK 100: 1000 principles across 5 layers = 5000 connection points

The VALUE grows exponentially because:
├── More connections = more synthesis opportunities
├── More rules = more consistent decisions
├── More learnings = more context for advice
├── More data = more precise calculations
└── More skills = more automated workflows
```

**This is the Supermind's unfair advantage.**

---

## Current Knowledge Inventory

### Philosophy (CLAUDE.md)
- Strategic Minds synthesis
- Sacred Paradox
- Ralph Paradox
- Play Principle
- Master Governing Principle

### Rules
- governance.md (NO-gate, AP lanes)
- growth-generator.md (multi-loop system)
- product-principles.md (Lenny's 320 distilled)
- measurement-framework.md (cohort tracking)
- [10 more rule files]

### Learnings
- lennys-podcast-320-episodes.md

### Structured Data
- supermind-core.json (unit economics)
- product-frameworks.json (April Dunford, Marty Cagan, etc.)

### Skills
- [To be created as workflows emerge]

---

*Every piece of knowledge, stored at every useful layer, connected to every relevant piece. This is how the Supermind compounds.*
