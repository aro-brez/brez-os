"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Zap,
  Clock,
  Check,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Circle,
  RefreshCw,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
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

// Role-specific THE ONE THING actions
const ROLE_ACTIONS: Record<Department, {
  action: string;
  why: string;
  steps: string[];
  metric: string;
  timeEstimate: string;
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
  },
};

export default function Dashboard() {
  const [user, setUser] = useState<BrezUser | null>(null);
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { celebrate } = useToast();
  const { toggle: toggleAI } = useAIAssistant();

  useEffect(() => {
    // Get current user
    const selectedUser = getSelectedUser();
    setUser(selectedUser);

    // Time-aware greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good morning", emoji: "" });
    else if (hour < 17) setGreeting({ text: "Good afternoon", emoji: "" });
    else if (hour < 21) setGreeting({ text: "Good evening", emoji: "" });
    else setGreeting({ text: "Burning midnight oil", emoji: "" });
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

      // Check if all steps are done
      if (newCompleted.length === roleAction.steps.length) {
        setIsComplete(true);
        celebrate("THE ONE THING complete! You're moving us forward.");
      }
    }
  };

  const handleReset = () => {
    setCompletedSteps([]);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
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
      </div>

      {/* THE ONE THING Card */}
      <Card className="mb-6 overflow-hidden border-2 border-[#e3f98a]/40 bg-gradient-to-br from-[#e3f98a]/10 via-[#0D0D2A] to-transparent">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#e3f98a] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0D0D2A]" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#e3f98a] uppercase tracking-wider">
                Your ONE Thing Today
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-[#8533fc]/20 text-[#8533fc] border-[#8533fc]/30">
                  {roleContext.displayName}
                </Badge>
                <span className="text-xs text-[#676986] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {roleAction.timeEstimate}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            {roleAction.action}
          </h2>

          {/* Why */}
          <p className="text-sm text-[#a8a8a8] mb-6 p-3 rounded-lg bg-white/5 border-l-2 border-[#e3f98a]">
            <strong className="text-[#e3f98a]">Why:</strong> {roleAction.why}
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-white uppercase tracking-wider">
              Step by Step:
            </p>
            {roleAction.steps.map((step, i) => {
              const isStepComplete = completedSteps.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleStepComplete(i)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                    isStepComplete
                      ? "bg-[#6BCB77]/20 border border-[#6BCB77]/30"
                      : "bg-white/5 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isStepComplete
                      ? "bg-[#6BCB77]"
                      : "bg-[#e3f98a]/20"
                  }`}>
                    {isStepComplete ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-[#e3f98a]">{i + 1}</span>
                    )}
                  </div>
                  <p className={`text-sm md:text-base ${
                    isStepComplete ? "text-[#6BCB77] line-through" : "text-white"
                  }`}>
                    {step}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#676986]">Progress</span>
              <span className="text-[#e3f98a] font-semibold">
                {completedSteps.length} / {roleAction.steps.length} steps
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e3f98a] to-[#6BCB77] transition-all duration-500"
                style={{ width: `${(completedSteps.length / roleAction.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          {isComplete ? (
            <div className="p-4 rounded-lg bg-[#6BCB77]/20 border border-[#6BCB77]/30 text-center">
              <CheckCircle className="w-8 h-8 text-[#6BCB77] mx-auto mb-2" />
              <p className="text-[#6BCB77] font-semibold mb-3">
                THE ONE THING Complete!
              </p>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Start Fresh Tomorrow
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={toggleAI}
              >
                <Sparkles className="w-4 h-4" />
                Ask Supermind for Help
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Your Daily Question */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Circle className="w-4 h-4 text-[#65cdd8]" />
            <span className="text-sm font-semibold text-white">Your Daily Question</span>
          </div>
          <p className="text-sm text-[#a8a8a8] italic">
            &ldquo;{roleContext.dailyQuestion}&rdquo;
          </p>
        </Card>

        {/* Growth Generator Focus */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-[#e3f98a]" />
            <span className="text-sm font-semibold text-white">Your Growth Focus</span>
          </div>
          <p className="text-sm text-[#a8a8a8]">
            Step {roleContext.growthGeneratorFocus}: <span className="text-[#e3f98a]">{growthStep.name}</span>
          </p>
        </Card>
      </div>

      {/* Current Phase */}
      <Card className="p-4 mb-6 border border-[#ffce33]/20 bg-[#ffce33]/5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#ffce33] uppercase tracking-wider">
              Current Phase
            </span>
            <p className="text-white font-bold">STABILIZE</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#676986]">Company Focus</span>
            <p className="text-sm text-[#a8a8a8]">Improve CM, Protect Cash</p>
          </div>
        </div>
      </Card>

      {/* Purpose Reminder */}
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

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#676986]">
          BREZ Supermind • Building a $200B company through conscious capitalism
        </p>
      </div>
    </div>
  );
}
