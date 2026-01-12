"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Check,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  Sparkles,
  Brain,
  Rocket,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { BrezLogo } from "@/components/ui/BrezLogo";
import { useToast } from "@/components/ui/Toast";
import {
  getSelectedUser,
  type BrezUser,
} from "@/lib/stores/userStore";
import type { UnifiedMetrics } from "@/lib/integrations/unified";

// ============ GROWTH GENERATOR STEPS ============
const GROWTH_STEPS = [
  {
    id: 1,
    name: "Improve Contribution Margin",
    icon: TrendingUp,
    color: "#6BCB77",
    description: "Increase profit per dollar of revenue",
    metric: "CM %",
    target: 35,
  },
  {
    id: 2,
    name: "Generate Incremental Free Cash",
    icon: DollarSign,
    color: "#e3f98a",
    description: "Turn margin into actual cash",
    metric: "Free Cash",
    target: 500000,
  },
  {
    id: 3,
    name: "Reinvest in High-ROI Levers",
    icon: Target,
    color: "#65cdd8",
    description: "Conversion, retention, COGS reduction",
    metric: "CAC Payback",
    target: 4,
  },
  {
    id: 4,
    name: "Spend More → Stack More Cash",
    icon: Rocket,
    color: "#8533fc",
    description: "Scale spend while improving cash position",
    metric: "Cash Trend",
    target: "up",
  },
  {
    id: 5,
    name: "Accelerate AP & Unlock Growth",
    icon: CheckCircle,
    color: "#ffce33",
    description: "Pay down AP, unlock better terms",
    metric: "AP Reduction",
    target: 1000000,
  },
];

// ============ SCENARIO DEFINITIONS ============
type Scenario = "critical" | "stabilize" | "thrive" | "scale";

interface ScenarioConfig {
  name: string;
  color: string;
  bgColor: string;
  description: string;
  maxCAC: number;
  maxPayback: number;
  priority: string;
}

const SCENARIOS: Record<Scenario, ScenarioConfig> = {
  critical: {
    name: "SURVIVAL MODE",
    color: "#ff6b6b",
    bgColor: "from-[#ff6b6b]/20",
    description: "Cash below floor. Preserve at all costs.",
    maxCAC: 45,
    maxPayback: 3,
    priority: "Stop all non-essential spend. Collect AR. Delay AP.",
  },
  stabilize: {
    name: "STABILIZE",
    color: "#ffce33",
    bgColor: "from-[#ffce33]/20",
    description: "Preserve cash, maximize CM, contain AP.",
    maxCAC: 55,
    maxPayback: 4,
    priority: "Improve margin. Reduce CAC. Manage AP actively.",
  },
  thrive: {
    name: "THRIVE",
    color: "#6BCB77",
    bgColor: "from-[#6BCB77]/20",
    description: "Growth mode with discipline.",
    maxCAC: 65,
    maxPayback: 5,
    priority: "Scale spend. Invest in retention. Accelerate AP paydown.",
  },
  scale: {
    name: "SCALE",
    color: "#8533fc",
    bgColor: "from-[#8533fc]/20",
    description: "Full growth mode.",
    maxCAC: 75,
    maxPayback: 6,
    priority: "Maximize acquisition. Expand channels. Strategic investments.",
  },
};

// ============ FALLBACK METRICS ============
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

// ============ ANALYSIS ENGINE ============
interface StepAnalysis {
  step: typeof GROWTH_STEPS[0];
  current: number | string;
  target: number | string;
  status: "good" | "warning" | "critical";
  gap: string;
  recommendation: string;
  actions: string[];
  impact: string;
}

function analyzeGrowthGenerator(metrics: UnifiedMetrics): {
  scenario: Scenario;
  analyses: StepAnalysis[];
  topPriority: StepAnalysis;
  projections: { week4: string; week8: string };
} {
  // Determine scenario based on cash and AP
  let scenario: Scenario = "stabilize";
  if (metrics.cash.balance < metrics.cash.floor) {
    scenario = "critical";
  } else if (metrics.cash.balance > 500000 && metrics.dtc.contributionMargin >= 0.35 && metrics.ap.total < 5000000) {
    scenario = "thrive";
  } else if (metrics.cash.balance > 1000000 && metrics.dtc.contributionMargin >= 0.40 && metrics.ap.total < 3000000) {
    scenario = "scale";
  }

  const scenarioConfig = SCENARIOS[scenario];
  const analyses: StepAnalysis[] = [];

  // Step 1: Contribution Margin
  const cmPercent = Math.round(metrics.dtc.contributionMargin * 100);
  const cmStatus = cmPercent >= 35 ? "good" : cmPercent >= 30 ? "warning" : "critical";
  const cmGap = 35 - cmPercent;
  analyses.push({
    step: GROWTH_STEPS[0],
    current: cmPercent,
    target: 35,
    status: cmStatus,
    gap: cmGap > 0 ? `${cmGap}% below target` : "On target",
    recommendation: cmStatus === "good"
      ? "CM is healthy. Focus on maintaining while scaling."
      : `Increase CM by ${cmGap}% to unlock growth capacity.`,
    actions: cmStatus === "good" ? [
      "Monitor COGS for any increases",
      "Test price elasticity on best sellers",
    ] : [
      `Reduce CAC from $${metrics.dtc.cac} to $${scenarioConfig.maxCAC}`,
      "Cut bottom 20% performing ad campaigns",
      "Negotiate better supplier terms",
      "Optimize fulfillment costs",
    ],
    impact: cmStatus === "good" ? "Maintain $30K+/mo profit" : `+$${Math.round(cmGap * metrics.revenue.monthlyRun / 100 / 1000)}K/mo profit`,
  });

  // Step 2: Free Cash
  const freeCash = metrics.cash.balance;
  const cashStatus = freeCash >= 500000 ? "good" : freeCash >= 300000 ? "warning" : "critical";
  const cashGap = 500000 - freeCash;
  analyses.push({
    step: GROWTH_STEPS[1],
    current: `$${Math.round(freeCash / 1000)}K`,
    target: "$500K",
    status: cashStatus,
    gap: cashGap > 0 ? `$${Math.round(cashGap / 1000)}K below target` : "On target",
    recommendation: cashStatus === "good"
      ? "Cash is healthy. Can invest in growth."
      : `Build $${Math.round(cashGap / 1000)}K more reserves before scaling.`,
    actions: cashStatus === "good" ? [
      "Consider increasing ad spend by 20%",
      "Explore new channel investments",
    ] : [
      "Collect outstanding AR immediately",
      "Delay non-critical AP payments",
      "Reduce ad spend to cash-neutral level",
      "Negotiate payment plans with top AP vendors",
    ],
    impact: cashStatus === "good" ? "Unlock growth investments" : `+${Math.round(cashGap / metrics.revenue.monthlyRun * 4)} weeks runway`,
  });

  // Step 3: CAC Payback
  const aov = metrics.dtc.aov;
  const cac = metrics.dtc.cac;
  const cm = metrics.dtc.contributionMargin;
  const subConversion = 0.5;
  const firstOrderCM = aov * cm;
  const paybackMonths = cac / (firstOrderCM * subConversion);
  const paybackStatus = paybackMonths <= 4 ? "good" : paybackMonths <= 5 ? "warning" : "critical";
  analyses.push({
    step: GROWTH_STEPS[2],
    current: `${paybackMonths.toFixed(1)}mo`,
    target: "4mo",
    status: paybackStatus,
    gap: paybackMonths > 4 ? `${(paybackMonths - 4).toFixed(1)}mo too long` : "On target",
    recommendation: paybackStatus === "good"
      ? "Payback is healthy. Can scale acquisition."
      : `Reduce payback by ${(paybackMonths - 4).toFixed(1)} months before scaling.`,
    actions: paybackStatus === "good" ? [
      "Increase spend on best-performing campaigns",
      "Test new audiences at current CAC",
    ] : [
      `Reduce CAC from $${cac} to $${scenarioConfig.maxCAC}`,
      `Improve conversion rate from ${metrics.dtc.conversionRate}% to 3.5%`,
      "Increase AOV through bundles/upsells",
      "Improve subscription conversion from 50% to 55%",
    ],
    impact: paybackStatus === "good" ? "Scale spend safely" : `-$${Math.round((cac - scenarioConfig.maxCAC) * metrics.dtc.orders / 30)} CAC savings/day`,
  });

  // Step 4: Cash Trend
  const cashTrend = metrics.cash.balance > 400000 ? "up" : "flat";
  const trendStatus = cashTrend === "up" ? "good" : "warning";
  analyses.push({
    step: GROWTH_STEPS[3],
    current: cashTrend === "up" ? "↑ Growing" : "→ Flat",
    target: "↑ Growing",
    status: trendStatus,
    gap: trendStatus === "good" ? "On target" : "Need positive trend",
    recommendation: trendStatus === "good"
      ? "Cash is growing. Scale spend while maintaining trend."
      : "Stabilize cash before increasing spend.",
    actions: trendStatus === "good" ? [
      "Increase weekly ad spend by 10%",
      "Reinvest in retention programs",
      "Accelerate AP paydown",
    ] : [
      "Hold spend at current level",
      "Focus on improving unit economics",
      "Monitor weekly cash position closely",
    ],
    impact: trendStatus === "good" ? "+$50K/mo to reinvest" : "Protect cash position",
  });

  // Step 5: AP Reduction
  const apTotal = metrics.ap.total;
  const apCritical = metrics.ap.critical;
  const apStatus = apTotal < 5000000 ? "good" : apTotal < 8000000 ? "warning" : "critical";
  analyses.push({
    step: GROWTH_STEPS[4],
    current: `$${(apTotal / 1000000).toFixed(1)}M`,
    target: "<$5M",
    status: apStatus,
    gap: apTotal > 5000000 ? `$${((apTotal - 5000000) / 1000000).toFixed(1)}M over target` : "On target",
    recommendation: apStatus === "good"
      ? "AP is manageable. Continue paydown schedule."
      : `Reduce AP by $${((apTotal - 5000000) / 1000000).toFixed(1)}M to unlock growth.`,
    actions: apStatus === "good" ? [
      "Maintain payment schedule",
      "Negotiate early payment discounts",
    ] : [
      `Resolve ${metrics.ap.stopShipRisks} stop-ship risks immediately`,
      "Offer equity conversion to top vendors",
      "Negotiate 3-6 month payment plans",
      "Prioritize vendors by relationship value",
    ],
    impact: apStatus === "good" ? "Unlock better terms" : `Prevent $${Math.round(apCritical / 10000)}K stop-ship risk`,
  });

  // Find top priority (first non-good step)
  const topPriority = analyses.find(a => a.status !== "good") || analyses[0];

  // Calculate projections
  const weeklyImprovement = 0.02; // 2% weekly improvement assumption
  const week4Cash = Math.round(freeCash * (1 + weeklyImprovement * 4));
  const week8Cash = Math.round(freeCash * (1 + weeklyImprovement * 8));

  return {
    scenario,
    analyses,
    topPriority,
    projections: {
      week4: `$${Math.round(week4Cash / 1000)}K cash, ${Math.round(cmPercent + 2)}% CM`,
      week8: `$${Math.round(week8Cash / 1000)}K cash, ${Math.round(cmPercent + 4)}% CM`,
    },
  };
}

export default function GrowthGeneratorPage() {
  const [user, setUser] = useState<BrezUser | null>(null);
  const [metrics, setMetrics] = useState<UnifiedMetrics>(FALLBACK_METRICS);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeGrowthGenerator> | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast, celebrate } = useToast();

  // Fetch metrics
  const fetchAndAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/metrics?department=exec");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.metrics) {
          setMetrics(data.metrics);
          const result = analyzeGrowthGenerator(data.metrics);
          setAnalysis(result);
          // Find first problem step
          const firstProblem = result.analyses.findIndex(a => a.status !== "good");
          setActiveStep(firstProblem >= 0 ? firstProblem : 0);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const result = analyzeGrowthGenerator(FALLBACK_METRICS);
      setAnalysis(result);
    }
    setIsAnalyzing(false);
  }, []);

  useEffect(() => {
    const selectedUser = getSelectedUser();
    setUser(selectedUser);
    fetchAndAnalyze();
  }, [fetchAndAnalyze]);

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    toast("🧠 Running Growth Generator analysis...", "info");
    await new Promise(r => setTimeout(r, 1500));
    await fetchAndAnalyze();
    celebrate("✨ Analysis complete! Here's your path to Thrive.");
  };

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D2A]">
        <div className="text-center">
          <BrezLogo variant="icon" size="lg" className="mx-auto mb-4 animate-pulse" />
          <p className="text-[#676986]">Analyzing your growth engine...</p>
        </div>
      </div>
    );
  }

  const scenarioConfig = SCENARIOS[analysis.scenario];
  const currentAnalysis = analysis.analyses[activeStep];

  return (
    <div className="min-h-screen bg-[#0D0D2A] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BrezLogo variant="icon" size="md" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Growth Generator</h1>
              <p className="text-sm text-[#676986]">
                {user?.name ? `${user.name} • ` : ""}{format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
          </div>
          <Button
            onClick={runFullAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-[#8533fc] to-[#e3f98a] hover:from-[#9544ff] hover:to-[#f0ff9a] text-black font-bold"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? "Analyzing..." : "Re-analyze"}
          </Button>
        </div>

        {/* Scenario Banner */}
        <Card className={`mb-6 border-2 bg-gradient-to-r ${scenarioConfig.bgColor} to-transparent`} style={{ borderColor: scenarioConfig.color }}>
          <div className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge style={{ backgroundColor: `${scenarioConfig.color}20`, color: scenarioConfig.color, borderColor: `${scenarioConfig.color}50` }}>
                    {scenarioConfig.name}
                  </Badge>
                  {analysis.scenario === "critical" && (
                    <AlertTriangle className="w-5 h-5 text-[#ff6b6b] animate-pulse" />
                  )}
                </div>
                <p className="text-white font-semibold">{scenarioConfig.description}</p>
                <p className="text-sm text-[#a8a8a8] mt-1">{scenarioConfig.priority}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#676986]">Max CAC: <span className="text-white font-bold">${scenarioConfig.maxCAC}</span></p>
                <p className="text-xs text-[#676986]">Max Payback: <span className="text-white font-bold">{scenarioConfig.maxPayback}mo</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Growth Generator Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Step Navigation */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#676986] uppercase tracking-wider mb-3">
              5-Step Sequence
            </h2>
            {analysis.analyses.map((a, i) => (
              <button
                key={a.step.id}
                onClick={() => setActiveStep(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  activeStep === i
                    ? "bg-white/10 border-2"
                    : "bg-white/5 border border-transparent hover:bg-white/8"
                }`}
                style={{
                  borderColor: activeStep === i ? a.step.color : "transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${a.step.color}20` }}
                >
                  {a.status === "good" ? (
                    <Check className="w-5 h-5" style={{ color: a.step.color }} />
                  ) : (
                    <a.step.icon className="w-5 h-5" style={{ color: a.step.color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${activeStep === i ? "text-white" : "text-[#a8a8a8]"}`}>
                    {a.step.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold ${
                      a.status === "good" ? "text-[#6BCB77]" :
                      a.status === "warning" ? "text-[#ffce33]" : "text-[#ff6b6b]"
                    }`}>
                      {a.current}
                    </span>
                    <span className="text-xs text-[#676986]">→ {a.target}</span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  a.status === "good" ? "bg-[#6BCB77]" :
                  a.status === "warning" ? "bg-[#ffce33]" : "bg-[#ff6b6b]"
                }`} />
              </button>
            ))}

            {/* Projections */}
            <Card className="mt-4 p-4 border-[#8533fc]/30 bg-[#8533fc]/10">
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-[#8533fc]" />
                <span className="text-sm font-semibold text-white">If You Execute</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#676986]">Week 4:</span>
                  <span className="text-[#6BCB77] font-medium">{analysis.projections.week4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#676986]">Week 8:</span>
                  <span className="text-[#6BCB77] font-medium">{analysis.projections.week8}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Active Step Detail */}
          <div className="lg:col-span-2">
            <Card
              className="border-2 overflow-hidden"
              style={{ borderColor: `${currentAnalysis.step.color}50` }}
            >
              {/* Step Header */}
              <div
                className="p-4 md:p-6"
                style={{ background: `linear-gradient(135deg, ${currentAnalysis.step.color}15 0%, transparent 50%)` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: currentAnalysis.step.color }}
                    >
                      <currentAnalysis.step.icon className="w-6 h-6 text-[#0D0D2A]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#676986] uppercase tracking-wider">Step {currentAnalysis.step.id} of 5</p>
                      <h2 className="text-xl font-bold text-white">{currentAnalysis.step.name}</h2>
                    </div>
                  </div>
                  <Badge className={`${
                    currentAnalysis.status === "good" ? "bg-[#6BCB77]/20 text-[#6BCB77] border-[#6BCB77]/30" :
                    currentAnalysis.status === "warning" ? "bg-[#ffce33]/20 text-[#ffce33] border-[#ffce33]/30" :
                    "bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30"
                  }`}>
                    {currentAnalysis.status === "good" ? "✓ On Track" :
                     currentAnalysis.status === "warning" ? "⚠ Needs Work" : "🚨 Critical"}
                  </Badge>
                </div>

                {/* Current vs Target */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Current</p>
                    <p className="text-2xl font-bold text-white">{currentAnalysis.current}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Target</p>
                    <p className="text-2xl font-bold" style={{ color: currentAnalysis.step.color }}>{currentAnalysis.target}</p>
                  </div>
                </div>

                {/* Gap */}
                <div className={`p-3 rounded-lg mb-4 ${
                  currentAnalysis.status === "good" ? "bg-[#6BCB77]/10" : "bg-[#ff6b6b]/10"
                }`}>
                  <p className={`text-sm font-medium ${
                    currentAnalysis.status === "good" ? "text-[#6BCB77]" : "text-[#ff6b6b]"
                  }`}>
                    {currentAnalysis.status === "good" ? "✓ " : "Gap: "}{currentAnalysis.gap}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#e3f98a]/10 to-transparent border-l-4 border-[#e3f98a]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#e3f98a]" />
                    <span className="text-sm font-semibold text-[#e3f98a]">RECOMMENDATION</span>
                  </div>
                  <p className="text-white">{currentAnalysis.recommendation}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 md:p-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Actions to Take</h3>
                  <Badge className="bg-[#6BCB77]/20 text-[#6BCB77] border-[#6BCB77]/30">
                    {currentAnalysis.impact}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {currentAnalysis.actions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#e3f98a]/20">
                        <span className="text-xs font-bold text-[#e3f98a]">{i + 1}</span>
                      </div>
                      <p className="text-sm text-[#a8a8a8]">{action}</p>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(activeStep - 1)}
                  >
                    ← Previous Step
                  </Button>
                  <Button
                    size="sm"
                    disabled={activeStep === 4}
                    onClick={() => setActiveStep(activeStep + 1)}
                  >
                    Next Step →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Card className="p-3 text-center">
                <DollarSign className={`w-5 h-5 mx-auto mb-1 ${
                  metrics.cash.status === "healthy" ? "text-[#6BCB77]" :
                  metrics.cash.status === "watch" ? "text-[#ffce33]" : "text-[#ff6b6b]"
                }`} />
                <p className="text-lg font-bold text-white">${Math.round(metrics.cash.balance / 1000)}K</p>
                <p className="text-xs text-[#676986]">Cash</p>
              </Card>
              <Card className="p-3 text-center">
                <Target className={`w-5 h-5 mx-auto mb-1 ${metrics.dtc.cac <= 55 ? "text-[#6BCB77]" : "text-[#ffce33]"}`} />
                <p className="text-lg font-bold text-white">${metrics.dtc.cac}</p>
                <p className="text-xs text-[#676986]">CAC</p>
              </Card>
              <Card className="p-3 text-center">
                <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${metrics.dtc.contributionMargin >= 0.35 ? "text-[#6BCB77]" : "text-[#ffce33]"}`} />
                <p className="text-lg font-bold text-white">{Math.round(metrics.dtc.contributionMargin * 100)}%</p>
                <p className="text-xs text-[#676986]">CM</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#676986]">
            BREZ Growth Generator • The sequence that unlocks Thrive 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
