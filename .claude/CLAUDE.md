# BREZ OS

> **Also known as**: BREZ AI, BREZ Growth Generator (all the same app)

## Project Overview

BREZ OS is the company operating system — a Next.js 15 application that combines AI-powered insights, team communication, financial simulation (Growth Generator), and task management. Features beautiful aurora borealis UI and is designed to make 60 people operate like 600.

**GitHub**: https://github.com/aro-brez/brez-growth-generator

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **AI**: Claude API (Anthropic SDK)
- **Auth**: NextAuth.js + Google OAuth
- **Database**: Supabase (PostgreSQL)

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth routes
│   │   ├── chat/                 # Claude AI chat
│   │   └── tasks/                # Task management
│   ├── auth/                     # Auth pages
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── ai/                       # ChatWidget, InsightsPanel
│   ├── effects/                  # AuroraBackground
│   ├── guided/                   # OnboardingWizard
│   ├── tasks/                    # TaskBoard
│   └── providers/                # AuthProvider
└── lib/
    ├── simulate.ts               # Financial simulation engine
    ├── insights-engine.ts        # AI insights generation
    ├── types.ts                  # TypeScript interfaces
    └── supabase/                 # Database clients
```

## Common Commands
- `npm run dev` - Start development server (usually port 3000/3001)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Code Style
- TypeScript strict mode
- 2-space indentation
- Functional React components
- Tailwind for styling (dark theme: #0D0D2A, lime accent: #e3f98a)
- Framer Motion for animations
- Use `btn-satisfying` class for interactive buttons

## Key Features
1. **Aurora Background**: Ethereal animated background in AuroraBackground.tsx
2. **AI Chat**: Claude-powered chat widget with quick prompts
3. **Insights Panel**: Auto-generated business insights
4. **Task Board**: Team collaboration with celebrations
5. **Onboarding**: 5-step wizard with achievement system

## Keyboard Shortcuts
- `⌘K` - Toggle AI chat
- `⌘T` - Toggle task board
- Arrow keys - Navigate onboarding

## Environment Variables Required
- `ANTHROPIC_API_KEY` - Claude API
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `NEXTAUTH_SECRET` - Session encryption
- `NEXTAUTH_URL` - Base URL

## Brand Colors
- Background: #0D0D2A (dark navy)
- Primary accent: #e3f98a (lime)
- Secondary: #65cdd8 (teal)
- Purple: #8533fc
- Success: #6BCB77
- Warning: #ffce33
- Danger: #ff6b6b
