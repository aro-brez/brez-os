"use client";

import { useState, useEffect } from "react";
import { AlertCircle, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronRight } from "lucide-react";
import { useMomentumData, saveOverrides, DataOverrides } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

export default function CommandCenter() {
  const data = useMomentumData();
  const rec = data.recommendation;
  const [showDataRequest, setShowDataRequest] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  // Calculate cash needed to float through payback period
  const weeklyBurn = 85000; // Weekly opex (from CASH_POSITION)
  const cashNeededToFloat = rec.paybackWeeks * weeklyBurn;
  const canAfford = data.cashHeadroom >= rec.investAmount;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">BREZ Command Center</h1>
            <p className="text-purple-300/60 text-sm">Last updated: {data.lastUpdated}</p>
          </div>
          <button
            onClick={() => setShowDataRequest(true)}
            className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg px-4 py-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Update Numbers
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* ========== SECTION 1: WHERE WE'RE AT ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">1</span>
            WHERE WE&apos;RE AT
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/50 text-sm">Cash Available</div>
              <div className="text-2xl font-bold text-white mt-1">${(data.cashHeadroom / 1000).toFixed(0)}K</div>
              <div className="text-white/40 text-xs mt-1">above ${(data.cash.floor / 1000).toFixed(0)}K floor</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/50 text-sm">Cost per Customer</div>
              <div className="text-2xl font-bold text-white mt-1">${data.economics.cac.toFixed(0)}</div>
              <div className="text-white/40 text-xs mt-1">current CAC</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/50 text-sm">Weekly Ad Spend</div>
              <div className="text-2xl font-bold text-white mt-1">${(data.chain.dtcWeeklySpend / 1000).toFixed(0)}K</div>
              <div className="text-white/40 text-xs mt-1">current pace</div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 2: WHERE WE'RE TRENDING ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">2</span>
            WHERE WE&apos;RE TRENDING
          </div>

          <div className={`rounded-xl p-5 border ${
            data.trajectory === 'gaining'
              ? 'bg-green-500/10 border-green-500/30'
              : data.trajectory === 'losing'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                data.trajectory === 'gaining' ? 'bg-green-500/20' : data.trajectory === 'losing' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              }`}>
                {data.trajectory === 'gaining'
                  ? <TrendingUp className="w-6 h-6 text-green-400" />
                  : data.trajectory === 'losing'
                    ? <TrendingDown className="w-6 h-6 text-red-400" />
                    : <Minus className="w-6 h-6 text-yellow-400" />
                }
              </div>
              <div>
                <div className={`text-xl font-bold ${
                  data.trajectory === 'gaining' ? 'text-green-400' : data.trajectory === 'losing' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {data.trajectory === 'gaining' ? 'Gaining Momentum' : data.trajectory === 'losing' ? 'Losing Momentum' : 'Holding Steady'}
                </div>
                <div className="text-white/60">{data.trajectoryReason}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: WHAT WE NEED TO DO ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">3</span>
            WHAT WE NEED TO DO
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/30">
            <div className="text-cyan-300 text-sm mb-2">THE RECOMMENDATION</div>
            <div className="text-3xl font-bold text-white mb-4">
              Invest <span className="text-cyan-400">${(rec.investAmount / 1000).toFixed(0)}K/week</span> in DTC Ads
            </div>

            <div className="text-white/70 mb-4">
              This is the maximum we can invest based on our current cash position of ${(data.cash.current / 1000).toFixed(0)}K while keeping ${(data.cash.floor / 1000).toFixed(0)}K in reserve.
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-white/50 text-sm mb-3">EXPECTED RESULTS EACH WEEK:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/50">New customers:</span>
                  <span className="text-cyan-400 font-bold ml-2">{rec.expectedCustomers}</span>
                </div>
                <div>
                  <span className="text-white/50">Become subscribers:</span>
                  <span className="text-green-400 font-bold ml-2">{rec.expectedSubscribers}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 4: THE REQUIREMENT ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
            THE REQUIREMENT
          </div>

          <div className={`rounded-xl p-5 border ${canAfford ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${canAfford ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                {canAfford ? '✓' : <AlertCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white mb-2">
                  {canAfford
                    ? "We have the cash to execute this"
                    : `We need more cash to invest at this level`
                  }
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Cash needed to float {rec.paybackWeeks} weeks:</span>
                    <span className="text-white font-mono">${(cashNeededToFloat / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Cash available above floor:</span>
                    <span className={`font-mono ${canAfford ? 'text-green-400' : 'text-amber-400'}`}>${(data.cashHeadroom / 1000).toFixed(0)}K</span>
                  </div>
                  {!canAfford && (
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-amber-400">Gap to fill:</span>
                      <span className="text-amber-400 font-mono font-bold">${((cashNeededToFloat - data.cashHeadroom) / 1000).toFixed(0)}K</span>
                    </div>
                  )}
                </div>

                {data.cash.loanAvailable > 0 && !canAfford && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60">Available loan option:</span>
                    <span className="text-purple-400 font-bold ml-2">${(data.cash.loanAvailable / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: THE OUTCOME ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">5</span>
            THE OUTCOME (IF WE DO THIS)
          </div>

          {/* The Flywheel */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-cyan-400 font-bold">${(rec.investAmount / 1000).toFixed(0)}K</span>
                </div>
                <div className="text-white text-sm font-medium">Invest</div>
                <div className="text-white/40 text-xs">DTC Ads</div>
              </div>

              <ChevronRight className="w-6 h-6 text-purple-500/50" />

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-green-400 font-bold">{rec.expectedSubscribers}</span>
                </div>
                <div className="text-white text-sm font-medium">Subscribers</div>
                <div className="text-white/40 text-xs">per week</div>
              </div>

              <ChevronRight className="w-6 h-6 text-purple-500/50" />

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-amber-400 font-bold text-sm">{rec.paybackWeeks}wk</span>
                </div>
                <div className="text-white text-sm font-medium">Payback</div>
                <div className="text-white/40 text-xs">to profit</div>
              </div>

              <ChevronRight className="w-6 h-6 text-purple-500/50" />

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-purple-400 font-bold text-sm">+${(rec.retailLiftWeekly / 1000).toFixed(0)}K</span>
                </div>
                <div className="text-white text-sm font-medium">Retail Lift</div>
                <div className="text-white/40 text-xs">in 6 weeks</div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-300 text-sm">TOTAL LIFETIME VALUE (12 months)</div>
                  <div className="text-green-400 text-2xl font-bold">${(rec.totalLTVProfit / 1000).toFixed(0)}K</div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-sm">Return on investment</div>
                  <div className="text-white text-2xl font-bold">{data.economics.ltvCacRatio}x</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 6: WHAT'S MISSING / NEEDS UPDATING ========== */}
        <section>
          <div className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">?</span>
            TO MAKE THIS MORE ACCURATE
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <div className="text-white font-medium mb-2">Update these numbers for better recommendations:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-white/70">• Current cash on hand (showing ${(data.cash.current / 1000).toFixed(0)}K)</span>
                    <span className="text-amber-400 text-xs">from Jan 13</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-white/70">• Latest CAC from ads dashboard (showing ${data.economics.cac.toFixed(0)})</span>
                    <span className="text-amber-400 text-xs">from Jan 13</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-white/70">• Current weekly ad spend</span>
                    <span className="text-amber-400 text-xs">from Jan 13</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowDataRequest(true)}
                  className="mt-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-300 text-sm"
                >
                  Update Numbers Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========== QUICK LEVERS ========== */}
        <section>
          <div className="text-white/50 text-sm mb-3">HIGHEST IMPACT IMPROVEMENTS:</div>
          <div className="grid grid-cols-2 gap-3">
            {data.levers.slice(0, 2).map((lever) => (
              <div key={lever.name} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white font-medium text-sm">{lever.name}</div>
                <div className="text-white/50 text-xs mt-1">{lever.currentDisplay} → {lever.targetDisplay}</div>
                <div className="text-green-400 font-bold mt-2">+${(lever.impact / 1000).toFixed(0)}K/mo</div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Data Request Modal */}
      {showDataRequest && (
        <DataRequestModal
          currentData={data}
          onClose={() => setShowDataRequest(false)}
        />
      )}

      {/* Owl Chatbot */}
      <OwlPopup />
    </div>
  );
}

// Data Request Modal - Asks for specific data
function DataRequestModal({
  currentData,
  onClose
}: {
  currentData: ReturnType<typeof useMomentumData>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    cashOnHand: currentData.cash.current,
    cac: currentData.economics.cac,
    weeklySpend: currentData.chain.dtcWeeklySpend,
    subConversionRate: 50.49,
  });

  const questions = [
    {
      key: 'cashOnHand',
      question: "What's our current cash on hand?",
      description: "Check your bank account or accounting dashboard",
      placeholder: "e.g., 380000",
      format: (v: number) => `$${(v / 1000).toFixed(0)}K`,
    },
    {
      key: 'cac',
      question: "What's our current CAC?",
      description: "From your ads dashboard (cost per new customer)",
      placeholder: "e.g., 116",
      format: (v: number) => `$${v.toFixed(0)}`,
    },
    {
      key: 'weeklySpend',
      question: "What are we spending weekly on DTC ads?",
      description: "Total across all ad platforms",
      placeholder: "e.g., 45000",
      format: (v: number) => `$${(v / 1000).toFixed(0)}K/week`,
    },
    {
      key: 'subConversionRate',
      question: "What % of customers become subscribers?",
      description: "From your subscription analytics",
      placeholder: "e.g., 50",
      format: (v: number) => `${v.toFixed(0)}%`,
    },
  ];

  const currentQ = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Save and close
      const overrides: DataOverrides = {
        cashOnHand: values.cashOnHand,
        cac: values.cac,
        weeklySpend: values.weeklySpend,
        subConversionRate: values.subConversionRate / 100,
      };
      saveOverrides(overrides);
      window.location.reload();
    }
  };

  const handleSkip = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="text-purple-400 text-sm">Question {step + 1} of {questions.length}</div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
        </div>

        <div className="text-xl font-bold text-white mb-2">{currentQ.question}</div>
        <div className="text-white/60 text-sm mb-6">{currentQ.description}</div>

        <div className="mb-6">
          <input
            type="number"
            value={values[currentQ.key as keyof typeof values]}
            onChange={(e) => setValues({ ...values, [currentQ.key]: parseFloat(e.target.value) || 0 })}
            placeholder={currentQ.placeholder}
            className="w-full bg-white/10 border border-purple-500/30 rounded-xl px-4 py-4 text-white text-2xl font-mono focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <div className="text-purple-300 text-sm mt-2">
            Current: {currentQ.format(values[currentQ.key as keyof typeof values])}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium"
          >
            {step < questions.length - 1 ? 'Next' : 'Apply & Calculate'}
          </button>
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 text-purple-300/60 hover:text-purple-300 text-sm"
          >
            ← Go back
          </button>
        )}
      </div>
    </div>
  );
}
