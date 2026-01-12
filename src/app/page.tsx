"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Zap,
  Check,
  Heart,
  Sparkles,
  ArrowRight,
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
  Trophy,
  Flame,
  Wifi,
  WifiOff,
  Brain,
  PartyPopper,
  Gift,
  Rocket,
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
} from "@/lib/ai/supermind";
import type { UnifiedMetrics, DynamicAction } from "@/lib/integrations/unified";
import {
  runOptimization,
  calculateLevel,
  xpToNextLevel,
  ACHIEVEMENTS,
  type OptimizationResult,
  type UserProgress,
} from "@/lib/integrations/optimizer";

// ============ CELEBRATION MESSAGES ============
const CELEBRATIONS = [
  "You're a legend! 🌟",
  "That's what champions do! 💪",
  "Moving the needle! 📈",
  "The team thanks you! 🤝",
  "One step closer to Thrive! 🚀",
  "Contribution margin loves you! 💚",
  "Cash flow hero! 💰",
  "Making BREZ unstoppable! ⚡",
];

// ============ QUICK MODULES ============
const MODULES = [
  { name: "Financials", href: "/financials", icon: DollarSign, description: "Cash, AP, runway", color: "text-[#6BCB77]" },
  { name: "Growth", href: "/growth", icon: TrendingUp, description: "CAC & spend", color: "text-[#e3f98a]" },
  { name: "Tasks", href: "/tasks", icon: ListTodo, description: "Team actions", color: "text-[#65cdd8]" },
  { name: "Goals", href: "/goals", icon: Flag, description: "OKRs", color: "text-[#ffce33]" },
  { name: "Insights", href: "/insights", icon: Lightbulb, description: "AI learnings", color: "text-[#8533fc]" },
  { name: "Channels", href: "/channels", icon: BarChart3, description: "Performance", color: "text-[#ff6b6b]" },
  { name: "Customers", href: "/customers", icon: Users, description: "Retention", color: "text-[#65cdd8]" },
  { name: "Journey", href: "/journey", icon: Map, description: "Lifecycle", color: "text-[#e3f98a]" },
];

// Default fallback metrics (used when API unavailable)
const FALLBACK_METRICS: UnifiedMetrics = {
  cash: { balance: 420000, runway: 6, status: "watch", floor: 300000 },
  ap: { total: 8200000, critical: 2100000, stopShipRisks: 2 },
  revenue: { today: 103000, mtd: 2480000, monthlyRun: 3100000, trend: "+4%" },
  dtc: { orders: 2800, aov: 72, cac: 58, conversionRate: 2.8, contributionMargin: 0.32 },
  subscriptions: { active: 14200, newThisWeek: 340, churnRate: 4.2 },
  sources: {
    shopify: { connected: false, lastUpdated: "" },
    quickbooks: { connected: false, lastUpdated: "" },
  },
  lastUpdated: new Date().toISOString(),
};

export default function CommandCenter() {
  const [user, setUser] = useState<BrezUser | null>(null);
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState<UnifiedMetrics>(FALLBACK_METRICS);
  const [oneThing, setOneThing] = useState<DynamicAction | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 125, // Starting XP
    level: 2,
    streak: 3,
    achievements: [ACHIEVEMENTS[0], ACHIEVEMENTS[1]], // First Step, On Fire
    completedToday: [],
  });
  const [showAchievement, setShowAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);

  const { celebrate, toast } = useToast();
  const { toggle: toggleAI } = useAIAssistant();

  // Fetch live metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const dept = user?.department || "exec";
      const res = await fetch(`/api/metrics?department=${dept}`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();

      if (data.success && data.metrics) {
        setMetrics(data.metrics);
        setOneThing(data.oneThing);
        setIsLive(data.metrics.sources.shopify.connected || data.metrics.sources.quickbooks.connected);
        setLastFetch(new Date());

        // Run optimization with live data
        const opt = runOptimization(data.metrics);
        setOptimization(opt);
      }
    } catch (error) {
      console.error("Metrics fetch error:", error);
      // Keep using fallback metrics
      const opt = runOptimization(FALLBACK_METRICS);
      setOptimization(opt);
    }
  }, [user?.department]);

  // Initial load and refresh
  useEffect(() => {
    const selectedUser = getSelectedUser();
    setUser(selectedUser);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good morning", emoji: "☀️" });
    else if (hour < 17) setGreeting({ text: "Good afternoon", emoji: "🌤️" });
    else if (hour < 21) setGreeting({ text: "Good evening", emoji: "🌅" });
    else setGreeting({ text: "Burning midnight oil", emoji: "🌙" });
  }, []);

  // Fetch metrics when user loads
  useEffect(() => {
    if (user) {
      fetchMetrics();
      // Refresh every 5 minutes
      const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMetrics]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D2A]">
        <div className="text-center">
          <BrezLogo variant="icon" size="lg" className="mx-auto mb-4 animate-pulse" />
          <p className="text-[#676986]">Loading your command center...</p>
        </div>
      </div>
    );
  }

  const roleContext = getUserRoleContext(user.department);
  const growthStep = GROWTH_GENERATOR_STEPS[roleContext.growthGeneratorFocus - 1];

  // Use dynamic oneThing from API or fallback
  const currentAction = oneThing || {
    action: "Review your highest-priority item",
    why: "Clarity drives action. Action drives results.",
    steps: ["Check your dashboard", "Identify the top priority", "Take one step forward", "Document progress"],
    impact: "Momentum",
    urgency: "medium" as const,
    dataSource: "Fallback",
    confidence: 0.5,
  };

  // Get role-specific action from optimization
  const roleAction = optimization?.teamActions.find(a => a.role === user.department) ||
    optimization?.teamActions[0] || {
      role: user.department,
      action: currentAction.action,
      why: currentAction.why,
      steps: currentAction.steps,
      expectedImpact: currentAction.impact,
      priority: "medium" as const,
      xpReward: 25,
    };

  const handleStepComplete = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepIndex));
    } else {
      const newCompleted = [...completedSteps, stepIndex];
      setCompletedSteps(newCompleted);

      // XP for each step
      const xpGain = Math.floor(roleAction.xpReward / roleAction.steps.length);
      setUserProgress(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        level: calculateLevel(prev.xp + xpGain),
      }));
      toast(`+${xpGain} XP`, "success");

      // All steps complete!
      if (newCompleted.length === roleAction.steps.length) {
        const bonusXP = 25;
        const randomCelebration = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
        celebrate(randomCelebration);

        // Update progress
        setUserProgress(prev => {
          const newXP = prev.xp + bonusXP;
          const newLevel = calculateLevel(newXP);
          const leveledUp = newLevel > prev.level;

          if (leveledUp) {
            setTimeout(() => celebrate(`🎉 LEVEL UP! You're now level ${newLevel}!`), 1500);
          }

          // Check for new achievements
          const newStreak = prev.streak + 1;
          const newAchievements = [...prev.achievements];

          if (newStreak === 7 && !prev.achievements.find(a => a.id === "streak_7")) {
            const achievement = ACHIEVEMENTS.find(a => a.id === "streak_7")!;
            newAchievements.push({ ...achievement, unlockedAt: new Date().toISOString() });
            setTimeout(() => setShowAchievement(achievement), 2500);
          }

          return {
            ...prev,
            xp: newXP,
            level: newLevel,
            streak: newStreak,
            achievements: newAchievements,
            completedToday: [...prev.completedToday, roleAction.action],
          };
        });
      }
    }
  };

  const runOptimizationAnalysis = async () => {
    setIsOptimizing(true);
    toast("🧠 Analyzing data to find optimal strategy...", "info");

    // Simulate some processing time for effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const opt = runOptimization(metrics);
    setOptimization(opt);
    setShowOptimizer(true);
    setIsOptimizing(false);
    toast("✨ Optimization complete!", "success");
  };

  const cashStatus = metrics.cash.status;
  const xpProgress = xpToNextLevel(userProgress.xp);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Achievement Unlock Modal */}
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="bg-gradient-to-br from-[#e3f98a]/20 to-[#8533fc]/20 border border-[#e3f98a] rounded-2xl p-8 text-center max-w-sm mx-4 animate-scale-in">
            <div className="text-6xl mb-4">{showAchievement.icon}</div>
            <h2 className="text-2xl font-bold text-[#e3f98a] mb-2">Achievement Unlocked!</h2>
            <h3 className="text-xl font-bold text-white mb-2">{showAchievement.name}</h3>
            <p className="text-[#a8a8a8] mb-6">{showAchievement.description}</p>
            <Button onClick={() => setShowAchievement(null)}>
              <PartyPopper className="w-4 h-4 mr-2" /> Awesome!
            </Button>
          </div>
        </div>
      )}

      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BrezLogo variant="icon" size="lg" />
              {isLive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6BCB77] rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                {greeting.text}, {user.name.split(" ")[0]} {greeting.emoji}
              </h1>
              <p className="text-sm text-[#676986]">
                {user.title} • {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* XP & Level Badge */}
            <div className="flex items-center gap-2 bg-[#1a1a3a] rounded-full px-3 py-1.5">
              <Trophy className="w-4 h-4 text-[#ffce33]" />
              <span className="text-sm font-bold text-[#ffce33]">Lv.{userProgress.level}</span>
              <div className="w-16 h-1.5 bg-[#0D0D2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffce33] to-[#e3f98a] transition-all duration-500"
                  style={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#676986]">{userProgress.xp} XP</span>
            </div>

            {/* Streak Badge */}
            {userProgress.streak > 0 && (
              <Badge className="bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30">
                <Flame className="w-3 h-3 mr-1" />
                {userProgress.streak} day streak
              </Badge>
            )}

            {/* Phase Badge */}
            <Badge className="bg-[#ffce33]/20 text-[#ffce33] border-[#ffce33]/30">
              <Shield className="w-3 h-3 mr-1" />
              STABILIZE
            </Badge>

            {/* Data Status */}
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchMetrics}
              className={isLive ? "border-[#6BCB77]/30" : "border-[#ff6b6b]/30"}
            >
              {isLive ? (
                <Wifi className="w-4 h-4 text-[#6BCB77]" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#ff6b6b]" />
              )}
              <span className="hidden md:inline ml-1 text-xs">
                {lastFetch ? formatDistanceToNow(lastFetch, { addSuffix: true }) : "Sync"}
              </span>
            </Button>

            <Button variant="secondary" size="sm" onClick={toggleAI}>
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Ask AI</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============ CURRENT REALITY - KEY METRICS ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#676986] uppercase tracking-wider flex items-center gap-2">
            Current Reality
            {isLive && <span className="text-[#6BCB77] text-xs font-normal">(Live)</span>}
          </h2>
          {lastFetch && (
            <span className="text-xs text-[#676986]">
              Updated {formatDistanceToNow(lastFetch, { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link href="/financials">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <DollarSign className={`w-4 h-4 ${cashStatus === 'healthy' ? 'text-[#6BCB77]' : cashStatus === 'watch' ? 'text-[#ffce33]' : 'text-[#ff6b6b]'}`} />
                <span className={`text-lg font-bold ${cashStatus === 'healthy' ? 'text-[#6BCB77]' : cashStatus === 'watch' ? 'text-[#ffce33]' : 'text-[#ff6b6b]'}`}>
                  ${(metrics.cash.balance / 1000).toFixed(0)}K
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                Cash ({metrics.cash.runway}wk runway)
              </p>
              <div className="mt-1 text-xs text-[#676986]">
                Floor: ${(metrics.cash.floor / 1000).toFixed(0)}K
              </div>
            </Card>
          </Link>

          <Link href="/financials">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className={`w-4 h-4 ${metrics.ap.stopShipRisks > 0 ? 'text-[#ff6b6b]' : 'text-[#ffce33]'}`} />
                <span className="text-lg font-bold text-white">
                  ${(metrics.ap.total / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                AP Total
              </p>
              {metrics.ap.stopShipRisks > 0 && (
                <div className="mt-1 text-xs text-[#ff6b6b]">
                  ⚠️ {metrics.ap.stopShipRisks} stop-ship risks
                </div>
              )}
            </Card>
          </Link>

          <Link href="/channels">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="w-4 h-4 text-[#6BCB77]" />
                <span className="text-lg font-bold text-white">
                  ${(metrics.revenue.monthlyRun / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                Revenue run rate {metrics.revenue.trend}
              </p>
              <div className="mt-1 text-xs text-[#676986]">
                MTD: ${(metrics.revenue.mtd / 1000000).toFixed(2)}M
              </div>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <BarChart3 className={`w-4 h-4 ${metrics.dtc.contributionMargin >= 0.35 ? 'text-[#6BCB77]' : 'text-[#ffce33]'}`} />
                <span className="text-lg font-bold text-white">
                  {(metrics.dtc.contributionMargin * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                DTC Margin
              </p>
              <div className="mt-1 text-xs text-[#676986]">
                Target: 35%+
              </div>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <Target className={`w-4 h-4 ${metrics.dtc.cac <= 55 ? 'text-[#6BCB77]' : 'text-[#ffce33]'}`} />
                <span className="text-lg font-bold text-white">
                  ${metrics.dtc.cac}
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                CAC
              </p>
              <div className="mt-1 text-xs text-[#676986]">
                Ceiling: $55
              </div>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <Users className="w-4 h-4 text-[#65cdd8]" />
                <span className="text-lg font-bold text-white">
                  {(metrics.subscriptions.active / 1000).toFixed(1)}K
                </span>
              </div>
              <p className="text-xs text-[#676986] group-hover:text-[#a8a8a8]">
                Subscribers
              </p>
              <div className="mt-1 text-xs text-[#6BCB77]">
                +{metrics.subscriptions.newThisWeek} this week
              </div>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============ LEFT COLUMN - THE ONE THING ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* FIND BEST MOVE BUTTON */}
          <Button
            onClick={runOptimizationAnalysis}
            disabled={isOptimizing}
            className="w-full bg-gradient-to-r from-[#8533fc] to-[#e3f98a] hover:from-[#9544ff] hover:to-[#f0ff9a] text-black font-bold py-4 text-lg"
          >
            {isOptimizing ? (
              <>
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                🎯 Find My Best Move
              </>
            )}
          </Button>

          {/* OPTIMIZATION RESULTS */}
          {showOptimizer && optimization && (
            <Card className="border-2 border-[#8533fc]/40 bg-gradient-to-br from-[#8533fc]/10 via-[#0D0D2A] to-transparent overflow-hidden animate-fade-in">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-[#8533fc]" />
                    <h3 className="font-bold text-white">Optimization Results</h3>
                    <Badge className="bg-[#6BCB77]/20 text-[#6BCB77] border-[#6BCB77]/30 text-xs">
                      {(optimization.confidence * 100).toFixed(0)}% confident
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowOptimizer(false)}>
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Best Spend</p>
                    <p className="text-xl font-bold text-[#e3f98a]">
                      ${(optimization.recommendedSpend / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-[#676986]">/week</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Target CAC</p>
                    <p className="text-xl font-bold text-[#65cdd8]">
                      ${optimization.recommendedCAC}
                    </p>
                    <p className="text-xs text-[#676986]">ceiling</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Week 4 Cash</p>
                    <p className="text-xl font-bold text-[#6BCB77]">
                      ${(optimization.projectedCash4Week / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#6BCB77]/10 border border-[#6BCB77]/20">
                    <p className="text-xs text-[#6BCB77] mb-1">Upside</p>
                    <p className="text-lg font-bold text-[#6BCB77]">
                      {optimization.upside}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-white mb-2">Why this works:</p>
                  <ul className="space-y-1">
                    {optimization.rationale.map((r, i) => (
                      <li key={i} className="text-sm text-[#a8a8a8] flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#6BCB77] flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {optimization.risks.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#ff6b6b]/10 border border-[#ff6b6b]/20">
                    <p className="text-sm font-semibold text-[#ff6b6b] mb-1">Watch out for:</p>
                    <ul className="space-y-1">
                      {optimization.risks.map((r, i) => (
                        <li key={i} className="text-sm text-[#ff6b6b]">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

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
                      <Badge className={`text-xs ${
                        roleAction.priority === 'critical' ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30' :
                        roleAction.priority === 'high' ? 'bg-[#ffce33]/20 text-[#ffce33] border-[#ffce33]/30' :
                        'bg-[#6BCB77]/20 text-[#6BCB77] border-[#6BCB77]/30'
                      }`}>
                        {roleAction.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#ffce33]">
                    <Gift className="w-4 h-4" />
                    <span className="font-bold">+{roleAction.xpReward} XP</span>
                  </div>
                </div>
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
                          : "bg-white/5 hover:bg-white/10 border border-transparent hover:border-[#e3f98a]/20"
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
                      <div className="flex-1">
                        <p className={`text-sm ${isComplete ? "text-[#6BCB77] line-through" : "text-white"}`}>
                          {step}
                        </p>
                        {isComplete && (
                          <p className="text-xs text-[#6BCB77] mt-1">
                            +{Math.floor(roleAction.xpReward / roleAction.steps.length)} XP earned!
                          </p>
                        )}
                      </div>
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
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-[#6BCB77]/20 to-[#e3f98a]/20 border border-[#6BCB77]/30 text-center">
                  <PartyPopper className="w-8 h-8 text-[#6BCB77] mx-auto mb-2" />
                  <p className="text-[#6BCB77] font-bold text-lg">Complete!</p>
                  <p className="text-[#a8a8a8] text-sm">You moved BREZ forward today. The team thanks you! 💚</p>
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
                    If we all execute
                  </Badge>
                </div>
                <ChevronRight className={`w-5 h-5 text-[#676986] transition-transform ${showSimulation ? 'rotate-90' : ''}`} />
              </div>

              {showSimulation && optimization && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-[#676986] mb-1">Week 4</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white">Cash: <span className="text-[#6BCB77]">${(optimization.projectedCash4Week / 1000).toFixed(0)}K</span></p>
                        <p className="text-sm text-white">CM: <span className="text-[#6BCB77]">{(optimization.projectedCM * 100).toFixed(0)}%</span></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#6BCB77]/10 border border-[#6BCB77]/20">
                      <p className="text-xs text-[#6BCB77] mb-1">Week 8 - THRIVE</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white">Cash: <span className="text-[#6BCB77]">${(optimization.projectedCash8Week / 1000).toFixed(0)}K</span></p>
                        <p className="text-sm text-white">Total Gain: <span className="text-[#6BCB77]">{optimization.upside}</span></p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#676986] italic">
                    Assumptions: Team completes daily ONE THINGs, CAC stays at ${optimization.recommendedCAC}, no new AP
                  </p>
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
                  <Card className="p-3 hover:border-[#e3f98a]/30 transition-all cursor-pointer h-full group">
                    <module.icon className={`w-5 h-5 ${module.color} mb-2 group-hover:scale-110 transition-transform`} />
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
          {/* YOUR STATS */}
          <Card className="p-4 bg-gradient-to-br from-[#ffce33]/10 to-transparent border-[#ffce33]/20">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#ffce33]" />
              <h3 className="font-semibold text-white">Your Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8a8a8]">Level</span>
                <span className="text-lg font-bold text-[#ffce33]">{userProgress.level}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#676986]">{xpProgress.current} / {xpProgress.needed} XP</span>
                  <span className="text-[#ffce33]">Level {userProgress.level + 1}</span>
                </div>
                <div className="h-2 bg-[#0D0D2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffce33] to-[#e3f98a] transition-all duration-500"
                    style={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8a8a8]">Current Streak</span>
                <span className="text-lg font-bold text-[#ff6b6b] flex items-center gap-1">
                  <Flame className="w-4 h-4" /> {userProgress.streak} days
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-[#676986] mb-2">Recent Achievements</p>
                <div className="flex flex-wrap gap-2">
                  {userProgress.achievements.slice(-4).map((a) => (
                    <span key={a.id} className="text-xl" title={a.name}>{a.icon}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

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
                <div className={`flex items-center gap-2 ${metrics.ap.total < 6000000 ? 'text-[#6BCB77]' : 'text-[#676986]'}`}>
                  {metrics.ap.total < 6000000 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 text-[#ffce33]" />}
                  <span>AP under active management</span>
                </div>
                <div className={`flex items-center gap-2 ${metrics.cash.balance > 500000 ? 'text-[#6BCB77]' : 'text-[#676986]'}`}>
                  {metrics.cash.balance > 500000 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 text-[#ffce33]" />}
                  <span>Cash reserves &gt; $500k</span>
                </div>
                <div className={`flex items-center gap-2 ${metrics.dtc.contributionMargin >= 0.35 ? 'text-[#6BCB77]' : 'text-[#676986]'}`}>
                  {metrics.dtc.contributionMargin >= 0.35 ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 text-[#ffce33]" />}
                  <span>DTC CM &gt; 35%</span>
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
          BREZ Supermind • Building a $200B company through conscious capitalism 💚
        </p>
        <p className="text-xs text-[#676986]/50 mt-1">
          {isLive ? "Connected to live data" : "Using cached data"} •
          Last update: {lastFetch ? format(lastFetch, "h:mm a") : "Never"}
        </p>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
