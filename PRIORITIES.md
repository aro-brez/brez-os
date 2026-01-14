# BREZ OS Priority Roadmap

## P0 - FOUNDATION (Do First - Nothing Else Works Without These)

### Data & Infrastructure
- [ ] **All data in the dashboard** - Connect Supabase, wire Shopify/QB, make data real
- [ ] **Clean up non-needed features** - Remove noise, focus the product
- [ ] **Perfect core features with realtime editing** - Hot reload, instant feedback loops
- [ ] **Working memory solution for Claude** - Solve context persistence across sessions

### Why P0?
You can't optimize what you can't see. You can't learn if data doesn't persist. Fix the foundation first.

---

## P1 - REVENUE ENGINE (Direct $ Impact)

### Metrics That Matter
- [ ] **Key metrics dashboard** - CAC targets, AOV, % subscribers of new customers, ad spend goals
- [ ] **Working capital monitoring** - Realtime cash position updates
- [ ] **High CM / CM$ decision making** - Contribution margin as the north star

### Customer Journey
- [ ] **Customer journey simplified and optimized** - Map the path, remove friction
- [ ] **Customer journey change log** - Track changes → measure impact on results over time

### Creative & Ads Pipeline
- [ ] **New creative production flow** - Streamlined asset creation
- [ ] **Social optimized + all creatives tested** - Systematic testing framework
- [ ] **Winners rotated into ads and scaled** - Automated graduation of winning creative

### Website
- [ ] **Website improvements** - Native or Claude Code, whichever is faster
- [ ] **Automated CRO testing flow** - Continuous optimization without manual work

---

## P2 - INTELLIGENCE LAYER (The "Super Genius" Brain)

### Learning Systems
- [ ] **Optimized Seed - forever learning loop** - Background process always improving
- [ ] **Effective modeling for evolving targets** - Know your customer as they change
- [ ] **Consistent learning to do it better** - Feedback loops on every action

### AI Infrastructure
- [ ] **AI Mirror for every employee** - Personal AI that knows their context
- [ ] **Separate collective intelligence layer** - Team brain that improves continuously
- [ ] **Information flow strategy** - Map viability and relational impact

---

## P3 - MOMENTUM & MEASUREMENT

### Growth Physics
- [ ] **Momentum measurement** - Track increase/drop in real-time
- [ ] **Identify key levers** - Know which areas to push to drive momentum
- [ ] **Realtime updates to plan** - CAC, AOV, subscriber %, spend goals - live

### Channel Integration
- [ ] **DTC + Retail message integration** - Unified story across channels
- [ ] **Lowest cost retail fixed costs** - Claim profit efficiently

---

## P4 - TEAM OPERATIONS

- [ ] **Team goals** - Aligned objectives
- [ ] **Product roadmap** - Clear vision of what's next
- [ ] **Tasks management** - (Already built - just needs polish)

---

## THE FOCUS FILTER

Every feature should answer YES to at least one:

1. **Does it increase momentum?** (Growth)
2. **Does it improve CM$?** (Profit)
3. **Does it make us learn faster?** (Intelligence)

If no → don't build it.

---

## IMMEDIATE NEXT ACTIONS (This Week)

### 1. Data Foundation (Day 1-2)
```
- Connect Supabase (schema exists)
- Wire Shopify API (endpoint exists)
- Make dashboard show REAL numbers
```

### 2. Kill the Noise (Day 2-3)
```
- Audit every page/feature
- Remove anything not in P0-P1
- Simplify navigation to essentials only
```

### 3. Key Metrics Live (Day 3-5)
```
- CAC (actual from ad spend / customers)
- AOV (from Shopify orders)
- Subscriber % (from Shopify subscriptions)
- Working capital (from QB)
```

### 4. Learning Loop MVP (Day 5-7)
```
- Store every action + outcome
- Surface patterns weekly
- Build the Seed that learns
```

---

## SUCCESS CRITERIA

**Foundation is done when:**
- Dashboard shows real data
- Data persists across sessions
- Claude remembers context

**Revenue engine works when:**
- Can see CAC/AOV/subscriber% updating live
- Creative winners auto-identified
- Website changes measured automatically

**Intelligence layer works when:**
- System gets smarter without manual input
- AI gives better recommendations over time
- Team decisions compound into collective knowledge

---

## WHAT TO CUT

Based on current codebase, consider removing/simplifying:
- Journey page (not implemented)
- Files page (stub only)
- Excess settings pages
- Any feature with "V2" or "not implemented" in the code

Focus beats features. Ship less, but ship it working.
