"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  AlertTriangle,
  Zap,
  Clock,
  Users,
  Check,
  Plus,
  ChevronRight,
  Shield,
  RefreshCw,
  Play,
  Heart,
  Database,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, Badge, Button, ProgressBar } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { useToast } from "@/components/ui/Toast";
import { useAIAssistant } from "@/components/ui/AIAssistant";
import {
  getTheOneThing,
  getDataHealth,
  getRealMetrics,
  getAvailableXP,
  type SpecificAction,
  type DataHealth,
} from "@/lib/ai/brez-intelligence";
import {
  RALPH_PARADOX,
  CURRENT_STATE,
} from "@/lib/data/source-of-truth";

export default function CommandCenter() {
  const [theOneThing, setTheOneThing] = useState<SpecificAction | null>(null);
  const [dataHealth, setDataHealth] = useState<DataHealth[]>([]);
  const [availableXP, setAvailableXP] = useState<{ total: number; breakdown: { category: string; xp: number }[] }>({ total: 0, breakdown: [] });
  const [metrics, setMetrics] = useState<ReturnType<typeof getRealMetrics> | null>(null);
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });
  const [expandedAction, setExpandedAction] = useState(true);
  const [expandedDataHealth, setExpandedDataHealth] = useState(false);
  const { celebrate } = useToast();
  const { toggle: toggleAI } = useAIAssistant();

  useEffect(() => {
    // Time-aware greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good morning", emoji: "☀️" });
    else if (hour < 17) setGreeting({ text: "Good afternoon", emoji: "🌤️" });
    else if (hour < 21) setGreeting({ text: "Good evening", emoji: "🌙" });
    else setGreeting({ text: "Burning midnight oil", emoji: "🦉" });

    // Load BREZ intelligence
    setTheOneThing(getTheOneThing());
    setDataHealth(getDataHealth());
    setAvailableXP(getAvailableXP());
    setMetrics(getRealMetrics());
  }, []);

  const currentUser = devStore.getCurrentUser();

  const getUrgencyColor = (urgency: SpecificAction["urgency"]) => {
    switch (urgency) {
      case "critical": return "bg-red-500/20 border-red-500/50 text-red-400";
      case "high": return "bg-orange-500/20 border-orange-500/50 text-orange-400";
      case "medium": return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      default: return "bg-blue-500/20 border-blue-500/50 text-blue-400";
    }
  };

  const getStatusColor = (status: DataHealth["status"]) => {
    switch (status) {
      case "fresh": return "text-green-400";
      case "stale": return "text-yellow-400";
      case "missing": return "text-red-400";
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* BREZ Logo */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center">
              <span className="text-[#0D0D2A] font-bold text-lg md:text-xl">B</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                {greeting.emoji} {greeting.text}, {currentUser.name.split(" ")[0]}
              </h1>
              <p className="text-xs md:text-sm text-[#676986]">
                {format(new Date(), "EEEE, MMMM d")} • {CURRENT_STATE.currentScenario.toUpperCase()} Phase
              </p>
            </div>
          </div>
          <Link href="/plan" className="hidden md:block">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ffce33]" />
              <span>Stabilize</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* THE ONE THING - Hero Card */}
      {theOneThing && (
        <Card className="mb-4 md:mb-6 overflow-hidden border-2 border-[#e3f98a]/40 bg-gradient-to-br from-[#e3f98a]/10 via-[#0D0D2A] to-transparent">
          <div
            className="p-4 md:p-6 cursor-pointer"
            onClick={() => setExpandedAction(!expandedAction)}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#e3f98a] flex items-center justify-center">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#0D0D2A]" />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-bold text-[#e3f98a] uppercase tracking-wider">
                    Your ONE Thing Right Now
                  </span>
                  <Badge className={`ml-2 text-xs ${getUrgencyColor(theOneThing.urgency)}`}>
                    {theOneThing.urgency}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" className="hidden md:flex">
                  +{theOneThing.xpReward} XP
                </Badge>
                {expandedAction ? <ChevronUp className="w-5 h-5 text-[#676986]" /> : <ChevronDown className="w-5 h-5 text-[#676986]" />}
              </div>
            </div>

            {/* Action Title */}
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2">
              {theOneThing.action}
            </h2>

            {/* Quick Info Row */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-[#a8a8a8] mb-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 md:w-4 md:h-4" /> {theOneThing.owner}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" /> {theOneThing.timeEstimate}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 md:w-4 md:h-4" /> {theOneThing.metric}
              </span>
            </div>

            {/* Expandable Steps */}
            {expandedAction && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs md:text-sm font-semibold text-[#e3f98a] mb-3 uppercase tracking-wider">
                  Specific Steps:
                </p>
                <div className="space-y-2">
                  {theOneThing.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 md:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#e3f98a]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#e3f98a]">{i + 1}</span>
                      </div>
                      <p className="text-sm md:text-base text-white">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-4 flex flex-col md:flex-row gap-2">
                  <Button
                    variant="primary"
                    className="w-full md:w-auto flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      celebrate(`Started: ${theOneThing.action}`);
                    }}
                  >
                    <Play className="w-4 h-4" /> Start This Now
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full md:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAI();
                    }}
                  >
                    Ask AI for Help
                  </Button>
                </div>

                {/* Ralph Paradox - Encouragement */}
                <div className="mt-4 p-3 rounded-lg bg-[#8533fc]/10 border border-[#8533fc]/20">
                  <p className="text-xs md:text-sm text-[#8533fc] italic">
                    💡 {RALPH_PARADOX.application}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats - Mobile Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <Link href="/financials">
            <Card className="p-3 md:p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <DollarSign className={`w-4 h-4 md:w-5 md:h-5 ${metrics.cash.status === 'healthy' ? 'text-[#6BCB77]' : 'text-[#ff6b6b]'}`} />
                <span className={`text-lg md:text-2xl font-bold ${metrics.cash.status === 'healthy' ? 'text-[#6BCB77]' : 'text-[#ff6b6b]'}`}>
                  ${(metrics.cash.onHand / 1000).toFixed(0)}K
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#676986]">Cash ({metrics.cash.runway}wk runway)</p>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="p-3 md:p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <TrendingUp className={`w-4 h-4 md:w-5 md:h-5 ${metrics.dtc.contributionMargin >= metrics.dtc.target ? 'text-[#6BCB77]' : 'text-[#ffce33]'}`} />
                <span className="text-lg md:text-2xl font-bold text-white">
                  {(metrics.dtc.contributionMargin * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#676986]">DTC CM (target {(metrics.dtc.target * 100).toFixed(0)}%)</p>
            </Card>
          </Link>

          <Card className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <AlertTriangle className={`w-4 h-4 md:w-5 md:h-5 ${metrics.ap.stopShipRisks > 0 ? 'text-[#ff6b6b]' : 'text-[#6BCB77]'}`} />
              <span className={`text-lg md:text-2xl font-bold ${metrics.ap.stopShipRisks > 0 ? 'text-[#ff6b6b]' : 'text-white'}`}>
                {metrics.ap.stopShipRisks}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#676986]">Stop-Ship Risks</p>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#65cdd8]" />
              <span className="text-lg md:text-2xl font-bold text-white">
                ${metrics.dtc.cac}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#676986]">CAC (max ${metrics.dtc.maxCAC})</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Data Health & XP */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Data Health Card */}
          <Card padding="none">
            <div
              className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedDataHealth(!expandedDataHealth)}
            >
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#65cdd8]" />
                <h3 className="font-semibold text-white">Data Health</h3>
                {availableXP.total > 0 && (
                  <Badge variant="warning" size="sm" className="flex items-center gap-1">
                    <Gift className="w-3 h-3" /> {availableXP.total} XP available
                  </Badge>
                )}
              </div>
              {expandedDataHealth ? <ChevronUp className="w-5 h-5 text-[#676986]" /> : <ChevronDown className="w-5 h-5 text-[#676986]" />}
            </div>

            {expandedDataHealth && (
              <div className="divide-y divide-white/5">
                {dataHealth.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{item.category}</h4>
                          <span className={`text-xs font-semibold uppercase ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#676986]">{item.howToUpdate}</p>
                        {item.lastUpdated && (
                          <p className="text-xs text-[#676986] mt-1">
                            Last updated: {format(new Date(item.lastUpdated), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <ProgressBar value={item.freshness} max={100} variant={item.freshness > 70 ? "success" : item.freshness > 30 ? "warning" : "danger"} className="w-20" />
                        {item.xpReward > 0 && (
                          <Button variant="secondary" size="sm" className="text-xs">
                            Update +{item.xpReward} XP
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!expandedDataHealth && availableXP.total > 0 && (
              <div className="p-4">
                <p className="text-sm text-[#a8a8a8]">
                  {dataHealth.filter(d => d.status !== 'fresh').length} data sources need updating.
                  Earn <span className="text-[#e3f98a] font-semibold">{availableXP.total} XP</span> by keeping data fresh!
                </p>
              </div>
            )}
          </Card>

          {/* Active Priorities */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e3f98a]" />
                <h3 className="font-semibold text-white">Active Priorities</h3>
                <Badge variant="info" size="sm">{CURRENT_STATE.activePriorities.length}/3 max</Badge>
              </div>
              <Link href="/plan" className="text-sm text-[#65cdd8] hover:underline">
                Manage <ChevronRight className="w-4 h-4 inline" />
              </Link>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {CURRENT_STATE.activePriorities.map((priority, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#e3f98a]/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#e3f98a]">{i + 1}</span>
                    </div>
                    <span className="text-white">{priority}</span>
                  </div>
                ))}
              </div>
              {CURRENT_STATE.activePriorities.length >= 3 && (
                <p className="text-xs text-[#ffce33] mt-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  WIP limit reached. Complete or pause before adding new priorities.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Phase & Growth Generator */}
          <Card className="border-2 border-[#e3f98a]/20">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#ffce33]" />
              <h3 className="font-semibold text-white">Phase: STABILIZE</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#ffce33]/10 border border-[#ffce33]/20">
                <p className="text-xs text-[#ffce33]">
                  Focus: Preserve cash, maximize CM, contain AP
                </p>
              </div>

              <div className="text-xs text-[#676986] space-y-1">
                <p className="font-semibold text-white mb-2">Exit to THRIVE when:</p>
                <p className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#6BCB77]" /> AP under active management
                </p>
                <p className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" /> Cash reserves &gt; $500k (4 weeks)
                </p>
                <p className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" /> DTC CM &gt; 35%
                </p>
                <p className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" /> +20% DTC at same spend
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Mobile Optimized */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/growth">
                <Button variant="secondary" size="sm" className="w-full justify-start text-xs md:text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="truncate">Growth Sim</span>
                </Button>
              </Link>
              <Link href="/tasks?new=true">
                <Button variant="secondary" size="sm" className="w-full justify-start text-xs md:text-sm">
                  <Plus className="w-4 h-4" />
                  <span className="truncate">New Task</span>
                </Button>
              </Link>
              <Link href="/financials">
                <Button variant="secondary" size="sm" className="w-full justify-start text-xs md:text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span className="truncate">Financials</span>
                </Button>
              </Link>
              <Link href="/channels">
                <Button variant="secondary" size="sm" className="w-full justify-start text-xs md:text-sm">
                  <Users className="w-4 h-4" />
                  <span className="truncate">Team</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Purpose Reminder */}
          <Card className="border-2 border-[#8533fc]/20 bg-gradient-to-br from-[#8533fc]/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-[#8533fc]" />
              <h3 className="font-semibold text-white">Remember</h3>
            </div>
            <p className="text-sm text-[#a8a8a8] italic">
              &ldquo;You&apos;re building a $200B company that proves conscious capitalism wins.&rdquo;
            </p>
            <p className="text-xs text-[#8533fc] mt-3">
              {RALPH_PARADOX.principle}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
