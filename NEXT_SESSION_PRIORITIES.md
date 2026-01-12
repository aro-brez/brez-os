# NEXT SESSION - BREZ Supermind

## DONE THIS SESSION
- [x] Auth flow with Google + org chart user ID (60+ members)
- [x] Role-based THE ONE THING with steps
- [x] All pages restored (financials, growth, tasks, etc.)
- [x] Shopify integration (revenue, orders, subs, CAC)
- [x] QuickBooks integration (cash, AP/AR, runway)
- [x] Unified metrics layer
- [x] Dynamic ONE THING based on actual metrics
- [x] API endpoint: /api/metrics?department=X
- [x] Priority logic: Cash critical > AP > CM > Dept actions

## NEXT SESSION MUST-DO

### 1. Connect Dashboard to Live API
Update page.tsx to call /api/metrics instead of hardcoded data

### 2. Add OAuth Flows
- Shopify OAuth for access token
- QuickBooks OAuth for access token
- Store tokens securely (encrypted in DB or env)

### 3. Data Freshness UI
Show on every metric:
- "Last updated: 2 min ago"
- "Source: Shopify"
- Green/yellow/red freshness indicator

### 4. Environment Variables Needed
```
SHOPIFY_SHOP_DOMAIN=drinkbrez.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
QUICKBOOKS_ACCESS_TOKEN=xxxxx
QUICKBOOKS_REALM_ID=xxxxx
```

### 5. Always Learning Layer
- Log every action taken
- Track outcomes vs predictions
- Update confidence scores

## KEY INSIGHT FROM AARON
"I need direct step by step guidance that is best in class"
"Pocket super genius - clarity, accuracy, infallibility, simplicity"
"Real-time responsive, always learning, always sourcing new data"

## FILES CREATED
- /src/lib/integrations/shopify.ts
- /src/lib/integrations/quickbooks.ts
- /src/lib/integrations/unified.ts
- /src/app/api/metrics/route.ts

## DEPLOYED
https://brez-growth-generator.vercel.app
