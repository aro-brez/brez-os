"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Zap,
  Clock,
  Check,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Target,
  Users,
  BarChart3,
  Settings,
  ListTodo,
  Flag,
  Lightbulb,
  Map,
  ChevronRight,
  Play,
  Shield,
} from "lucide-react";
import { Card, Badge, Button, ProgressBar } from "@/components/ui";
import { BrezLogo } from "@/components/ui/BrezLogo";
import { useToast } from "@/components/ui/Toast";
import { useAIAssistant } from "@/components/ui/AIAssistant";
import {
  getSelectedUser,
  getUserRoleContext,
  type BrezUser,
} from "@/lib/stores/userStore";
import {
  GROWTH_GENERATOR_STEPS,
  SACRED_PARADOX,
  type Department,
} from "@/lib/ai/supermind";

// ============ CURRENT REALITY DATA ============
const CURRENT_REALITY = {
  cash: {
    onHand: 420000,
    runway: 6,
    floor: 300000,
    status: "watch" as const,
  },
  revenue: {
    monthly: 3100000,
    dtc: 1860000, // 60%
    retail: 1240000, // 40%
    trend: "+4%",
  },
  contributionMargin: {
    dtc: 0.32,
    retail: 0.30,
    blended: 0.31,
    target: 0.35,
  },
  ap: {
    total: 8200000,
    critical: 2100000,
    onPlan: 4500000,
    unresolved: 1600000,
    stopShipRisks: 2,
  },
  cac: {
    current: 58,
    target: 55,
    paybackMonths: 4.2,
  },
  subscribers: 14200,
  velocity: {
    doorsActive: 3200,
    unitsPerDoorWeek: 2.1,
  },
};

// ============ SIMULATED FUTURE (IF EXECUTED) ============
const SIMULATED_FUTURE = {
  week4: {
    cash: 520000,
    runway: 8,
    cm: 0.34,
    apReduced: 400000,
  },
  week8: {
    cash: 680000,
    runway: 10,
    cm: 0.36,
    apReduced: 900000,
    thriveUnlocked: true,
  },
  assumptions: [
    "Execute ONE THING daily across all roles",
    "CAC stays below $55 ceiling",
    "Retail velocity maintains 2.0+ units/door/week",
    "No new AP created during Stabilize",
  ],
};

// ============ ROLE-SPECIFIC ACTIONS ============
const ROLE_ACTIONS: Record<Department, {
  action: string;
  why: string;
  steps: string[];
  metric: string;
  timeEstimate: string;
  impact: string;
}> = {
  exec: {
    action: "Review cash position and make one AP decision",
    why: "Cash is the #1 bottleneck. Every day without a decision costs us optionality.",
    steps: [
      "Open QuickBooks and note exact cash balance",
      "Review AP aging - identify the highest-priority vendor",
      "Decide: Pay now, negotiate payment plan, or convert to equity",
      "Document the decision and communicate to Dan/Abla",
    ],
    metric: "AP decision logged",
    timeEstimate: "30 min",
    impact: "+$50k cash clarity",
  },
  growth: {
    action: "Find one way to improve conversion without increasing spend",
    why: "Every 0.1% conversion improvement = more cash without more risk.",
    steps: [
      "Check yesterday's conversion rate vs. 7-day average",
      "Review the top-performing ad creative - what's working?",
      "Identify one landing page element to test",
      "Set up the A/B test or make the change",
    ],
    metric: "Conversion rate improvement",
    timeEstimate: "45 min",
    impact: "+0.1% CVR = +$15k/mo",
  },
  retail: {
    action: "Identify your highest-margin account and ensure they're stocked",
    why: "Retail CM is 30% - the most profitable channel. Don't let shelves go empty.",
    steps: [
      "Pull your account list sorted by contribution margin",
      "Check inventory status at top 3 accounts",
      "If low inventory: place reorder or escalate to ops",
      "Log any at-risk accounts in the system",
    ],
    metric: "Top accounts stocked",
    timeEstimate: "30 min",
    impact: "Protects $40k/mo revenue",
  },
  finance: {
    action: "Update the cash forecast and flag any risks",
    why: "We can't make good decisions with stale data. Cash clarity = survival.",
    steps: [
      "Pull current bank balance",
      "Update this week's expected inflows/outflows",
      "Calculate runway at current burn",
      "Flag if runway drops below 6 weeks",
    ],
    metric: "Cash forecast updated",
    timeEstimate: "20 min",
    impact: "Enables $100k decisions",
  },
  ops: {
    action: "Find one way to reduce COGS or fulfillment cost",
    why: "Every dollar saved on operations is a dollar toward paying off AP.",
    steps: [
      "Review last week's fulfillment costs per order",
      "Identify highest-cost line item",
      "Research one alternative (supplier, process, packaging)",
      "Document potential savings and next steps",
    ],
    metric: "Cost reduction identified",
    timeEstimate: "45 min",
    impact: "-$0.05/unit = +$30k/yr",
  },
  product: {
    action: "Read 5 customer reviews and identify one product insight",
    why: "Validation = Flavor + Effect. Customer voice tells us if we're winning.",
    steps: [
      "Go to reviews (Amazon, website, or social)",
      "Read 5 recent reviews - note patterns",
      "Identify one actionable insight",
      "Share the insight with the team in Slack",
    ],
    metric: "Product insight shared",
    timeEstimate: "20 min",
    impact: "Drives retention +2%",
  },
  cx: {
    action: "Resolve your oldest open ticket and document the root cause",
    why: "Every unresolved ticket is a customer who might not come back.",
    steps: [
      "Sort tickets by age - oldest first",
      "Resolve the oldest ticket completely",
      "Document: What was the issue? What was the root cause?",
      "If it's a pattern, flag for the team",
    ],
    metric: "Ticket resolved + documented",
    timeEstimate: "30 min",
    impact: "Saves 1 customer = $200 LTV",
  },
  creative: {
    action: "Review yesterday's top ad and identify what made it work",
    why: "The best creative makes people FEEL what BREZ does. Learn from winners.",
    steps: [
      "Pull yesterday's ad performance data",
      "Identify the top-performing creative",
      "Analyze: Hook, message, visual - what worked?",
      "Document the pattern for future creative",
    ],
    metric: "Creative insight documented",
    timeEstimate: "30 min",
    impact: "-$5 CAC on next campaign",
  },
};

// ============ NAVIGATION MODULES ============
const MODULES = [
  { name: "Financials", href: "/financials", icon: DollarSign, description: "Cash, AP, runway tracking", color: "text-[#6BCB77]" },
  { name: "Growth Simulator", href: "/growth", icon: TrendingUp, description: "Model scenarios & CAC", color: "text-[#e3f98a]" },
  { name: "Tasks", href: "/tasks", icon: ListTodo, description: "Team action items", color: "text-[#65cdd8]" },
  { name: "Goals", href: "/goals", icon: Flag, description: "OKRs & milestones", color: "text-[#ffce33]" },
  { name: "Insights", href: "/insights", icon: Lightbulb, description: "AI-generated learnings", color: "text-[#8533fc]" },
  { name: "Channels", href: "/channels", icon: BarChart3, description: "DTC & Retail performance", color: "text-[#ff6b6b]" },
  { name: "Customers", href: "/customers", icon: Users, description: "Cohorts & retention", color: "text-[#65cdd8]" },
  { name: "Journey", href: "/journey", icon: Map, description: "Customer lifecycle", color: "text-[#e3f98a]" },
];

export default function CommandCenter() {
  const [user, setUser] = useState<BrezUser | null>(null);
  const [greeting, setGreeting] = useState({ text: "", time: "" });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const { celebrate } = useToast();
  const { toggle: toggleAI } = useAIAssistant();

  useEffect(() => {
    const selectedUser = getSelectedUser();
    setUser(selectedUser);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good morning", time: "morning" });
    else if (hour < 17) setGreeting({ text: "Good afternoon", time: "afternoon" });
    else if (hour < 21) setGreeting({ text: "Good evening", time: "evening" });
    else setGreeting({ text: "Burning midnight oil", time: "night" });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#e3f98a] animate-spin" />
      </div>
    );
  }

  const roleContext = getUserRoleContext(user.department);
  const roleAction = ROLE_ACTIONS[user.department];
  const growthStep = GROWTH_GENERATOR_STEPS[roleContext.growthGeneratorFocus - 1];

  const handleStepComplete = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepIndex));
    } else {
      const newCompleted = [...completedSteps, stepIndex];
      setCompletedSteps(newCompleted);
      if (newCompleted.length === roleAction.steps.length) {
        celebrate("THE ONE THING complete! You're moving us toward Thrive.");
      }
    }
  };

  const cashStatus = CURRENT_REALITY.cash.onHand > 500000 ? "healthy" :
                     CURRENT_REALITY.cash.onHand > 300000 ? "watch" : "critical";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrezLogo variant="icon" size="lg" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {greeting.text}, {user.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-[#676986]">
                {user.title} • {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#ffce33]/20 text-[#ffce33] border-[#ffce33]/30">
              <Shield className="w-3 h-3 mr-1" />
              STABILIZE
            </Badge>
            <Button variant="secondary" size="sm" onClick={toggleAI}>
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Ask AI</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============ CURRENT REALITY - KEY METRICS ============ */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#676986] uppercase tracking-wider mb-3">
          Current Reality
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link href="/financials">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <DollarSign className={`w-4 h-4 ${cashStatus === 'healthy' ? 'text-[#6BCB77]' : cashStatus === 'watch' ? 'text-[#ffce33]' : 'text-[#ff6b6b]'}`} />
                <span className={`text-lg font-bold ${cashStatus === 'healthy' ? 'text-[#6BCB77]' : cashStatus === 'watch' ? 'text-[#ffce33]' : 'text-[#ff6b6b]'}`}>
                  ${(CURRENT_REALITY.cash.onHand / 1000).toFixed(0)}K
                </span>
              </div>
              <p className="text-xs text-[#676986]">Cash ({CURRENT_REALITY.cash.runway}wk)</p>
            </Card>
          </Link>

          <Link href="/financials">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className={`w-4 h-4 ${CURRENT_REALITY.ap.stopShipRisks > 0 ? 'text-[#ff6b6b]' : 'text-[#6BCB77]'}`} />
                <span className="text-lg font-bold text-white">
                  ${(CURRENT_REALITY.ap.total / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-xs text-[#676986]">AP ({CURRENT_REALITY.ap.stopShipRisks} risks)</p>
            </Card>
          </Link>

          <Link href="/channels">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="w-4 h-4 text-[#6BCB77]" />
                <span className="text-lg font-bold text-white">
                  ${(CURRENT_REALITY.revenue.monthly / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-xs text-[#676986]">Revenue/mo {CURRENT_REALITY.revenue.trend}</p>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <BarChart3 className={`w-4 h-4 ${CURRENT_REALITY.contributionMargin.blended >= CURRENT_REALITY.contributionMargin.target ? 'text-[#6BCB77]' : 'text-[#ffce33]'}`} />
                <span className="text-lg font-bold text-white">
                  {(CURRENT_REALITY.contributionMargin.blended * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-[#676986]">CM (target {(CURRENT_REALITY.contributionMargin.target * 100).toFixed(0)}%)</p>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <Target className={`w-4 h-4 ${CURRENT_REALITY.cac.current <= CURRENT_REALITY.cac.target ? 'text-[#6BCB77]' : 'text-[#ffce33]'}`} />
                <span className="text-lg font-bold text-white">
                  ${CURRENT_REALITY.cac.current}
                </span>
              </div>
              <p className="text-xs text-[#676986]">CAC (max ${CURRENT_REALITY.cac.target})</p>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <Users className="w-4 h-4 text-[#65cdd8]" />
                <span className="text-lg font-bold text-white">
                  {(CURRENT_REALITY.subscribers / 1000).toFixed(1)}K
                </span>
              </div>
              <p className="text-xs text-[#676986]">Subscribers</p>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============ LEFT COLUMN - THE ONE THING ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* YOUR ONE THING */}
          <Card className="overflow-hidden border-2 border-[#e3f98a]/40 bg-gradient-to-br from-[#e3f98a]/10 via-[#0D0D2A] to-transparent">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#e3f98a] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#0D0D2A]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#e3f98a] uppercase tracking-wider">
                      Your ONE Thing Today
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className="bg-[#8533fc]/20 text-[#8533fc] border-[#8533fc]/30 text-xs">
                        {roleContext.displayName}
                      </Badge>
                      <span className="text-xs text-[#676986]">
                        <Clock className="w-3 h-3 inline mr-1" />{roleAction.timeEstimate}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">
                  {roleAction.impact}
                </Badge>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                {roleAction.action}
              </h2>

              <p className="text-sm text-[#a8a8a8] mb-4 p-3 rounded-lg bg-white/5 border-l-2 border-[#e3f98a]">
                <strong className="text-[#e3f98a]">Why:</strong> {roleAction.why}
              </p>

              {/* Steps */}
              <div className="space-y-2 mb-4">
                {roleAction.steps.map((step, i) => {
                  const isComplete = completedSteps.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleStepComplete(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                        isComplete
                          ? "bg-[#6BCB77]/20 border border-[#6BCB77]/30"
                          : "bg-white/5 hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete ? "bg-[#6BCB77]" : "bg-[#e3f98a]/20"
                      }`}>
                        {isComplete ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-[#e3f98a]">{i + 1}</span>
                        )}
                      </div>
                      <p className={`text-sm ${isComplete ? "text-[#6BCB77] line-through" : "text-white"}`}>
                        {step}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#676986]">Progress</span>
                <span className="text-[#e3f98a] font-semibold">
                  {completedSteps.length} / {roleAction.steps.length}
                </span>
              </div>
              <ProgressBar
                value={completedSteps.length}
                max={roleAction.steps.length}
                variant={completedSteps.length === roleAction.steps.length ? "success" : "default"}
              />

              {completedSteps.length === roleAction.steps.length && (
                <div className="mt-4 p-3 rounded-lg bg-[#6BCB77]/20 border border-[#6BCB77]/30 text-center">
                  <CheckCircle className="w-6 h-6 text-[#6BCB77] mx-auto mb-1" />
                  <p className="text-[#6BCB77] font-semibold text-sm">Complete! You moved us forward today.</p>
                </div>
              )}
            </div>
          </Card>

          {/* SIMULATED FUTURE */}
          <Card className="border border-[#8533fc]/20">
            <div
              className="p-4 cursor-pointer"
              onClick={() => setShowSimulation(!showSimulation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#8533fc]" />
                  <h3 className="font-semibold text-white">Simulated Future</h3>
                  <Badge className="bg-[#8533fc]/20 text-[#8533fc] border-[#8533fc]/30 text-xs">
                    If we execute
                  </Badge>
                </div>
                <ChevronRight className={`w-5 h-5 text-[#676986] transition-transform ${showSimulation ? 'rotate-90' : ''}`} />
              </div>

              {showSimulation && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-[#676986] mb-1">Week 4</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white">Cash: <span className="text-[#6BCB77]">${(SIMULATED_FUTURE.week4.cash / 1000).toFixed(0)}K</span></p>
                        <p className="text-sm text-white">CM: <span className="text-[#6BCB77]">{(SIMULATED_FUTURE.week4.cm * 100).toFixed(0)}%</span></p>
                        <p className="text-sm text-white">AP Reduced: <span className="text-[#6BCB77]">-${(SIMULATED_FUTURE.week4.apReduced / 1000).toFixed(0)}K</span></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#6BCB77]/10 border border-[#6BCB77]/20">
                      <p className="text-xs text-[#6BCB77] mb-1">Week 8 - THRIVE UNLOCKED</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white">Cash: <span className="text-[#6BCB77]">${(SIMULATED_FUTURE.week8.cash / 1000).toFixed(0)}K</span></p>
                        <p className="text-sm text-white">CM: <span className="text-[#6BCB77]">{(SIMULATED_FUTURE.week8.cm * 100).toFixed(0)}%</span></p>
                        <p className="text-sm text-white">AP Reduced: <span className="text-[#6BCB77]">-${(SIMULATED_FUTURE.week8.apReduced / 1000).toFixed(0)}K</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#676986]">
                    <p className="font-semibold mb-1">Assumptions:</p>
                    <ul className="space-y-0.5">
                      {SIMULATED_FUTURE.assumptions.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* QUICK ACCESS MODULES */}
          <div>
            <h2 className="text-sm font-semibold text-[#676986] uppercase tracking-wider mb-3">
              Tools & Dashboards
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MODULES.map((module) => (
                <Link key={module.name} href={module.href}>
                  <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer h-full">
                    <module.icon className={`w-5 h-5 ${module.color} mb-2`} />
                    <p className="text-sm font-medium text-white">{module.name}</p>
                    <p className="text-xs text-[#676986]">{module.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ============ RIGHT COLUMN - CONTEXT ============ */}
        <div className="space-y-6">
          {/* PHASE STATUS */}
          <Card className="border-2 border-[#ffce33]/20 bg-gradient-to-br from-[#ffce33]/5 to-transparent">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#ffce33]" />
                <h3 className="font-semibold text-white">Phase: STABILIZE</h3>
              </div>
              <p className="text-xs text-[#a8a8a8] mb-4">
                Preserve cash, maximize CM, contain AP
              </p>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-white mb-2">Exit to THRIVE when:</p>
                <div className="flex items-center gap-2 text-[#676986]">
                  <Check className="w-3 h-3 text-[#6BCB77]" />
                  <span>AP under active management</span>
                </div>
                <div className="flex items-center gap-2 text-[#676986]">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" />
                  <span>Cash reserves &gt; $500k (4 weeks)</span>
                </div>
                <div className="flex items-center gap-2 text-[#676986]">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" />
                  <span>DTC CM &gt; 35%</span>
                </div>
                <div className="flex items-center gap-2 text-[#676986]">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" />
                  <span>+20% DTC at same spend</span>
                </div>
              </div>
            </div>
          </Card>

          {/* YOUR GROWTH GENERATOR FOCUS */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-[#e3f98a]" />
              <span className="text-sm font-semibold text-white">Your Growth Focus</span>
            </div>
            <p className="text-sm text-[#a8a8a8] mb-2">
              Step {roleContext.growthGeneratorFocus}: <span className="text-[#e3f98a] font-semibold">{growthStep.name}</span>
            </p>
            <p className="text-xs text-[#676986]">{growthStep.description}</p>
          </Card>

          {/* DAILY QUESTION */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#65cdd8]" />
              <span className="text-sm font-semibold text-white">Your Daily Question</span>
            </div>
            <p className="text-sm text-[#a8a8a8] italic">
              &ldquo;{roleContext.dailyQuestion}&rdquo;
            </p>
          </Card>

          {/* PURPOSE REMINDER */}
          <Card className="p-4 border border-[#8533fc]/20 bg-gradient-to-br from-[#8533fc]/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-[#8533fc]" />
              <span className="text-sm font-semibold text-white">Remember</span>
            </div>
            <p className="text-sm text-[#a8a8a8] italic mb-2">
              &ldquo;{roleContext.purposeReminder}&rdquo;
            </p>
            <p className="text-xs text-[#8533fc]">
              {SACRED_PARADOX.taoistPrinciples.wuWei}
            </p>
          </Card>

          {/* QUICK LINKS */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/tasks?new=true">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <ListTodo className="w-4 h-4 mr-2" /> Create Task
                </Button>
              </Link>
              <Link href="/goals">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Flag className="w-4 h-4 mr-2" /> View Goals
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#676986]">
          BREZ Supermind • Building a $200B company through conscious capitalism
        </p>
      </div>
    </div>
  );
}
