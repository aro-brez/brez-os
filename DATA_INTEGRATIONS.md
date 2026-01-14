# BREZ Data Integration Architecture

## THE CORE QUESTION

> "What is driving momentum? Are we curving up or down? What do we need to do to curve back up while creating profit?"

Everything below exists to answer this question.

---

## DATA SOURCES & WHAT THEY PROVIDE

### 1. META ADS (Priority: HIGH)
**Source:** Meta Business API
**Provides:**
- Ad spend (actual vs target)
- CAC (cost per acquisition)
- ROAS
- Spend pacing
- Creative performance

**Key Metric:** `Actual Spend / Target Spend` + `Actual CAC / Target CAC`

---

### 2. GOOGLE DRIVE - CASH FLOW (Priority: HIGH)
**Source:** Google Drive API → Spreadsheet
**Provides:**
- Working capital position
- Cash flow projections (not bank balance - EXPECTED flows)
- Runway calculations
- Loan tracking

**Key Metric:** `Projected Working Capital` (next 30/60/90 days)

**Note:** This needs to sync continuously, not one-time upload. Direct API connection to the spreadsheet.

---

### 3. RETAIL VELOCITY (Priority: HIGH)
**Source:** Crisp / VIP / Similar retail data platform
**Provides:**
- Number of doors (DYNAMIC)
- Units per store per week
- Velocity by retailer
- Distribution growth

**Key Metric:** `Doors × Velocity = Retail Revenue Run Rate`

---

### 4. SHOPIFY (Priority: HIGH)
**Source:** Shopify Admin API
**Provides:**
- Orders & revenue
- Conversion rate
- AOV (average order value)
- New customers vs returning
- Subscription data (% of new customers subscribing)

**Key Metrics:**
- `Conversion Rate`
- `AOV`
- `New Customer Subscriber %`

---

### 5. KLAVIYO (Priority: MEDIUM)
**Source:** Klaviyo API
**Provides:**
- Email revenue attribution
- List growth
- Flow performance
- Campaign ROI

**Key Metric:** `Email Revenue / Total Revenue` (channel mix)

---

### 6. OKENDO / REVIEWS (Priority: MEDIUM)
**Source:** Okendo API or Stay.io
**Provides:**
- Review velocity
- Average rating
- Sentiment trends
- UGC pipeline

**Key Metric:** `Review Volume × Rating = Social Proof Momentum`

---

### 7. AMAZON (Priority: MEDIUM-LOW)
**Source:** Amazon Seller Central API
**Provides:**
- Marketplace revenue
- Buy box %
- Organic rank
- Ad performance

---

### 8. TIKTOK ADS (Priority: LOW - Future)
**Source:** TikTok Marketing API
**Provides:**
- Spend & CAC
- Creative performance
- Audience insights

---

## THE CORRELATION MODEL

```
┌─────────────────────────────────────────────────────────────┐
│                    MOMENTUM = f(inputs)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Ad Spend ──────┐                                          │
│                  │                                          │
│   CAC Target ────┼──→ DTC Acquisition ──┐                   │
│                  │                       │                   │
│   Conversion ────┘                       │                   │
│                                          ├──→ MOMENTUM       │
│   # of Doors ───┐                        │     (↑ or ↓)      │
│                 ├──→ Retail Velocity ────┤                   │
│   Velocity ─────┘                        │                   │
│                                          │                   │
│   Working Capital ──────────────────────┘                   │
│        │                                                     │
│        └──→ Constrains all of the above                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## KEY DECISION METRICS

### The Dashboard Should Show:

| Metric | Source | Target | Actual | Status |
|--------|--------|--------|--------|--------|
| CAC | Meta Ads | $X | $Y | 🟢/🟡/🔴 |
| Ad Spend | Meta Ads | $X/day | $Y/day | Pacing % |
| AOV | Shopify | $X | $Y | vs target |
| Conversion Rate | Shopify | X% | Y% | trend |
| New Customer Sub % | Shopify | X% | Y% | trend |
| Retail Doors | Crisp/VIP | X | Y | growth |
| Working Capital | Drive | - | $X | runway days |

### The Questions It Answers:

1. **Should we raise CAC target?**
   - IF working capital healthy AND momentum up → YES
   - IF working capital tight OR momentum down → NO

2. **Should we increase spend?**
   - IF CAC < target AND working capital allows → YES
   - IF CAC > target → NO, optimize first

3. **What's constraining growth?**
   - Working capital? → Get loan or cut costs
   - CAC too high? → Creative/targeting issue
   - Conversion low? → Website/offer issue
   - Retail velocity flat? → Distribution or product issue

---

## IMPLEMENTATION STATUS

### Exists (Scaffolded)
- [x] Shopify connector (needs OAuth completion)
- [x] QuickBooks connector (needs OAuth completion)
- [x] Meta Ads connector (stub only)

### Needs to Be Built
- [ ] Google Drive API connection (cash flow spreadsheet)
- [ ] Crisp/VIP retail velocity connector
- [ ] Klaviyo connector
- [ ] Okendo/Stay.io connector
- [ ] Amazon connector
- [ ] Real-time sync scheduler

---

## DATA SYNC ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                    SYNC SCHEDULER                         │
│                  (runs every 15 min)                      │
└──────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ Meta    │      │ Shopify │      │ Drive   │
    │ Ads     │      │         │      │ (Cash)  │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
         └────────────────┼────────────────┘
                          ▼
              ┌───────────────────────┐
              │   UNIFIED METRICS     │
              │   (Supabase table)    │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   MOMENTUM ENGINE     │
              │   - Trend detection   │
              │   - Correlation calc  │
              │   - Recommendations   │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     DASHBOARD         │
              │   - Real-time view    │
              │   - Alerts            │
              │   - Decision support  │
              └───────────────────────┘
```

---

## DYNAMIC FIELDS

These must update automatically, not be static:

1. **Number of Doors** ← Retail velocity source
2. **Ad Spend** ← Meta Ads API
3. **CAC** ← Calculated from spend / new customers
4. **Working Capital** ← Google Drive spreadsheet
5. **Conversion Rate** ← Shopify
6. **AOV** ← Shopify

---

## WORKING CAPITAL LOGIC

**NOT:** What's in the bank today
**BUT:** Expected cash position based on:
- Current balance
- Expected revenue (from forecast)
- Expected costs (from forecast)
- Upcoming payments (AP)
- Expected collections (AR)
- Loan payments

```
Working Capital (Day N) =
    Current Balance
    + Σ(Expected Revenue, days 1-N)
    - Σ(Expected Costs, days 1-N)
    - Σ(Loan Payments, days 1-N)
```

---

## MOMENTUM CALCULATION

Simple model v1:

```
Momentum Score = weighted average of:
  - Revenue trend (30 day slope)     × 0.30
  - CAC efficiency (target/actual)   × 0.25
  - Conversion rate trend            × 0.20
  - Retail velocity trend            × 0.15
  - Working capital runway           × 0.10

Score > 0 = Curving UP
Score < 0 = Curving DOWN
```

The AI then correlates: "Which input changed most when momentum changed?"

---

## NEXT STEPS

### Phase 1: Core Connections (This Week)
1. Meta Ads API → Real spend/CAC data
2. Google Drive API → Cash flow spreadsheet sync
3. Shopify API → Orders, conversion, AOV

### Phase 2: Retail + Email (Next Week)
4. Crisp/VIP connection → Door count, velocity
5. Klaviyo API → Email attribution

### Phase 3: Intelligence
6. Momentum calculation engine
7. Correlation detection
8. Automated recommendations

---

## API CREDENTIALS NEEDED

| Service | What's Needed | Status |
|---------|--------------|--------|
| Meta Ads | App ID, App Secret, Access Token | ❌ |
| Google Drive | OAuth credentials, Sheet ID | ❌ |
| Shopify | API Key, Secret, Store URL | ✅ (partial) |
| Crisp/VIP | API Key | ❌ |
| Klaviyo | Private API Key | ❌ |
| Okendo | API Key | ❌ |
