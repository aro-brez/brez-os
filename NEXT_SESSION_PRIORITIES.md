# NEXT SESSION PRIORITIES - BREZ Supermind App

## WHAT WAS BUILT
- Auth flow with Google login + org chart user identification (60+ team members)
- Role-based THE ONE THING with step-by-step guidance
- Comprehensive dashboard with Current Reality metrics + Simulated Future
- All pages restored: financials, growth, tasks, goals, insights, channels, customers, journey, plan, settings, operator, files

## WHAT NEEDS TO HAPPEN NEXT

### 1. REAL-TIME DATA INTEGRATIONS (Critical)
Connect to actual data sources so numbers are REAL, not placeholders:
- **Shopify** → Revenue, orders, subscriptions, AOV, conversion rate
- **QuickBooks** → Cash balance, AP/AR, runway calculation
- **Meta Ads** → Ad spend, CAC, ROAS by campaign
- **Google Analytics** → Traffic, conversion funnel
- **Retail CSV** → Velocity per door, door count

### 2. DATA FRESHNESS INDICATORS
Every metric must show:
- Last updated timestamp
- Data source (Shopify, QuickBooks, etc.)
- Confidence level (real-time vs. daily vs. stale)

### 3. DYNAMIC ONE THING
Currently static per role. Should be:
- Generated from actual bottleneck analysis
- Based on current metrics vs. targets
- Prioritized by impact on CM and cash

### 4. ALWAYS LEARNING
- Log every action taken
- Track outcomes vs. predictions
- Update recommendations based on what worked
- Self-improving measurement (see measurement-framework.md)

### 5. VALIDATION LAYER
- Every recommendation should show:
  - The data that informed it
  - The calculation/logic used
  - Expected impact with confidence interval
  - How we'll know if it worked

### 6. UI/UX POLISH
- Make it prettier and more intuitive
- Better fit on all screen sizes
- Faster, smoother interactions
- Clearer visual hierarchy

## KEY FILES
- `/src/app/page.tsx` - Main dashboard
- `/src/components/auth/AuthGate.tsx` - Auth flow
- `/src/lib/stores/userStore.ts` - User identification
- `/src/lib/ai/supermind.ts` - Role contexts, phases
- `/src/lib/data/source-of-truth.ts` - Business data

## THE VISION
"The team's pocket super genius - guiding daily with clarity, accuracy, infallibility, and simplicity"

Real-time responsive, always learning, always sourcing new data, providing step-by-step guidance validated by actual data.

## DEPLOYED AT
https://brez-growth-generator.vercel.app
