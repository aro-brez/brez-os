"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Target, Users, ShoppingCart, ArrowRight, ArrowDown, Zap, RefreshCw } from "lucide-react";
import { useMomentumData, Lever } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

export default function MomentumCommandCenter() {
  const router = useRouter();
  const data = useMomentumData();
  const rec = data.recommendation;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] p-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-lg font-semibold">BREZ Command Center</h1>
          <p className="text-purple-300/50 text-xs">Data as of {data.lastUpdated}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          data.trajectory === 'gaining' ? 'bg-green-500/20 text-green-400' :
          data.trajectory === 'losing' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {data.trajectory === 'gaining' ? '↑ GAINING' : data.trajectory === 'losing' ? '↓ LOSING' : '→ STEADY'}
        </div>
      </div>

      {/* THE RECOMMENDATION - Hero */}
      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-5 mb-4">
        <div className="text-purple-300/60 text-xs mb-2">THIS WEEK&apos;S RECOMMENDATION</div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-white">Invest ${(rec.investAmount / 1000).toFixed(0)}K</span>
          <span className="text-purple-300">in {rec.investWhere}</span>
        </div>

        {/* The Flywheel */}
        <div className="bg-black/20 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-2xl font-mono text-cyan-400">{rec.expectedCustomers}</div>
              <div className="text-purple-300/50 text-xs">customers</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-green-400">{rec.expectedSubscribers}</div>
              <div className="text-purple-300/50 text-xs">subscribers</div>
              <div className="text-purple-300/40 text-xs">({(rec.expectedSubscribers / rec.expectedCustomers * 100).toFixed(0)}%)</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-amber-400">${(rec.totalLTVProfit / 1000).toFixed(0)}K</div>
              <div className="text-purple-300/50 text-xs">LTV profit</div>
              <div className="text-purple-300/40 text-xs">(12mo)</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-purple-400">+${(rec.retailLiftWeekly / 1000).toFixed(1)}K</div>
              <div className="text-purple-300/50 text-xs">retail/wk</div>
              <div className="text-purple-300/40 text-xs">({rec.retailLiftLagWeeks}wk lag)</div>
            </div>
          </div>
        </div>

        {/* Key Numbers */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-white font-mono">${rec.firstOrderAOV}</div>
            <div className="text-purple-300/40 text-xs">1st AOV</div>
          </div>
          <div>
            <div className="text-white font-mono">${rec.subAOV}</div>
            <div className="text-purple-300/40 text-xs">Sub AOV</div>
          </div>
          <div>
            <div className="text-white font-mono">{rec.paybackMonths}mo</div>
            <div className="text-purple-300/40 text-xs">Payback</div>
          </div>
          <div>
            <div className="text-white font-mono">${rec.subscriberLTV}</div>
            <div className="text-purple-300/40 text-xs">Sub LTV</div>
          </div>
        </div>
      </div>

      {/* WORKING CAPITAL STATUS */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-purple-300/60 text-xs mb-1">CAN WE INVEST?</div>
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
            <div className="text-purple-300/60 text-xs">Cash</div>
            <div className="text-white font-mono">${(data.cash.current / 1000).toFixed(0)}K</div>
          </div>
          <div className="text-right">
            <div className="text-purple-300/60 text-xs">Runway</div>
            <div className="text-white font-mono">{data.cash.runwayWeeks}wk</div>
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

      {/* THE FLYWHEEL - Visual */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="text-purple-300/60 text-xs mb-3">THE FLYWHEEL</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg">DTC Spend</div>
          <ArrowRight className="w-4 h-4 text-purple-400" />
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg">Customers</div>
          <ArrowRight className="w-4 h-4 text-purple-400" />
          <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg">Subs + LTV</div>
        </div>
        <div className="flex items-center justify-center mt-2">
          <RefreshCw className="w-4 h-4 text-purple-400 mr-2" />
          <span className="text-purple-300/50 text-xs">+ Retail Velocity (6wk lag) → Reinvest</span>
        </div>
      </div>

      {/* AP/LOAN STATUS - Compact */}
      <div className="bg-white/5 border border-purple-500/20 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-purple-300/50">AP: <span className="text-amber-400 font-mono">${(data.cash.apTotal / 1000000).toFixed(1)}M</span></div>
          <div className="text-purple-300/30">|</div>
          <div className="text-purple-300/50">Loan Avail: <span className="text-green-400 font-mono">${(data.cash.loanAvailable / 1000000).toFixed(1)}M</span></div>
          <div className="text-purple-300/30">|</div>
          <div className="text-purple-300/50">LTV:CAC: <span className="text-white font-mono">{data.economics.ltvCacRatio}x</span></div>
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
