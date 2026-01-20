"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, DollarSign, Target, Users, ShoppingCart, ArrowRight, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useMomentumData, Lever } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

export default function MomentumCommandCenter() {
  const router = useRouter();
  const data = useMomentumData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] p-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-semibold">BREZ Command Center</h1>
          <p className="text-purple-300/50 text-xs">Data as of {data.lastUpdated}</p>
        </div>
      </div>

      {/* 1. MOMENTUM TRAJECTORY - Hero */}
      <div className={`rounded-2xl p-6 mb-4 border ${
        data.trajectory === 'gaining'
          ? 'bg-green-500/10 border-green-500/30'
          : data.trajectory === 'losing'
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.trajectory === 'gaining' && <TrendingUp className="w-8 h-8 text-green-400" />}
            {data.trajectory === 'losing' && <TrendingDown className="w-8 h-8 text-red-400" />}
            {data.trajectory === 'stable' && <Minus className="w-8 h-8 text-yellow-400" />}
            <div>
              <div className={`text-2xl font-bold ${
                data.trajectory === 'gaining' ? 'text-green-400' :
                data.trajectory === 'losing' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {data.trajectory === 'gaining' ? 'GAINING MOMENTUM' :
                 data.trajectory === 'losing' ? 'LOSING MOMENTUM' : 'HOLDING STEADY'}
              </div>
              <div className="text-purple-300/70 text-sm">{data.trajectoryReason}</div>
            </div>
          </div>
          <div className={`text-xl font-mono ${data.trajectoryPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.trajectoryPercent >= 0 ? '+' : ''}{data.trajectoryPercent}%
          </div>
        </div>
      </div>

      {/* 2. CAN WE INVEST MORE? */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-purple-300/60 text-xs mb-1">CAN WE INVEST MORE?</div>
            <div className={`text-lg font-bold ${
              data.canInvestMore === 'yes' ? 'text-green-400' :
              data.canInvestMore === 'caution' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {data.canInvestMore === 'yes' ? 'YES' :
               data.canInvestMore === 'caution' ? 'CAUTION' : 'NO'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-purple-300/60 text-xs">Headroom</div>
            <div className="text-white font-mono">${(data.cashHeadroom / 1000).toFixed(0)}K</div>
          </div>
          <div className="text-right">
            <div className="text-purple-300/60 text-xs">Max Weekly Spend</div>
            <div className="text-white font-mono">${(data.weeklySpendCeiling / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </div>

      {/* 3. THE 4 LEVERS THAT MATTER */}
      <div className="mb-4">
        <div className="text-purple-300/60 text-xs mb-2 px-1">LEVERS THAT MATTER MOST</div>
        <div className="space-y-2">
          {data.levers.map((lever, i) => (
            <LeverCard key={lever.name} lever={lever} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* 4. THE CHAIN: DTC → Demand → Retail */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="text-purple-300/60 text-xs mb-3">THE CHAIN: DTC SPEND → DEMAND → RETAIL VELOCITY</div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-white font-mono text-lg">${(data.chain.dtcWeeklySpend / 1000).toFixed(0)}K</div>
            <div className="text-purple-300/50 text-xs">DTC/wk</div>
          </div>
          <div className="flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-purple-400" />
            <div className="text-purple-400 text-xs">{data.chain.demandLagWeeks}wk lag</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono text-lg">Demand</div>
            <div className="text-purple-300/50 text-xs">builds</div>
          </div>
          <div className="flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-purple-400" />
            <div className="text-purple-400 text-xs">{data.chain.retailLagWeeks}wk lag</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono text-lg">${(data.chain.retailWeeklyVelocity / 1000).toFixed(0)}K</div>
            <div className="text-purple-300/50 text-xs">Retail/wk</div>
          </div>
        </div>
        <div className="mt-3 text-center text-purple-300/40 text-xs">
          Alpha: {(data.chain.alpha * 100).toFixed(1)}% retail revenue per $1 ad spend
        </div>
      </div>

      {/* 5. CASH GUARDRAILS */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="text-purple-300/60 text-xs mb-3">CASH GUARDRAILS</div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <div className="text-purple-300/50 text-xs">Cash</div>
            <div className="text-white font-mono">${(data.cash.current / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div className="text-purple-300/50 text-xs">Floor</div>
            <div className="text-white font-mono">${(data.cash.floor / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div className="text-purple-300/50 text-xs">Runway</div>
            <div className="text-white font-mono">{data.cash.runwayWeeks}wk</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-purple-300/50 text-xs">AP Total</div>
            <div className="text-amber-400 font-mono">${(data.cash.apTotal / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-purple-300/50 text-xs">Loan Available</div>
            <div className="text-green-400 font-mono">${(data.cash.loanAvailable / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      {/* 6. UNIT ECONOMICS / LTV */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-6">
        <div className="text-purple-300/60 text-xs mb-3">UNIT ECONOMICS</div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-white font-mono text-lg">${data.economics.cac.toFixed(0)}</div>
            <div className="text-purple-300/50 text-xs">CAC</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono text-lg">{data.economics.paybackMonths}mo</div>
            <div className="text-purple-300/50 text-xs">Payback</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono text-lg">{data.economics.ltvCacRatio}x</div>
            <div className="text-purple-300/50 text-xs">LTV:CAC</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono text-lg">{(data.economics.contributionMargin * 100).toFixed(0)}%</div>
            <div className="text-purple-300/50 text-xs">CM</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={() => router.push("/growth")}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 px-4 text-left flex items-center justify-between transition-colors"
        >
          <span>Run Scenario Simulation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push("/tasks")}
          className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 px-4 text-left flex items-center justify-between border border-purple-500/20 transition-colors"
        >
          <span>View Priority Stack</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Owl Chatbot */}
      <OwlPopup />
    </div>
  );
}

function LeverCard({ lever, rank }: { lever: Lever; rank: number }) {
  const icons = {
    ads: <Zap className="w-4 h-4" />,
    conversion: <Target className="w-4 h-4" />,
    retention: <Users className="w-4 h-4" />,
    retail: <ShoppingCart className="w-4 h-4" />,
  };

  const colors = {
    ads: 'text-amber-400',
    conversion: 'text-cyan-400',
    retention: 'text-green-400',
    retail: 'text-purple-400',
  };

  return (
    <div className="bg-white/5 border border-purple-500/15 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 ${colors[lever.category]}`}>
            {icons[lever.category]}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{lever.name}</div>
            <div className="text-purple-300/50 text-xs">
              {lever.currentDisplay} → {lever.targetDisplay}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-400 text-sm font-mono">+${(lever.impact / 1000).toFixed(0)}K</div>
          <div className="text-purple-300/40 text-xs">/mo impact</div>
        </div>
      </div>
    </div>
  );
}
