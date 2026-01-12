"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Target,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Users,
  Keyboard,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui";

const guides = [
  {
    id: "weekly-workflow",
    title: "Weekly Workflow",
    icon: <Zap className="w-5 h-5" />,
    sections: [
      {
        title: "How We Use BRĒZ AI Weekly",
        content: `This is our recommended weekly operating rhythm using BRĒZ AI:

**MONDAY: Weekly Kickoff**
• Check Command Center for top priorities and AI recommendations
• Review any at-risk goals and overdue tasks
• Update the weekly cash snapshot in Financials
• Post weekly focus message in your department channel

**TUESDAY-THURSDAY: Execution Mode**
• Start each day from Command Center - check "Next Best Action"
• Use channels for quick updates and decisions
• Move tasks through the board as you complete them
• Run Growth Generator simulations for any new scenarios

**FRIDAY: Review & Plan**
• Review all completed tasks and goal progress
• Run a financial simulation for next week
• Document key decisions in department huddles
• Identify blockers to discuss Monday

**WEEKLY MUST-DOS:**
1. Update cash position in Financials (minimum weekly)
2. Review and update goal status indicators
3. Clear any overdue tasks (complete, reschedule, or delegate)
4. Post at least one meaningful update in your channel`,
      },
      {
        title: "Command Center Daily Flow",
        content: `The Command Center is your cockpit. Here's how to use it effectively:

**Morning (5 min)**
1. Check the AI Insight banner for system-wide alerts
2. Review "Top Priorities Today" - these are AI-sorted by urgency
3. Click into your first task and start working

**Midday (2 min)**
1. Mark completed tasks as done
2. Check for any new @ mentions in channels

**End of Day (3 min)**
1. Update in-progress tasks with notes if needed
2. Glance at tomorrow's priorities
3. Post a quick status update if working on something major`,
      },
      {
        title: "Monthly Rituals",
        content: `**First Week of Month**
• Update all goal metrics with actuals
• Review last month's decisions and their outcomes
• Run Growth Generator with updated assumptions

**Monthly Planning Meeting**
• Use the 2026 Plan page to review phase progress
• Check Growth Generator recommendations
• Document decisions in huddle notes

**Month End**
• Archive completed goals
• Export financial data for reporting
• Review what the AI recommended vs what actually happened`,
      },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Sparkles className="w-5 h-5" />,
    sections: [
      {
        title: "What is BRĒZ AI?",
        content: `BRĒZ AI is your team's command center for growth operations. It combines:

• **Communication** - Slack-like channels for team discussions
• **Task Management** - Asana-like tasks and goals tracking
• **Financial Tools** - Cash flow monitoring and growth simulation
• **AI Insights** - Automated prioritization and recommendations

In DEV MODE, all data is stored locally in your browser. No external services are required.`,
      },
      {
        title: "Key Concepts",
        content: `**Channels** - Department-based communication (Growth, Retail, Finance, etc.)

**Goals** - Quarterly/monthly objectives with metrics and owners

**Tasks** - Individual work items linked to goals

**Priorities** - AI-generated daily focus areas based on urgency and impact

**Next Best Action** - The single most important thing to do right now`,
      },
    ],
  },
  {
    id: "command-center",
    title: "Command Center",
    icon: <Zap className="w-5 h-5" />,
    sections: [
      {
        title: "Overview",
        content: `The Command Center is your daily home base. It shows:

• **Next Best Action** - Your top priority right now
• **Top Priorities Today** - AI-ranked tasks based on urgency, due dates, and goal impact
• **Questions to Answer** - Open items that need decisions
• **Quick Stats** - At-a-glance metrics
• **Cash Position** - Latest financial snapshot`,
      },
      {
        title: "How AI Prioritization Works (V1)",
        content: `The current prioritization uses rules-based logic:

1. **Urgency Scoring**: Tasks are scored by priority level (urgent > high > medium > low)
2. **Due Date Weighting**: Overdue tasks get highest priority, followed by due-today, due-this-week
3. **Goal Impact**: Tasks linked to high-impact goals get boosted
4. **Status**: In-progress tasks get slight preference to encourage completion

V2 will add Claude AI integration for intelligent context-aware prioritization.`,
      },
    ],
  },
  {
    id: "channels",
    title: "Channels",
    icon: <MessageSquare className="w-5 h-5" />,
    sections: [
      {
        title: "Department Channels",
        content: `Each department has its own channel:

• **Growth** - DTC, marketing, customer acquisition
• **Retail** - Partnerships, distribution, velocity
• **Finance** - Cash flow, budgets, P&L
• **Operations** - Supply chain, fulfillment
• **Product** - Development, innovation
• **CX** - Customer support, feedback
• **Creative** - Brand, design, content
• **Executive** - Leadership, strategy`,
      },
      {
        title: "Channel Features",
        content: `**Messages** - Post updates, questions, decisions
**Threads** - Reply to messages to keep discussions organized
**Reactions** - Quick acknowledgment with emojis
**@Mentions** - Tag team members
**Channel Sidebar** - See related goals, tasks, and Next Best Action

All channels are public - no DMs. This ensures transparency and knowledge sharing.`,
      },
      {
        title: "Huddles",
        content: `Huddles are quick team syncs within a channel:

1. Click "Huddle" in any channel
2. Add participants
3. Take notes during the discussion
4. Optionally paste a transcript
5. Generate Summary, Decisions, and Action Items
6. Finalize to create tasks and post to channel

V2 will add real-time video/audio via Daily or LiveKit.`,
      },
    ],
  },
  {
    id: "goals-tasks",
    title: "Goals & Tasks",
    icon: <Target className="w-5 h-5" />,
    sections: [
      {
        title: "Goals",
        content: `Goals are high-level objectives:

• **Department** - Which team owns this goal
• **Owner** - Individual responsible
• **Due Date** - Target completion date
• **Impact Score** (1-10) - Business importance
• **Metric Target** - Quantifiable success criteria
• **Status** - On Track, At Risk, Behind, Completed`,
      },
      {
        title: "Tasks",
        content: `Tasks are individual work items:

• **Priority** - Urgent, High, Medium, Low
• **Due Date** - When it needs to be done
• **Owner** - Who's doing it
• **Department** - Organizational grouping
• **Linked Goal** - Connection to higher objective
• **Comments** - Discussion thread on the task

**Views:**
• Today - Due today or overdue
• This Week - Due this week (not today)
• Later - Future or no due date
• All - Everything not done`,
      },
    ],
  },
  {
    id: "growth-generator",
    title: "Growth Generator",
    icon: <TrendingUp className="w-5 h-5" />,
    sections: [
      {
        title: "Overview",
        content: `The Growth Generator is a 52-week financial simulation tool:

• **Actuals** - Your current business trajectory
• **Scenario** - What-if modeling with different inputs
• **GO/NO-GO** - Binary decision based on cash floor

Key metrics:
• Minimum Cash - Lowest point in the forecast
• Trough Week - When minimum cash occurs
• Suggested Loan Draw - Capital needed to stay above reserve`,
      },
      {
        title: "How It Works",
        content: `1. Set your initial conditions (cash on hand, reserve floor, etc.)
2. Configure DTC and Retail assumptions
3. Upload actual data via CSV for more accuracy
4. Toggle between Sell-Through and Sell-In modes
5. Compare Actuals vs Scenario to find the winning path

The simulation calculates weekly:
• Revenue (DTC + Retail)
• Costs (COGS, shipping, fixed)
• Marketing spend and CAC
• Subscription metrics
• Cash balance`,
      },
    ],
  },
  {
    id: "financials",
    title: "Financials",
    icon: <DollarSign className="w-5 h-5" />,
    sections: [
      {
        title: "Financial Snapshots",
        content: `Track your cash position over time:

• **Cash on Hand** - Current bank balance
• **AP Due (2wk)** - Accounts payable coming due
• **AR Expected (2wk)** - Receivables expected
• **Fixed Weekly Stack** - Operating expenses per week

The system calculates:
• **Net Cash Flow** - AR minus AP
• **Runway** - Weeks of cash remaining
• **Projected Cash** - Position after 2 weeks`,
      },
      {
        title: "Next Best Action Rules",
        content: `Financial alerts based on thresholds:

• **< 4 weeks runway** → Critical: Raise capital or cut costs
• **Negative net flow > $50K** → Warning: Review AP deferrals
• **Declining cash** → Warning: Accelerate AR collection
• **Healthy position** → Maintain trajectory`,
      },
    ],
  },
  {
    id: "customers",
    title: "Ask Our Customers",
    icon: <Users className="w-5 h-5" />,
    sections: [
      {
        title: "Overview",
        content: `Analyze customer feedback from reviews, support tickets, and surveys:

• **Import CSV** - Upload customer messages
• **Auto-Analysis** - Sentiment, themes, price mentions
• **Top Complaints** - Most common negative themes
• **Top Praises** - What customers love
• **Price Sensitivity** - Dollar amounts mentioned
• **Search** - Find relevant feedback`,
      },
      {
        title: "CSV Format",
        content: `Upload a CSV with these columns:

• content (or message/review) - The customer text
• rating - Optional 1-5 star rating
• source - review, support, survey, social
• platform - Amazon, Shopify, Zendesk, etc.
• customer_name - Optional
• date - When feedback was received

The system auto-detects sentiment and extracts themes.`,
      },
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard Shortcuts",
    icon: <Keyboard className="w-5 h-5" />,
    sections: [
      {
        title: "Global Shortcuts",
        content: `**⌘K** - Open AI Chat (coming in V2)
**⌘T** - Toggle Task Board
**⌘/** - Focus search
**Escape** - Close modals`,
      },
    ],
  },
];

export default function OperatorGuidePage() {
  const [activeGuide, setActiveGuide] = useState(guides[0].id);

  const currentGuide = guides.find((g) => g.id === activeGuide)!;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-[#0D0D2A] border-b lg:border-b-0 lg:border-r border-white/5 p-4 lg:min-h-screen">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#e3f98a]" />
              Operator Guide
            </h1>
            <p className="text-xs text-[#676986] mt-1">BRĒZ AI V1 Documentation</p>
          </div>

          <nav className="space-y-1">
            {guides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setActiveGuide(guide.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeGuide === guide.id
                    ? "bg-[#e3f98a]/10 text-[#e3f98a]"
                    : "text-[#a8a8a8] hover:bg-white/5 hover:text-white"
                }`}
              >
                {guide.icon}
                <span className="font-medium text-sm">{guide.title}</span>
                {activeGuide === guide.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-white/5">
            <Card className="bg-gradient-to-br from-[#8533fc]/20 to-[#65cdd8]/20 border-[#8533fc]/30">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[#ffce33]" />
                <span className="font-semibold text-white text-sm">V2 Preview</span>
              </div>
              <p className="text-xs text-[#a8a8a8]">
                Claude AI integration, OAuth connectors, real-time sync, and more coming soon.
              </p>
            </Card>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#e3f98a]/10 flex items-center justify-center text-[#e3f98a]">
                {currentGuide.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentGuide.title}</h2>
                <p className="text-sm text-[#676986]">
                  {currentGuide.sections.length} sections
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {currentGuide.sections.map((section, i) => (
                <Card key={i}>
                  <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {section.content.split("\n\n").map((para, j) => (
                      <p key={j} className="text-[#a8a8a8] whitespace-pre-wrap mb-3">
                        {para.split("**").map((part, k) =>
                          k % 2 === 1 ? (
                            <strong key={k} className="text-white font-medium">{part}</strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
