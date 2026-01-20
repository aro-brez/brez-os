"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useMomentumData, saveOverrides, DataOverrides } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

// Format number as millions (e.g., 1629000 → "$1.63M")
function formatM(value: number): string {
  return `$${(value / 1000000).toFixed(2)}M`;
}

// Format smaller numbers as K
function formatK(value: number): string {
  return `$${(value / 1000).toFixed(0)}K`;
}

export default function CommandCenter() {
  const data = useMomentumData();
  const rec = data.recommendation;
  const [showUpdate, setShowUpdate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem('brez-onboarding-complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('brez-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

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

  // Estimate customers and subscribers based on AOV
  const avgOrderValue = rec.firstOrderAOV || 150;
  const estimatedCustomers = Math.round(currentRevenue / avgOrderValue);
  const targetCustomers = Math.round(monthlyTarget.revenue / avgOrderValue);
  const subConversionRate = 0.50; // 50% subscribe
  const estimatedSubscribers = Math.round(estimatedCustomers * subConversionRate);
  const targetSubscribers = Math.round(targetCustomers * subConversionRate);

  const currentMonth = {
    revenue: currentRevenue,
    daysElapsed,
    daysInMonth,
    customers: estimatedCustomers,
    subscribers: estimatedSubscribers,
  };

  const monthlyTargetWithCounts = {
    ...monthlyTarget,
    customers: targetCustomers,
    subscribers: targetSubscribers,
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
            <span className="text-5xl font-bold text-white">{formatM(currentMonth.revenue)}</span>
            <span className="text-white/40 text-xl mb-2">/ {formatM(monthlyTarget.revenue)} goal</span>
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
            <div className="text-white/40 text-xs">/ {monthlyTargetWithCounts.customers.toLocaleString()} goal</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/50 text-xs">SUBSCRIBERS</div>
            <div className="text-2xl font-bold text-white">{currentMonth.subscribers.toLocaleString()}</div>
            <div className="text-white/40 text-xs">/ {monthlyTargetWithCounts.subscribers.toLocaleString()} goal</div>
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
            At current pace, we&apos;ll hit <span className="text-green-400 font-medium">{formatM(projectedRevenue)}</span> by end of month.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-white/70">
              At current pace, we&apos;ll only hit <span className="text-amber-400 font-medium">{formatM(projectedRevenue)}</span>.
              <br />
              That&apos;s <span className="text-amber-400 font-medium">{formatM(Math.abs(revenueGap))} short</span> of our {formatM(monthlyTarget.revenue)} goal.
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
                <div className="text-white font-medium">Spend {formatK(rec.investAmount)}/week on ads</div>
                <div className="text-white/50 text-sm">At ${data.economics.cac.toFixed(0)} CAC = {rec.expectedCustomers} customers/week</div>
              </div>
              <div className="text-purple-400 font-bold">{formatK(rec.investAmount)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== THE PLAY ========== */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5 mb-6">
        <div className="text-purple-300 text-sm mb-2">THIS WEEK&apos;S PLAY</div>

        <div className="text-white text-xl font-bold mb-4">
          Invest {formatK(rec.investAmount)} in DTC Ads
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
              {formatK(data.cashHeadroom)}
            </span>
          </div>
          {data.cashHeadroom < rec.investAmount && (
            <div className="text-red-400/70 text-sm mt-1">
              Need {formatK(rec.investAmount - data.cashHeadroom)} more to execute this play
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
            <span className="text-white font-mono">{formatK(data.cash.current)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Reserve floor</span>
            <span className="text-white/50 font-mono">{formatK(data.cash.floor)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span className="text-white/70">Available to invest</span>
            <span className="text-cyan-400 font-mono font-bold">{formatK(data.cashHeadroom)}</span>
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

      {/* First-time User Onboarding */}
      {showOnboarding && (
        <OnboardingOverlay
          step={onboardingStep}
          onNext={() => setOnboardingStep(s => s + 1)}
          onPrev={() => setOnboardingStep(s => s - 1)}
          onComplete={completeOnboarding}
        />
      )}
    </div>
  );
}

// Onboarding steps configuration with visual previews
const onboardingSteps = [
  {
    title: "Welcome to BREZ Command Center",
    description: "Your single source of truth. One screen. Everything you need to know about how the business is doing.",
    icon: "🎯",
    preview: null,
  },
  {
    title: "1. The Scoreboard",
    description: "This is where we are RIGHT NOW. Revenue earned this month vs our goal. The progress bar shows how close we are.",
    icon: "📊",
    preview: "scoreboard",
  },
  {
    title: "2. Are We On Track?",
    description: "Simple answer: Green = we're good. Amber = we need to move faster. Shows projected end-of-month revenue.",
    icon: "🚦",
    preview: "pacing",
  },
  {
    title: "3. What Needs To Change",
    description: "If we're behind, this tells you EXACTLY what to do. How many more customers and how much ad spend to close the gap.",
    icon: "🎯",
    preview: "action",
  },
  {
    title: "4. This Week's Play",
    description: "The recommended action for THIS WEEK. Investment amount, expected customers, subscribers, and time to profit.",
    icon: "💰",
    preview: "play",
  },
  {
    title: "5. Ask Owl Anything",
    description: "Have questions? Click the owl in the corner. It knows all the metrics and can explain anything on this dashboard.",
    icon: "🦉",
    preview: "owl",
  },
];

function OnboardingOverlay({
  step,
  onNext,
  onPrev,
  onComplete,
}: {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}) {
  const currentStep = onboardingSteps[step];
  const isLastStep = step === onboardingSteps.length - 1;
  const isFirstStep = step === 0;

  // Mini preview components for each step
  const renderPreview = () => {
    switch (currentStep.preview) {
      case "scoreboard":
        return (
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="text-white/50 text-xs mb-1">REVENUE THIS MONTH</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">$1.63M</span>
              <span className="text-white/40 text-sm">/ $3.30M goal</span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[49%] bg-amber-500 rounded-full" />
            </div>
            <div className="text-white/40 text-xs mt-1">49% of goal • 21 days in</div>
          </div>
        );
      case "pacing":
        return (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold">Behind Pace</span>
            </div>
            <p className="text-white/70 text-sm">
              At current pace, we&apos;ll hit <span className="text-amber-400">$2.40M</span>.
              That&apos;s <span className="text-amber-400">$0.90M short</span>.
            </p>
          </div>
        );
      case "action":
        return (
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="text-white font-bold text-sm mb-2">TO HIT OUR GOAL:</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-cyan-500/10 rounded-lg">
                <span className="text-white text-sm">Get 6,000 more customers</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-white/50 text-xs text-center">↓</div>
              <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                <span className="text-white text-sm">Spend $50K/week on ads</span>
                <span className="text-purple-400 font-bold text-sm">$50K</span>
              </div>
            </div>
          </div>
        );
      case "play":
        return (
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-4 mb-4">
            <div className="text-purple-300 text-xs mb-1">THIS WEEK&apos;S PLAY</div>
            <div className="text-white font-bold mb-2">Invest $50K in DTC Ads</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-cyan-400 font-bold">667</div>
                <div className="text-white/50 text-[10px]">customers</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-green-400 font-bold">333</div>
                <div className="text-white/50 text-[10px]">subscribers</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-amber-400 font-bold">8wk</div>
                <div className="text-white/50 text-[10px]">to profit</div>
              </div>
            </div>
          </div>
        );
      case "owl":
        return (
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-900/50 border border-purple-500/30 rounded-full p-4">
              <span className="text-4xl">🦉</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl">{currentStep.icon}</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? 'w-8 bg-purple-500' : i < step ? 'w-2 bg-purple-500/50' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-white/40 text-sm">{step + 1} of {onboardingSteps.length}</span>
          </div>

          {/* Visual Preview */}
          {renderPreview()}

          {/* Step content */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{currentStep.title}</h2>
            <p className="text-white/70 leading-relaxed">{currentStep.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={isFirstStep}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isFirstStep
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {isLastStep ? (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition-all"
              >
                Let&apos;s Go!
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center gap-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Skip option */}
          {!isLastStep && (
            <button
              onClick={onComplete}
              className="w-full mt-4 text-white/40 hover:text-white/60 text-sm"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
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
