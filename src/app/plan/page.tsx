"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Target,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle,
  Check,
  Zap,
  Heart,
  Brain,
  Shield,
  ArrowRight,
  Package,
  RefreshCw,
  Lock,
  Eye,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { useToast } from "@/components/ui/Toast";

// Master Plan Types
interface PlanDecision {
  id: string;
  section: string;
  text: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  critical?: boolean;
}

interface MasterPlan {
  id: string;
  phase: "stabilize" | "thrive" | "scale";
  purpose: string;
  coreBeliefs: string[];
  operatingPhilosophy: string[];
  governingPrinciple: string;
  currentReality: {
    monthlyRunRate: number;
    cashOnHand: number;
    accountsPayable: number;
    inventory: number;
    dtcProfitable: boolean;
    nextProductionWindow: string;
  };
  scenarios: {
    id: string;
    name: string;
    status: "active" | "fallback" | "target";
    description: string;
  }[];
  productRoadmap: {
    phase: "now" | "q2" | "q3" | "q3q4";
    items: string[];
  }[];
  growthGeneratorSteps: string[];
  decisions: PlanDecision[];
  updatedAt: string;
}

// Initial plan based on canonical document
const initialPlan: MasterPlan = {
  id: "brez-master-plan-2026",
  phase: "stabilize",
  purpose: "BRĒZ exists to help people feel better without feeling worse.",
  coreBeliefs: [
    "BRĒZ is not the cure. You are.",
    "BRĒZ is a tool that reminds people of their own agency.",
  ],
  operatingPhilosophy: [
    "Clarity over chaos",
    "Execution over intention",
    "Integrity over optics",
    "Contribution margin over vanity metrics",
    "Alignment over individual agendas",
  ],
  governingPrinciple: "Every decision must improve contribution margin and meet at least our survival goals.",
  currentReality: {
    monthlyRunRate: 3300000,
    cashOnHand: 300000,
    accountsPayable: 8600000,
    inventory: 9500000,
    dtcProfitable: true,
    nextProductionWindow: "April",
  },
  scenarios: [
    {
      id: "stabilize",
      name: "Stabilize",
      status: "active",
      description: "Execute plan, box AP, maintain revenue, preserve service levels",
    },
    {
      id: "downside",
      name: "Downside",
      status: "fallback",
      description: "Retail flat, DTC flat, survival targets still met, AP plans enforceable",
    },
    {
      id: "thrive",
      name: "Thrive",
      status: "target",
      description: "+20% DTC improvement at same spend, 3–6 week lag → retail velocity lift, faster AP reduction",
    },
  ],
  productRoadmap: [
    { phase: "now", items: ["Elevate optimization", "Drift refinement", "SKU rationalization", "Variety packs"] },
    { phase: "q2", items: ["Passion", "Muse"] },
    { phase: "q3", items: ["IMPACT (energy drink; one flavor, no sugar)"] },
    { phase: "q3q4", items: ["Water"] },
  ],
  growthGeneratorSteps: [
    "Improve contribution margin",
    "Generate incremental free cash",
    "Reinvest only into initiatives that improve conversion, retention, or reduce COGS",
    "Spend more → stack more cash (not less)",
    "Use gains to accelerate AP reduction and unlock better financing terms",
    "Fund growth on our terms",
  ],
  decisions: [
    { id: "dec-1", section: "Product", text: "Greenlight Elevate optimization for Q1", approved: true, approvedBy: "Aaron Nosbisch", approvedAt: new Date().toISOString(), critical: true },
    { id: "dec-2", section: "Product", text: "Launch variety packs before Q2", approved: false, critical: false },
    { id: "dec-3", section: "Finance", text: "Offer vendors Option 1 (100% + 10% interest on equity event)", approved: false, critical: true },
    { id: "dec-4", section: "Finance", text: "Offer vendors Option 2 (50% equity conversion + structured paydown)", approved: false, critical: true },
    { id: "dec-5", section: "Growth", text: "Prioritize DTC contribution margin improvement over retail expansion", approved: true, approvedBy: "Aaron Nosbisch", approvedAt: new Date().toISOString(), critical: true },
    { id: "dec-6", section: "Growth", text: "Target +20% DTC improvement at same spend", approved: false, critical: false },
    { id: "dec-7", section: "Product", text: "Greenlight Passion & Muse for Q2 (Thrive-dependent)", approved: false, critical: false },
    { id: "dec-8", section: "Product", text: "Greenlight IMPACT energy drink for Q3", approved: false, critical: false },
    { id: "dec-9", section: "Team", text: "Implement 3% ESOP immediately", approved: false, critical: false },
    { id: "dec-10", section: "Team", text: "Increase ESOP to 5% post-investment", approved: false, critical: false },
  ],
  updatedAt: new Date().toISOString(),
};

const PLAN_STORAGE_KEY = "brez-canonical-master-plan";

export default function PlanPage() {
  const [plan, setPlan] = useState<MasterPlan>(initialPlan);
  const [expandedSections, setExpandedSections] = useState<string[]>(["current-reality", "growth-generator"]);
  const [selectedScenario, setSelectedScenario] = useState<string>("stabilize");
  const { celebrate } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    if (stored) {
      try {
        setPlan(JSON.parse(stored));
      } catch {
        setPlan(initialPlan);
      }
    }
  }, []);

  const savePlan = (updatedPlan: MasterPlan) => {
    updatedPlan.updatedAt = new Date().toISOString();
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
    setPlan(updatedPlan);
  };

  const approveDecision = (decisionId: string) => {
    const currentUser = devStore.getCurrentUser();
    const updatedPlan = { ...plan };
    const decision = updatedPlan.decisions.find((d) => d.id === decisionId);
    if (decision && !decision.approved) {
      decision.approved = true;
      decision.approvedBy = currentUser.name;
      decision.approvedAt = new Date().toISOString();
      savePlan(updatedPlan);
      celebrate(`Decision approved!`);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const getPhaseColor = () => {
    switch (plan.phase) {
      case "stabilize": return "#ffce33";
      case "thrive": return "#6BCB77";
      case "scale": return "#65cdd8";
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const pendingDecisions = plan.decisions.filter((d) => !d.approved);
  const approvedDecisions = plan.decisions.filter((d) => d.approved);
  const criticalPending = pendingDecisions.filter((d) => d.critical);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header with Phase */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${getPhaseColor()}20` }}
            >
              <Target className="w-6 h-6" style={{ color: getPhaseColor() }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                BRĒZ Master Plan
              </h1>
              <p className="text-[#676986]">
                Canonical Operating Document • Last updated {format(new Date(plan.updatedAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={plan.phase === "stabilize" ? "warning" : plan.phase === "thrive" ? "success" : "info"}
            className="text-sm px-4 py-2 font-bold uppercase tracking-wider"
          >
            Phase: {plan.phase}
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-2">
            <Lock className="w-3 h-3 mr-1" /> Locked
          </Badge>
        </div>
      </div>

      {/* Phase Progress */}
      <Card className="mb-6 bg-gradient-to-r from-[#ffce33]/10 via-[#6BCB77]/5 to-[#65cdd8]/10 border-[#ffce33]/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Stabilize → Thrive → Scale</h3>
          <span className="text-sm text-[#a8a8a8]">Source of Truth for AI Operating System</span>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between">
            {["Stabilize", "Thrive", "Scale"].map((phase, i) => (
              <div key={phase} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    plan.phase === phase.toLowerCase()
                      ? "bg-[#ffce33] border-[#ffce33] text-[#0D0D2A]"
                      : i === 0
                        ? "bg-[#ffce33]/20 border-[#ffce33]/50 text-[#ffce33]"
                        : "bg-white/5 border-white/20 text-[#676986]"
                  }`}
                >
                  {i === 0 && <Shield className="w-5 h-5" />}
                  {i === 1 && <TrendingUp className="w-5 h-5" />}
                  {i === 2 && <Sparkles className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-sm font-medium ${plan.phase === phase.toLowerCase() ? "text-[#ffce33]" : "text-[#676986]"}`}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" style={{ zIndex: 0 }}>
            <div className="h-full bg-[#ffce33]" style={{ width: "20%" }} />
          </div>
        </div>
      </Card>

      {/* Purpose & Governing Principle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-l-4 border-[#e3f98a]">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-[#e3f98a]" />
            <span className="text-sm font-semibold text-[#e3f98a] uppercase tracking-wider">Purpose</span>
          </div>
          <p className="text-xl text-white font-medium mb-4">{plan.purpose}</p>
          <div className="space-y-2">
            {plan.coreBeliefs.map((belief, i) => (
              <p key={i} className="text-sm text-[#a8a8a8] italic">&ldquo;{belief}&rdquo;</p>
            ))}
          </div>
        </Card>

        <Card className="border-l-4 border-[#ff6b6b]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#ff6b6b]" />
            <span className="text-sm font-semibold text-[#ff6b6b] uppercase tracking-wider">Master Governing Principle</span>
            <Badge variant="danger" size="sm">LOCKED</Badge>
          </div>
          <p className="text-xl text-white font-medium">{plan.governingPrinciple}</p>
          <div className="mt-4 p-3 bg-[#ff6b6b]/10 rounded-lg">
            <p className="text-sm text-[#a8a8a8]">
              <strong className="text-white">Clarification:</strong> Survival is the floor. Thrive is the objective.
            </p>
          </div>
        </Card>
      </div>

      {/* Operating Philosophy */}
      <Card className="mb-6" padding="none">
        <button
          onClick={() => toggleSection("philosophy")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#8533fc]" />
            <h3 className="font-semibold text-white">Operating Philosophy</h3>
          </div>
          {expandedSections.includes("philosophy") ? (
            <ChevronUp className="w-5 h-5 text-[#676986]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#676986]" />
          )}
        </button>
        {expandedSections.includes("philosophy") && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {plan.operatingPhilosophy.map((principle, i) => (
                <div key={i} className="p-3 bg-[#8533fc]/10 rounded-xl border border-[#8533fc]/20 text-center">
                  <p className="text-sm text-white font-medium">{principle}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Current Reality */}
      <Card className="mb-6" padding="none">
        <button
          onClick={() => toggleSection("current-reality")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#65cdd8]" />
            <h3 className="font-semibold text-white">Current Reality (Fact Base)</h3>
          </div>
          {expandedSections.includes("current-reality") ? (
            <ChevronUp className="w-5 h-5 text-[#676986]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#676986]" />
          )}
        </button>
        {expandedSections.includes("current-reality") && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Monthly Run-Rate</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(plan.currentReality.monthlyRunRate)}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Cash on Hand</p>
                <p className="text-2xl font-bold text-[#ffce33]">{formatCurrency(plan.currentReality.cashOnHand)}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Accounts Payable</p>
                <p className="text-2xl font-bold text-[#ff6b6b]">{formatCurrency(plan.currentReality.accountsPayable)}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Inventory</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(plan.currentReality.inventory)}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">DTC Profitable</p>
                <p className="text-2xl font-bold text-[#6BCB77]">{plan.currentReality.dtcProfitable ? "Yes" : "No"}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Next Production</p>
                <p className="text-2xl font-bold text-white">{plan.currentReality.nextProductionWindow}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#ff6b6b]/10 rounded-lg border border-[#ff6b6b]/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
                <span className="text-sm font-semibold text-[#ff6b6b]">Primary Risk</span>
              </div>
              <p className="text-sm text-[#a8a8a8]">Complexity and working capital, not demand.</p>
            </div>
          </div>
        )}
      </Card>

      {/* Three-Scenario Operating Model */}
      <Card className="mb-6" padding="none">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#65cdd8]" />
            <h3 className="font-semibold text-white">Three-Scenario Operating Model</h3>
            <Badge variant="default" size="sm">LOCKED</Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  scenario.status === "active"
                    ? "border-[#ffce33] bg-[#ffce33]/10"
                    : scenario.status === "target"
                    ? "border-[#6BCB77]/50 bg-[#6BCB77]/5"
                    : "border-white/10 bg-white/5"
                } ${selectedScenario === scenario.id ? "ring-2 ring-white/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{scenario.name}</h4>
                  <Badge
                    variant={scenario.status === "active" ? "warning" : scenario.status === "target" ? "success" : "default"}
                    size="sm"
                  >
                    {scenario.status === "active" ? "Current" : scenario.status === "target" ? "Target" : "Fallback"}
                  </Badge>
                </div>
                <p className="text-sm text-[#a8a8a8]">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Growth Generator */}
      <Card className="mb-6 border-2 border-[#e3f98a]/30" padding="none">
        <button
          onClick={() => toggleSection("growth-generator")}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors bg-gradient-to-r from-[#e3f98a]/10 to-transparent"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#e3f98a]" />
            <h3 className="font-semibold text-white">The Growth Generator</h3>
            <Badge variant="success" size="sm">CRITICAL • LOCKED</Badge>
          </div>
          {expandedSections.includes("growth-generator") ? (
            <ChevronUp className="w-5 h-5 text-[#676986]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#676986]" />
          )}
        </button>
        {expandedSections.includes("growth-generator") && (
          <div className="p-4">
            <p className="text-sm text-[#a8a8a8] mb-4">
              The Growth Generator is the system by which contribution margin gains are reinvested to create exponential growth.
            </p>
            <div className="space-y-3">
              {plan.growthGeneratorSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e3f98a]/20 flex items-center justify-center flex-shrink-0 text-[#e3f98a] font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-3 bg-[#1a1a3e] rounded-lg">
                    <p className="text-white">{step}</p>
                  </div>
                  {i < plan.growthGeneratorSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#676986] mt-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-[#e3f98a]/10 rounded-lg border border-[#e3f98a]/20">
              <p className="text-sm text-white font-medium">
                Principle: We do not invest to grow. We grow so we can invest.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Product Roadmap */}
      <Card className="mb-6" padding="none">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8533fc]" />
            <h3 className="font-semibold text-white">Product Roadmap & Priorities</h3>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {plan.productRoadmap.map((phase) => (
              <div
                key={phase.phase}
                className={`w-56 p-4 rounded-xl border ${
                  phase.phase === "now"
                    ? "border-[#e3f98a]/50 bg-[#e3f98a]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={phase.phase === "now" ? "success" : "default"}
                    className="uppercase"
                  >
                    {phase.phase === "now" ? "Now" : phase.phase === "q2" ? "Q2" : phase.phase === "q3" ? "Q3" : "Q3/Q4"}
                  </Badge>
                  {phase.phase !== "now" && (
                    <span className="text-xs text-[#676986]">Thrive-dependent</span>
                  )}
                </div>
                <div className="space-y-2">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {phase.phase === "now" ? (
                        <Check className="w-4 h-4 text-[#6BCB77]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#676986]" />
                      )}
                      <span className="text-sm text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Decisions */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#ffce33]" />
            Pending Decisions ({pendingDecisions.length})
            {criticalPending.length > 0 && (
              <Badge variant="danger" size="sm">{criticalPending.length} Critical</Badge>
            )}
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingDecisions.length === 0 ? (
              <p className="text-center text-[#676986] py-4">All decisions approved!</p>
            ) : (
              pendingDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className={`p-3 rounded-xl border ${
                    decision.critical
                      ? "bg-[#ff6b6b]/10 border-[#ff6b6b]/30"
                      : "bg-[#1a1a3e] border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" size="sm">{decision.section}</Badge>
                        {decision.critical && (
                          <Badge variant="danger" size="sm">Critical</Badge>
                        )}
                      </div>
                      <p className="text-sm text-white">{decision.text}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approveDecision(decision.id)}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Approved Decisions */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#6BCB77]" />
            Approved Decisions ({approvedDecisions.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {approvedDecisions.length === 0 ? (
              <p className="text-center text-[#676986] py-4">No decisions approved yet</p>
            ) : (
              approvedDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-3 bg-[#6BCB77]/10 rounded-xl border border-[#6BCB77]/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="success" size="sm">{decision.section}</Badge>
                  </div>
                  <p className="text-sm text-white mb-2">{decision.text}</p>
                  <span className="text-xs text-[#676986]">
                    by {decision.approvedBy} • {decision.approvedAt && format(new Date(decision.approvedAt), "MMM d")}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Strategy Documents Link */}
      <Card className="mt-6 bg-gradient-to-r from-[#65cdd8]/10 to-transparent border-[#65cdd8]/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#65cdd8]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[#65cdd8]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2">Strategy Documents</h4>
            <p className="text-sm text-[#a8a8a8] mb-3">
              Deep-dive strategy documents that feed into this master plan. Each owned by a domain expert.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/strategies">
                <Button size="sm" variant="ghost" className="border border-[#65cdd8]/30 text-[#65cdd8] hover:bg-[#65cdd8]/10">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View All Strategies
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/strategies/capital-strategy-2026">
                <Badge variant="success" className="cursor-pointer hover:opacity-80">
                  Capital Strategy 2026 — Active
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Integration Note */}
      <Card className="mt-6 bg-gradient-to-r from-[#8533fc]/20 to-transparent border-[#8533fc]/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8533fc]/20 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-[#8533fc]" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">AI Operating System Integration</h4>
            <p className="text-sm text-[#a8a8a8] mb-3">
              All AI systems, summaries, recommendations, dashboards, and decision support reason inside this document.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" size="sm">Reason only inside this plan</Badge>
              <Badge variant="default" size="sm">Flag violations of the Growth Generator</Badge>
              <Badge variant="default" size="sm">Optimize for contribution margin first</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
