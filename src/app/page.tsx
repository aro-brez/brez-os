"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Settings, X, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useMomentumData, saveOverrides, DataOverrides } from "@/lib/hooks/useMomentumData";
import { OwlPopup } from "@/components/owl/OwlPopup";

export default function MomentumCommandCenter() {
  const router = useRouter();
  const data = useMomentumData();
  const rec = data.recommendation;
  const [showEditor, setShowEditor] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('brez-cc-visited');
    if (!hasVisited) {
      setShowWalkthrough(true);
      localStorage.setItem('brez-cc-visited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] p-4 pb-32">

      {/* First Time Walkthrough */}
      {showWalkthrough && <WalkthroughModal onClose={() => setShowWalkthrough(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">BREZ Command Center</h1>
          <p className="text-purple-300/60 text-sm">Your weekly investment guide</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWalkthrough(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
            title="How this works"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
            title="Update numbers"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Data Editor */}
      {showEditor && <DataEditor onClose={() => setShowEditor(false)} currentData={data} />}

      {/* THE ONE THING - Main Action Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-2 border-purple-500/40 rounded-2xl p-6 mb-6">
        <div className="text-purple-300 text-sm mb-2">📍 THIS WEEK&apos;S FOCUS</div>

        <div className="text-white text-2xl font-bold mb-2">
          Invest <span className="text-cyan-400">${(rec.investAmount / 1000).toFixed(0)}K</span> in DTC Ads
        </div>

        <div className="text-purple-200/80 text-sm mb-4">
          Based on your current cash position of ${(data.cash.current / 1000).toFixed(0)}K
        </div>

        {/* What You'll Get - Simple breakdown */}
        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-purple-300 text-xs mb-3">WHAT YOU&apos;LL GET FROM THIS INVESTMENT:</div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">New customers this week</span>
              <span className="text-cyan-400 font-mono font-bold">{rec.expectedCustomers}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/80">Will become subscribers ({(rec.expectedSubscribers / rec.expectedCustomers * 100).toFixed(0)}%)</span>
              <span className="text-green-400 font-mono font-bold">{rec.expectedSubscribers}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/80">Total lifetime value (12 months)</span>
              <span className="text-amber-400 font-mono font-bold">${(rec.totalLTVProfit / 1000).toFixed(0)}K</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/80">Retail boost in 6 weeks</span>
              <span className="text-purple-400 font-mono font-bold">+${(rec.retailLiftWeekly / 1000).toFixed(1)}K/wk</span>
            </div>
          </div>
        </div>

        {/* Time to profit */}
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-green-300">⏱️ You&apos;ll recover this investment in</span>
            <span className="text-green-400 font-bold">{rec.paybackWeeks} weeks</span>
          </div>
        </div>
      </div>

      {/* Status Check */}
      <ExpandableSection
        title="Can We Afford This?"
        isExpanded={expandedSection === 'afford'}
        onToggle={() => setExpandedSection(expandedSection === 'afford' ? null : 'afford')}
        status={data.canInvestMore === 'yes' ? 'good' : data.canInvestMore === 'caution' ? 'warning' : 'bad'}
        summary={data.canInvestMore === 'yes' ? 'Yes, we have room to invest' : data.canInvestMore === 'caution' ? 'Proceed with caution' : 'Not right now'}
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Cash on hand</span>
            <span className="text-white font-mono">${(data.cash.current / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Minimum we need to keep</span>
            <span className="text-white font-mono">${(data.cash.floor / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Available to invest</span>
            <span className="text-cyan-400 font-mono font-bold">${(data.cashHeadroom / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Weeks of runway</span>
            <span className="text-white font-mono">{data.cash.runwayWeeks} weeks</span>
          </div>
        </div>
      </ExpandableSection>

      {/* Unit Economics */}
      <ExpandableSection
        title="Are Our Economics Healthy?"
        isExpanded={expandedSection === 'economics'}
        onToggle={() => setExpandedSection(expandedSection === 'economics' ? null : 'economics')}
        status={data.economics.ltvCacRatio >= 3 ? 'good' : data.economics.ltvCacRatio >= 2 ? 'warning' : 'bad'}
        summary={`${data.economics.ltvCacRatio}x return on each customer`}
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Cost to acquire a customer (CAC)</span>
            <span className="text-white font-mono">${data.economics.cac.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">First order value</span>
            <span className="text-white font-mono">${rec.firstOrderAOV}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Subscriber order value</span>
            <span className="text-white font-mono">${rec.subAOV}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Lifetime value per subscriber</span>
            <span className="text-green-400 font-mono font-bold">${rec.subscriberLTV}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Return on investment (LTV ÷ CAC)</span>
            <span className="text-cyan-400 font-mono font-bold">{data.economics.ltvCacRatio}x</span>
          </div>
        </div>
      </ExpandableSection>

      {/* How It Works */}
      <ExpandableSection
        title="How Does This Create Demand?"
        isExpanded={expandedSection === 'chain'}
        onToggle={() => setExpandedSection(expandedSection === 'chain' ? null : 'chain')}
        status="info"
        summary="DTC spend drives retail sales"
      >
        <div className="text-sm text-white/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">1</div>
            <div>
              <div className="text-white font-medium">We spend on DTC ads</div>
              <div className="text-white/60">Currently ${(data.chain.dtcWeeklySpend / 1000).toFixed(0)}K/week</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">2</div>
            <div>
              <div className="text-white font-medium">People discover BREZ</div>
              <div className="text-white/60">Brand awareness builds over 3 weeks</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">3</div>
            <div>
              <div className="text-white font-medium">Retail velocity increases</div>
              <div className="text-white/60">Stores see more sales ~6 weeks later</div>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-3 mt-2">
            <div className="text-purple-300 text-xs">KEY INSIGHT</div>
            <div className="text-white mt-1">For every $1 we spend on ads, we generate ${(data.chain.alpha * 100).toFixed(1)}¢ in retail revenue</div>
          </div>
        </div>
      </ExpandableSection>

      {/* What To Improve */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="text-purple-300 text-sm mb-3">🎯 TO INCREASE PROFITS, FOCUS ON:</div>
        <div className="space-y-2">
          {data.levers.slice(0, 2).map((lever, i) => (
            <div key={lever.name} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
              <div>
                <div className="text-white text-sm font-medium">{i + 1}. {lever.name}</div>
                <div className="text-white/50 text-xs">{lever.currentDisplay} → {lever.targetDisplay}</div>
              </div>
              <div className="text-green-400 text-sm font-mono">+${(lever.impact / 1000).toFixed(0)}K/mo</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={() => router.push("/growth")}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 px-4 text-left flex items-center justify-between"
        >
          <span>Run Scenario Simulation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Owl Chatbot */}
      <OwlPopup />
    </div>
  );
}

// Expandable Section Component
function ExpandableSection({
  title,
  isExpanded,
  onToggle,
  status,
  summary,
  children
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  status: 'good' | 'warning' | 'bad' | 'info';
  summary: string;
  children: React.ReactNode;
}) {
  const statusColors = {
    good: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bad: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`border rounded-2xl mb-4 overflow-hidden ${statusColors[status]}`}>
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between">
        <div>
          <div className="text-white font-medium text-left">{title}</div>
          <div className="text-sm opacity-80">{summary}</div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 bg-black/20">
          {children}
        </div>
      )}
    </div>
  );
}

// Walkthrough Modal
function WalkthroughModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to the Command Center",
      content: "This dashboard helps you answer one question: Where should we invest our money to grow BREZ?",
    },
    {
      title: "The Weekly Recommendation",
      content: "At the top, you'll see exactly how much to invest in DTC ads this week, and what results to expect from that investment.",
    },
    {
      title: "The Flywheel",
      content: "When we spend on DTC, we acquire customers → they become subscribers → they drive retail demand. It's a cycle that builds on itself.",
    },
    {
      title: "Ask the Owl",
      content: "Click the owl button (bottom right) to ask questions about any of these numbers. It knows all your current metrics.",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full">
        <div className="text-purple-400 text-sm mb-2">Step {step + 1} of {steps.length}</div>
        <div className="text-white text-xl font-bold mb-3">{steps[step].title}</div>
        <div className="text-white/80 mb-6">{steps[step].content}</div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-white/10 rounded-lg text-white">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white">
              Next
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white">
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Data Editor Component
function DataEditor({ onClose, currentData }: { onClose: () => void; currentData: ReturnType<typeof useMomentumData> }) {
  const [inputs, setInputs] = useState({
    cashOnHand: currentData.cash.current,
    cac: currentData.economics.cac,
    subConversionRate: 50.49,
    weeklySpend: currentData.recommendation.investAmount,
    firstOrderAOV: currentData.recommendation.firstOrderAOV,
    subAOV: currentData.recommendation.subAOV,
    ltvMultiple: currentData.economics.ltvCacRatio,
    alpha: currentData.chain.alpha * 100,
  });

  const handleSave = () => {
    const overrides: DataOverrides = {
      cashOnHand: inputs.cashOnHand,
      cac: inputs.cac,
      subConversionRate: inputs.subConversionRate / 100,
      weeklySpend: inputs.weeklySpend,
      firstOrderAOV: inputs.firstOrderAOV,
      subAOV: inputs.subAOV,
      ltvMultiple: inputs.ltvMultiple,
      alpha: inputs.alpha / 100,
    };
    saveOverrides(overrides);
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem('brez-data-overrides');
    window.location.reload();
  };

  return (
    <div className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-medium">Update Your Numbers</div>
        <button onClick={onClose} className="text-purple-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-white/60 text-sm mb-4">
        Enter your current numbers to get an accurate recommendation.
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <InputField label="Cash on Hand ($)" value={inputs.cashOnHand} onChange={(v) => setInputs({ ...inputs, cashOnHand: v })} />
        <InputField label="Cost per Customer ($)" value={inputs.cac} onChange={(v) => setInputs({ ...inputs, cac: v })} />
        <InputField label="Subscriber Rate (%)" value={inputs.subConversionRate} onChange={(v) => setInputs({ ...inputs, subConversionRate: v })} />
        <InputField label="Weekly Ad Spend ($)" value={inputs.weeklySpend} onChange={(v) => setInputs({ ...inputs, weeklySpend: v })} />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-2 text-sm">
          Apply Changes
        </button>
        <button onClick={handleReset} className="px-4 bg-white/10 hover:bg-white/20 text-purple-300 rounded-lg py-2 text-sm">
          Reset
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-purple-300/60 text-xs">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
}
