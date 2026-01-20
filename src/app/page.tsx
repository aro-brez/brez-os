"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useMomentumData, saveOverrides, DataOverrides } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

export default function CommandCenter() {
  const data = useMomentumData();
  const rec = data.recommendation;
  const [showUpdate, setShowUpdate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // January 2026 - Real numbers
  const monthlyTarget = {
    revenue: 3300000,      // $3.3M total target
    dtcRevenue: 1650000,   // Half from DTC
    retailRevenue: 1650000, // Half from retail
  };

  // Current month actuals
  const daysInMonth = 31;
  const daysLeft = 10;
  const daysElapsed = daysInMonth - daysLeft; // 21 days

  // On track for $2.4M at current pace
  const projectedRevenue = 2400000;
  const pacePercent = daysElapsed / daysInMonth;
  const currentRevenue = projectedRevenue * pacePercent; // ~$1.63M so far

  const currentMonth = {
    revenue: currentRevenue,
    daysElapsed,
    daysInMonth,
  };

  // Calculate pacing
  const expectedByNow = monthlyTarget.revenue * pacePercent;
  const revenueOnTrack = currentMonth.revenue >= expectedByNow * 0.95;

  // Will we hit target?
  const willHitTarget = projectedRevenue >= monthlyTarget.revenue * 0.95;

  // Gap to close
  const revenueGap = monthlyTarget.revenue - projectedRevenue; // $3.3M - $2.4M = $900K gap
  const customersNeeded = revenueGap > 0 ? Math.ceil(revenueGap / (rec.firstOrderAOV || 150)) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 pb-32">

      {/* HEADER - Simple */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">BREZ Command Center</h1>
          <p className="text-white/40 text-sm">January 2026</p>
        </div>
        <button
          onClick={() => setShowUpdate(true)}
          className="flex items-center gap-2 text-purple-300 text-sm hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
          Update
        </button>
      </div>

      {/* ========== THE SCOREBOARD ========== */}
      <div className="mb-8">
        {/* Main Score */}
        <div className="bg-white/5 rounded-2xl p-6 mb-4">
          <div className="text-white/50 text-sm mb-2">REVENUE THIS MONTH</div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-white">${(currentMonth.revenue / 1000).toFixed(0)}K</span>
            <span className="text-white/40 text-xl mb-2">/ ${(monthlyTarget.revenue / 1000).toFixed(0)}K goal</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${revenueOnTrack ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min((currentMonth.revenue / monthlyTarget.revenue) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-sm">
            <span className="text-white/50">{Math.round((currentMonth.revenue / monthlyTarget.revenue) * 100)}% of goal</span>
            <span className="text-white/50">{currentMonth.daysElapsed} days in</span>
          </div>
        </div>

        {/* Supporting Numbers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/50 text-xs">CUSTOMERS</div>
            <div className="text-2xl font-bold text-white">{currentMonth.customers.toLocaleString()}</div>
            <div className="text-white/40 text-xs">/ {monthlyTarget.customers.toLocaleString()} goal</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/50 text-xs">SUBSCRIBERS</div>
            <div className="text-2xl font-bold text-white">{currentMonth.subscribers.toLocaleString()}</div>
            <div className="text-white/40 text-xs">/ {monthlyTarget.subscribers.toLocaleString()} goal</div>
          </div>
        </div>
      </div>

      {/* ========== ARE WE ON TRACK? ========== */}
      <div className={`rounded-2xl p-5 mb-6 ${
        willHitTarget
          ? 'bg-green-500/10 border border-green-500/30'
          : 'bg-amber-500/10 border border-amber-500/30'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          {willHitTarget ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-bold text-lg">On Track</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-bold text-lg">Behind Pace</span>
            </>
          )}
        </div>

        {willHitTarget ? (
          <p className="text-white/70">
            At current pace, we&apos;ll hit <span className="text-green-400 font-medium">${(projected.revenue / 1000).toFixed(0)}K</span> by end of month.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-white/70">
              At current pace, we&apos;ll only hit <span className="text-amber-400 font-medium">${(projected.revenue / 1000).toFixed(0)}K</span>.
              <br />
              That&apos;s <span className="text-amber-400 font-medium">${(Math.abs(revenueGap) / 1000).toFixed(0)}K short</span> of our ${(monthlyTarget.revenue / 1000).toFixed(0)}K goal.
            </p>
          </div>
        )}
      </div>

      {/* ========== WHAT NEEDS TO CHANGE ========== */}
      {!willHitTarget && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="text-white font-bold mb-4">TO HIT OUR GOAL:</div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-xl">
              <div>
                <div className="text-white font-medium">Get {customersNeeded.toLocaleString()} more customers</div>
                <div className="text-white/50 text-sm">In the next {currentMonth.daysInMonth - currentMonth.daysElapsed} days</div>
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="text-white/50 text-sm text-center">↓ which means ↓</div>

            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-xl">
              <div>
                <div className="text-white font-medium">Spend ${(rec.investAmount / 1000).toFixed(0)}K/week on ads</div>
                <div className="text-white/50 text-sm">At ${data.economics.cac.toFixed(0)} CAC = {rec.expectedCustomers} customers/week</div>
              </div>
              <div className="text-purple-400 font-bold">${(rec.investAmount / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== THE PLAY ========== */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5 mb-6">
        <div className="text-purple-300 text-sm mb-2">THIS WEEK&apos;S PLAY</div>

        <div className="text-white text-xl font-bold mb-4">
          Invest ${(rec.investAmount / 1000).toFixed(0)}K in DTC Ads
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-cyan-400 text-xl font-bold">{rec.expectedCustomers}</div>
            <div className="text-white/50 text-xs">new customers</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-green-400 text-xl font-bold">{rec.expectedSubscribers}</div>
            <div className="text-white/50 text-xs">subscribers</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-amber-400 text-xl font-bold">{rec.paybackWeeks}wk</div>
            <div className="text-white/50 text-xs">to profit</div>
          </div>
        </div>

        {/* Can we afford it? */}
        <div className={`mt-4 p-3 rounded-xl ${
          data.cashHeadroom >= rec.investAmount
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Cash available:</span>
            <span className={`font-bold ${data.cashHeadroom >= rec.investAmount ? 'text-green-400' : 'text-red-400'}`}>
              ${(data.cashHeadroom / 1000).toFixed(0)}K
            </span>
          </div>
          {data.cashHeadroom < rec.investAmount && (
            <div className="text-red-400/70 text-sm mt-1">
              Need ${((rec.investAmount - data.cashHeadroom) / 1000).toFixed(0)}K more to execute this play
            </div>
          )}
        </div>
      </div>

      {/* ========== QUICK STATS ========== */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm">CAC</span>
            {data.trajectory === 'gaining' ? (
              <TrendingDown className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">${data.economics.cac.toFixed(0)}</div>
          <div className="text-white/40 text-xs">cost per customer</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm">LTV:CAC</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data.economics.ltvCacRatio}x</div>
          <div className="text-white/40 text-xs">return on each customer</div>
        </div>
      </div>

      {/* ========== CASH POSITION ========== */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <div className="text-white/50 text-sm mb-3">CASH POSITION</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Cash on hand</span>
            <span className="text-white font-mono">${(data.cash.current / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Reserve floor</span>
            <span className="text-white/50 font-mono">${(data.cash.floor / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span className="text-white/70">Available to invest</span>
            <span className="text-cyan-400 font-mono font-bold">${(data.cashHeadroom / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Runway</span>
            <span className="text-white font-mono">{data.cash.runwayWeeks} weeks</span>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdate && (
        <QuickUpdateModal
          currentData={data}
          onClose={() => setShowUpdate(false)}
        />
      )}

      {/* Owl */}
      <OwlPopup />
    </div>
  );
}

// Quick Update Modal
function QuickUpdateModal({
  currentData,
  onClose
}: {
  currentData: ReturnType<typeof useMomentumData>;
  onClose: () => void;
}) {
  const [values, setValues] = useState({
    cashOnHand: currentData.cash.current,
    cac: currentData.economics.cac,
    weeklySpend: currentData.recommendation.investAmount,
  });

  const handleSave = () => {
    const overrides: DataOverrides = {
      cashOnHand: values.cashOnHand,
      cac: values.cac,
      weeklySpend: values.weeklySpend,
    };
    saveOverrides(overrides);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full">
        <div className="text-white font-bold text-lg mb-4">Update Numbers</div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-white/50 text-sm">Cash on hand</label>
            <input
              type="number"
              value={values.cashOnHand}
              onChange={(e) => setValues({ ...values, cashOnHand: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-xl font-mono mt-1"
            />
          </div>
          <div>
            <label className="text-white/50 text-sm">Current CAC</label>
            <input
              type="number"
              value={values.cac}
              onChange={(e) => setValues({ ...values, cac: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-xl font-mono mt-1"
            />
          </div>
          <div>
            <label className="text-white/50 text-sm">Weekly ad spend</label>
            <input
              type="number"
              value={values.weeklySpend}
              onChange={(e) => setValues({ ...values, weeklySpend: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-xl font-mono mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 rounded-xl text-white/60">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-3 bg-purple-600 rounded-xl text-white font-medium">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
