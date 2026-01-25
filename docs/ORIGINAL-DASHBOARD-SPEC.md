You are a senior full-stack + data engineer. Build a new project called:

BREZ Momentum Dashboard

MISSION
Create a simple internal dashboard that updates near real-time (hourly where possible, daily minimum) and answers every day:
1) “How much should we spend today on DTC?”
2) “Should we expand retail doors today (and where), or pause?”
3) “What are the top levers to focus on today to improve CAC and/or LTV?”
4) “Is Net Subscriber Growth truly our North Star (validated by data vs revenue)?”

OPERATING DOCTRINE (DO NOT DEVIATE)
North Star: Net positive subscribers + profitable doors only + disciplined capital = durable momentum.

Primary leading indicator: NET SUBSCRIBER CHANGE.
- Net subs = gross subs added − subs churned
- Gross subs added = new customers × subscription take rate
- Subs churned = cancellations/events-based (preferred) OR active subs × churn rate

Spend permission rule:
- If CAC is LTV-profitable (cohort-adjusted gross profit LTV), spending is allowed.
- Even if CAC is temporarily above ideal, if still LTV-profitable it’s usually better to spend than allow momentum decay.
Throttle:
- Working capital (cash/AP timing + Clearco/Wayflyer remits + obligations) sets spend ceilings.

Retail gate:
- Do NOT expand doors unless they are inherently profitable per door (or fast payback), OR demand is fully realized and distribution is the bottleneck.
- No vanity expansion.

RULES OF ENGAGEMENT (ENCODE THESE INTO THE RECOMMENDATION ENGINE)
1) Subscriber Momentum First: avoid sustained net subscriber decline if CAC is LTV-profitable.
2) DTC Spend Permission: if CAC < LTV (cohort-adjusted gross profit), spend is allowed up to working capital guardrails.
3) Working Capital Throttle: cash/AP timing + Clearco/Wayflyer remits define spend ceiling.
4) Fix Before Freeze: if CAC rises, fix creative/CVR and churn/journey before turning off demand (unless CAC is LTV-negative).
5) No Vanity Expansion: no retail door expansion without proven profit-per-door or demand-capture constraint.
6) Debt Usage: reserve debt primarily for production/inventory smoothing. Don’t use debt to mask broken CAC↔LTV.
7) Single Source of Truth: dashboard = truth. No side spreadsheets.

SUCCESS CRITERIA (MVP)
- One dashboard that shows: Net subs (daily/weekly/monthly), CAC, LTV band, max allowable CAC (3/6/9m),
  LTV:CAC, payback, working capital snapshot, retail velocity trend, and “Today’s Recommendation”.
- Includes a Validation module answering: “Does net subs correlate to revenue change MoM?”
- Recommendation engine outputs:
  - DTC spend range for next 24 hours (min/target/max) + confidence
  - expected net subs impact at that spend
  - retail action (expand/pause/cap) with rationale
  - top 3 levers today
  - alerts when CAC becomes LTV-negative, churn spikes, or cash below minimum
- Runs with mocked data out of the box + supports real integrations via env vars.
- If integrations are missing, the system still functions via CSV upload.

DATA SOURCES (CONNECTORS + CSV FALLBACKS)
1) Shopify: orders, customers, refunds, discounts, products
2) Subscription platform (Recharge/Skio/etc.): active subs, cancellations, pauses, cohort retention
3) Ads: Meta + Google + TikTok: spend, campaigns, creatives
4) Email: Klaviyo (optional MVP)
5) Accounting: QuickBooks/NetSuite: cash + AP aging (CSV acceptable for MVP)
6) Loans: Clearco + Wayflyer: balances, remits, schedules (CSV acceptable for MVP)
7) Retail: velocity per SKU per door OR retail revenue by month (CSV acceptable for MVP)

CORE METRICS (MUST IMPLEMENT)
Subscribers / DTC:
- new_customers_daily
- subscription_take_rate (7/30-day)
- gross_subs_added_daily
- churned_subs_daily (event-based preferred)
- net_subs_daily/weekly/monthly
- active_subscribers
- cohort retention curves
- projected cohort GP LTV at 3/6/9 months (and optionally 12m) + confidence band (p25/p50/p75 if possible)
- CAC by channel + blended
- max_allowable_CAC_3m / 6m / 9m (with configurable safety buffer)
- LTV:CAC and payback period

Revenue:
- DTC revenue daily + MoM % change
- retail revenue OR retail velocity + MoM % change
- new vs returning revenue, AOV, conversion rate, refund rate (if available)

Retail:
- velocity units/store/week + trend OR retail revenue by month
- door count, new doors added
- profit per new door estimate (incremental GP − incremental costs)

Finance / Working Capital:
- cash snapshot
- obligations next 30/60/90 days (AP due + remits + production)
- working capital proxy
- spend cap = max(0, cash − cash_minimum − obligations_30d) (configurable)

VALIDATION LAYER (MUST IMPLEMENT)
Purpose: validate/quantify if net subs is the North Star by showing correlation to revenue growth.
Compute + visualize:
- MoM % change series: net subs %, DTC revenue %, retail revenue/velocity %
- correlation (Pearson) between net subs % and DTC revenue %; and net subs % and retail revenue/velocity %
- lag correlations: net subs leading revenue by 1–3 months
- simple regression: revenue_mom% ~ a + b * net_subs_mom% (with lag selector), display R²
- charts: time-series overlay + scatter with trendline

SCENARIO LAYER (MUST IMPLEMENT)
- Max allowable CAC at 3/6/9 months:
  - MaxCAC_h = LTV_h × (1 − safety_buffer)
- Spend needed for subscriber neutrality:
  - neutrality_spend = (subs_churn_per_day ÷ take_rate) × CAC
- Spend needed for net positive:
  - growth_spend = neutrality_spend + growth_delta (config)
- Stress tests:
  - CAC +25% and +50% while still profitable (show momentum effect)
- Monthly allocation:
  - for each month: spend_cap_month based on working capital + obligations
  - recommend max feasible spend each month if LTV-profitable to reduce decline/reverse momentum

DECISION ENGINE (RULE-BASED MVP)
Compute:
- churn_per_day = cancellations/day OR active_subs × churn_rate/day
- profitability_checks = (LTV_3m − CAC) > 0, (LTV_6m − CAC) > 0, (LTV_9m − CAC) > 0 (return confidence tier)
- spend_needed_for_neutrality = (churn_per_day ÷ take_rate) × CAC
- spend_cap = max(0, cash − cash_minimum − obligations_30d) × risk_haircut
- expected_net_subs(spend) = (spend ÷ CAC × take_rate) − churn_per_day

Recommend:
IF profitability_check is FALSE at 6m (or configurable horizon):
  - recommend reducing spend to a minimal testing budget
  - output “Fix levers first” and list: creative/CVR vs churn/journey, based on which is deteriorating
IF profitability_check is TRUE:
  - target_spend = min(spend_needed_for_neutrality, spend_cap)
  - spend_range = [0.7×target, target, min(1.3×target, spend_cap)]
  - show expected net subs at each level
Retail:
  - if profit_per_new_door positive OR demand-constrained flag: allow expansion with cap
  - else recommend pause/slow and reallocate to DTC
Also: include a “Will DTC fix retail?” widget that references the Validation Layer results.

DASHBOARD PAGES (SHIP THESE)
1) Executive Overview (Daily)
  - Today’s Recommendation (spend + retail + levers + confidence)
  - Net subs trend + active subs
  - CAC today vs 7/30-day avg + max allowable CAC (3/6/9m)
  - LTV band + payback
  - Working capital snapshot + obligations_30d
  - Validation summary (corr + lag best fit)
2) Momentum Validation
  - time-series: net subs% vs DTC rev% and retail rev/velocity%
  - scatter + regression + R²
  - lag selector (0–3 months)
3) Subscriber Health
4) DTC Performance
5) Retail Velocity
6) Capital & AP
7) Scenario Sandbox (max CAC 3/6/9m + neutrality + monthly spend caps)

TECH STACK
- Frontend: Next.js + Tailwind
- Backend: FastAPI
- DB: Postgres
- ETL: scheduled jobs (cron)
- Local dev: docker-compose (postgres + api + web)
- Mock data generator required

ENGINEERING REQUIREMENTS
- Provide docker-compose with 3 services: postgres, api, web
- Provide .env.example with all required keys
- Build mock data generator so the app works immediately without credentials
- Provide CSV upload endpoints + UI where needed
- Write a README with setup + how to add integrations
- Add unit tests for recommendation engine + at least one ETL job

DELIVERY STANDARD
Build end-to-end runnable locally. Don’t stop at a plan; implement the project.
If you need missing integration details, proceed with mocks + adapters and document required env vars.
