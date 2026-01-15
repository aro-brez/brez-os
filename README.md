# BREZ OS

> The company operating system that makes 60 people operate like 600.

**Also known as**: BREZ AI, BREZ Growth Generator (all the same app)

A Next.js 15 application that serves as BREZ's complete company operating system — combining AI-powered insights, team communication, task management, financial simulation, and the Growth Generator in one unified platform.

**GitHub**: https://github.com/aro-brez/brez-os

## Quick Start

```bash
# Clone the repository
git clone https://github.com/aro-brez/brez-os.git
cd brez-os

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - the app runs in **DEV MODE** by default (no external services required).

---

## Table of Contents

1. [Features](#features)
2. [Local Development](#local-development)
3. [Environment Variables](#environment-variables)
4. [Supabase Setup](#supabase-setup-optional)
5. [GitHub + Vercel Deployment](#github--vercel-deployment)
6. [Project Structure](#project-structure)
7. [Troubleshooting](#troubleshooting)

---

## Features

### Core Modules
- **Command Center** - AI-prioritized daily dashboard
- **Channels** - Team communication by department
- **Goals & Tasks** - OKR tracking with AI insights
- **Growth Generator** - 52-week financial simulation
- **Data Hub** - Connect and manage data sources
- **Customer Insights** - Analyze customer feedback

### Technical Features
- **DEV MODE** - Works 100% offline with localStorage
- **Health Endpoint** - `/api/health` for monitoring
- **Supabase Ready** - Optional cloud sync when configured
- **Google OAuth** - Team authentication (optional)

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/aro-brez/brez-os.git
cd brez-os

# 2. Install dependencies
npm install

# 3. Copy environment file (optional)
cp .env.example .env.local

# 4. Start dev server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### DEV MODE

By default, the app runs in **DEV MODE**:
- All data stored in browser localStorage
- No Supabase or external services required
- Demo data pre-loaded
- Reset via Settings > Data > Reset Demo Data

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure as needed.

### Required for Production
None! The app works in DEV MODE with zero configuration.

### Optional - Enables Features

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ENVIRONMENT` | No | `development`, `staging`, or `production` |
| `ALLOWED_EMAIL_DOMAINS` | No | Comma-separated domains for access (e.g., `drinkbrez.com`) |

### Optional - Supabase (Cloud Sync)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-only) |

### Optional - Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `NEXTAUTH_SECRET` | No | Session encryption secret |
| `NEXTAUTH_URL` | No | App base URL |

### Optional - AI Features

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Claude AI API key |

---

## Supabase Setup (Optional)

Supabase enables cloud sync, real-time updates, and team authentication.

### 1. Create Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Name it `brez-ai` and set a database password
4. Wait for project to initialize (~2 minutes)

### 2. Get Credentials
1. Go to Settings > API
2. Copy these values to `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Migrations
1. Go to SQL Editor in Supabase Dashboard
2. Open `sql/001_initial_schema.sql` from this repo
3. Paste and run
4. Open `sql/002_rls_policies.sql`
5. Paste and run

### 4. Enable Google Auth (Optional)
1. Go to Authentication > Providers
2. Enable Google
3. Add your Google OAuth credentials
4. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

---

## GitHub + Vercel Deployment

### Step 1: Initialize Git Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: BRĒZ AI V1"
```

### Step 2: Push to GitHub

```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/aro-brez/brez-os.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and import `brez-growth-generator`
4. Configure:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `.` (leave as-is)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. Add Environment Variables:
   - For DEV MODE only: No variables needed!
   - For production: Add Supabase + Auth variables
6. Click **"Deploy"**
7. Wait ~2 minutes for build to complete

### Step 4: Verify Deployment

1. Click the deployment URL
2. Visit `/api/health` to verify
3. Check Settings > Deployment for status

---

## Environment Variables for Vercel

### Minimum (DEV MODE - works immediately)
No environment variables required.

### Recommended for Team Use
```
NEXT_PUBLIC_ENVIRONMENT=production
ALLOWED_EMAIL_DOMAINS=drinkbrez.com
```

### Full Production
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://your-app.vercel.app

# AI (optional)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Project Structure

```
brez-growth-generator/
├── data/
│   └── inputs.json          # Default simulation config
├── sql/
│   ├── 001_initial_schema.sql
│   └── 002_rls_policies.sql
├── src/
│   ├── app/
│   │   ├── api/health/      # Health check endpoint
│   │   ├── channels/        # Team communication
│   │   ├── goals/           # Goal tracking
│   │   ├── growth/          # Growth Generator
│   │   ├── insights/        # Customer insights
│   │   ├── operator/        # Documentation
│   │   ├── plan/            # 2026 Plan
│   │   ├── settings/        # Configuration
│   │   └── tasks/           # Task management
│   ├── components/
│   │   ├── layout/          # AppShell, Sidebar
│   │   └── ui/              # Reusable components
│   └── lib/
│       ├── ai/brain.ts      # Central AI logic
│       ├── data/devStore.ts # DEV MODE storage
│       └── supabaseClient.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Troubleshooting

### Build Fails on Vercel
```
Error: Cannot find module...
```
**Solution**: Delete `.next` folder and redeploy, or check that all imports are correct.

### DEV MODE Not Working
**Solution**: Clear browser localStorage and refresh.
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Supabase Connection Failed
**Solution**:
1. Verify environment variables are set correctly
2. Check Supabase dashboard for any issues
3. Ensure RLS policies are applied

### "Module not found" Errors
**Solution**:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Health Endpoint Returns Error
**Solution**: Check for TypeScript errors with `npm run build`.

---

## Go-Live Checklist

Before going live with your team:

- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Visit `/api/health` - should return `{"ok": true, ...}`
- [ ] Check all pages load without errors
- [ ] Test Settings > Data > Reset Demo Data
- [ ] Verify Settings > Deployment shows correct environment
- [ ] (Optional) Configure Supabase for cloud sync
- [ ] (Optional) Set up Google OAuth for team login
- [ ] Share URL with team!

---

## Support

- **Documentation**: Visit `/operator` in the app
- **Issues**: [GitHub Issues](https://github.com/aro-brez/brez-os/issues)
- **Team**: #brez-ai channel in Slack

---

## Version

**V1.0** - DEV MODE
- Full offline functionality
- localStorage persistence
- Demo data included
- All core features working

**Coming in V2**
- Supabase real-time sync
- Google OAuth team login
- Claude AI integration
- External data connectors
