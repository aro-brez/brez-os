"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Play,
  DollarSign,
  Target,
  Users,
  Percent,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Inputs, CSVData, SimulationOutputs } from "@/lib/types";
import { simulate, requiredLoanDrawToStayAboveReserve } from "@/lib/simulate";
import { saveState, loadState } from "@/lib/storage";
import { InputPanel } from "@/components/InputPanel";
import { CSVUpload } from "@/components/CSVUpload";
import { KPICard, StatusBadge } from "@/components/KPICard";
import {
  CashBalanceChart,
  SpendCACChart,
  RetailChart,
  SubsChart,
  RevenueChart,
} from "@/components/Charts";
import { generateInsights } from "@/lib/insights-engine";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { Card, Button, Tabs } from "@/components/ui";
import defaultInputs from "../../../data/inputs.json";
import { brain, SimulationInput, SimulationResult } from "@/lib/ai/brain";

// Quick simulation presets
const QUICK_SIM_PRESETS = [
  { type: "cac" as const, label: "CAC", icon: DollarSign, unit: "$", description: "Customer Acquisition Cost" },
  { type: "spend" as const, label: "Spend", icon: Target, unit: "$", description: "Monthly Marketing Spend" },
  { type: "conversion" as const, label: "Conversion", icon: Percent, unit: "%", description: "Website Conversion Rate" },
  { type: "churn" as const, label: "Churn", icon: Users, unit: "%", description: "Monthly Churn Rate" },
];

export default function GrowthGenerator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [actualsInputs, setActualsInputs] = useState<Inputs>(
    defaultInputs as unknown as Inputs
  );
  const [scenarioInputs, setScenarioInputs] = useState<Inputs>(
    defaultInputs as unknown as Inputs
  );
  const [csvData, setCsvData] = useState<CSVData>({});
  const [retailAlphaMode, setRetailAlphaMode] = useState<
    "sellThroughProxy" | "sellInScaled"
  >("sellThroughProxy");
  const [activeTab, setActiveTab] = useState<"actuals" | "scenario">("actuals");
  const [showConfetti, setShowConfetti] = useState(false);

  // Quick simulation state
  const [quickSimType, setQuickSimType] = useState<SimulationInput["type"]>("cac");
  const [quickSimValue, setQuickSimValue] = useState("");
  const [quickSimResults, setQuickSimResults] = useState<SimulationResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get current metrics from brain
  const systemMetrics = brain.getSystemMetrics();

  // Run quick simulation
  const runQuickSimulation = () => {
    if (!quickSimValue) return;

    const currentValue = quickSimType === "cac" ? systemMetrics.dtcCAC :
                         quickSimType === "conversion" ? systemMetrics.dtcConversionRate :
                         quickSimType === "churn" ? systemMetrics.churnRate :
                         systemMetrics.dtcRevenue * 0.15; // Estimated spend

    const newValue = quickSimType === "conversion" || quickSimType === "churn"
      ? parseFloat(quickSimValue) / 100
      : parseFloat(quickSimValue);

    const results = brain.simulate({
      type: quickSimType,
      currentValue,
      newValue,
    });

    setQuickSimResults(results);
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = loadState();
    if (stored) {
      setActualsInputs(stored.actualsInputs);
      setScenarioInputs(stored.scenarioInputs);
      setCsvData(stored.csvData);
      setRetailAlphaMode(stored.retailAlphaMode);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      saveState({
        actualsInputs,
        scenarioInputs,
        csvData,
        retailAlphaMode,
      });
    }
  }, [actualsInputs, scenarioInputs, csvData, retailAlphaMode, isLoaded]);

  // Run simulations
  const actualsOutput = useMemo<SimulationOutputs>(() => {
    return simulate(actualsInputs, csvData, retailAlphaMode);
  }, [actualsInputs, csvData, retailAlphaMode]);

  const scenarioOutput = useMemo<SimulationOutputs>(() => {
    return simulate(scenarioInputs, csvData, retailAlphaMode);
  }, [scenarioInputs, csvData, retailAlphaMode]);

  // Calculate suggested loan draw
  const suggestedLoanDraw = useMemo(() => {
    return requiredLoanDrawToStayAboveReserve(
      scenarioInputs,
      csvData,
      retailAlphaMode
    );
  }, [scenarioInputs, csvData, retailAlphaMode]);

  // Generate insights
  const insights = useMemo(() => {
    return generateInsights(actualsOutput, scenarioOutput, actualsInputs);
  }, [actualsOutput, scenarioOutput, actualsInputs]);

  // Trigger confetti on GO status
  useEffect(() => {
    if (scenarioOutput.goNoGo && !actualsOutput.goNoGo) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [scenarioOutput.goNoGo, actualsOutput.goNoGo]);

  const getRecommendation = (output: SimulationOutputs): { text: string; action: string } => {
    if (output.goNoGo) {
      if (output.minCash > actualsInputs.cash.reserveFloor * 2) {
        return { text: "Strong position! Consider increasing spend", action: "Grow" };
      }
      return { text: "Sustainable trajectory - maintain current plan", action: "Hold" };
    } else {
      if (suggestedLoanDraw > 0) {
        return { text: `Consider $${(suggestedLoanDraw / 1000).toFixed(0)}K loan draw`, action: "Fund" };
      }
      return { text: "Reduce spend to preserve cash runway", action: "Cut" };
    }
  };

  const resetToDefaults = () => {
    const defaults = defaultInputs as unknown as Inputs;
    setActualsInputs(defaults);
    setScenarioInputs(defaults);
    setCsvData({});
    setRetailAlphaMode("sellThroughProxy");
  };

  const copyActualsToScenario = () => {
    setScenarioInputs({ ...actualsInputs });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-[#676986] text-sm">Loading Growth Generator</p>
        </div>
      </div>
    );
  }

  const recommendation = getRecommendation(scenarioOutput);
  const selectedPreset = QUICK_SIM_PRESETS.find(p => p.type === quickSimType);

  return (
    <div className="min-h-screen p-4 md:p-6 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-[confetti_1s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                backgroundColor: ["#e3f98a", "#6BCB77", "#ffce33", "#8533fc", "#65cdd8"][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#e3f98a]" />
            Growth Generator
          </h1>
          <p className="text-[#676986] mt-1">Simulate what-if scenarios and 52-week projections</p>
        </div>
      </div>

      {/* Quick Simulation Panel */}
      <Card className="mb-6 bg-gradient-to-r from-[#e3f98a]/5 to-[#65cdd8]/5 border-[#e3f98a]/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0D0D2A]" />
            </div>
            <div>
              <h2 className="font-bold text-white">Quick What-If Simulation</h2>
              <p className="text-sm text-[#676986]">See instant impact across the business</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-[#676986] hover:text-white transition-colors"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#0D0D2A]/50 rounded-xl">
          <div>
            <p className="text-xs text-[#676986] mb-1">Current CAC</p>
            <p className="text-lg font-bold text-white">${systemMetrics.dtcCAC}</p>
          </div>
          <div>
            <p className="text-xs text-[#676986] mb-1">Conversion Rate</p>
            <p className="text-lg font-bold text-white">{(systemMetrics.dtcConversionRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-[#676986] mb-1">Churn Rate</p>
            <p className="text-lg font-bold text-white">{(systemMetrics.churnRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-[#676986] mb-1">Monthly Revenue</p>
            <p className="text-lg font-bold text-white">${(systemMetrics.monthlyRevenue / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#1a1a3e] rounded-xl">
            {QUICK_SIM_PRESETS.map((preset) => (
              <button
                key={preset.type}
                onClick={() => {
                  setQuickSimType(preset.type);
                  setQuickSimValue("");
                  setQuickSimResults([]);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  quickSimType === preset.type
                    ? "bg-[#e3f98a] text-[#0D0D2A]"
                    : "text-[#676986] hover:text-white"
                }`}
              >
                <preset.icon className="w-4 h-4" />
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#676986]">
                {selectedPreset?.unit === "$" ? "$" : ""}
              </span>
              <input
                type="number"
                value={quickSimValue}
                onChange={(e) => setQuickSimValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runQuickSimulation()}
                placeholder={`Enter new ${selectedPreset?.label.toLowerCase()}...`}
                className={`w-full bg-[#1a1a3e] border border-white/10 rounded-xl py-3 pr-4 text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 ${
                  selectedPreset?.unit === "$" ? "pl-7" : "pl-4"
                }`}
              />
              {selectedPreset?.unit === "%" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#676986]">%</span>
              )}
            </div>
            <Button onClick={runQuickSimulation} disabled={!quickSimValue}>
              <Play className="w-4 h-4" />
              Simulate
            </Button>
          </div>
        </div>

        {/* Simulation Results */}
        {quickSimResults.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="font-semibold text-white mb-4">Impact Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickSimResults.map((result, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    result.impact === "positive"
                      ? "bg-[#6BCB77]/10 border-[#6BCB77]/20"
                      : result.impact === "negative"
                      ? "bg-[#ff6b6b]/10 border-[#ff6b6b]/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#a8a8a8]">{result.metric}</p>
                    {result.impact === "positive" ? (
                      <CheckCircle className="w-4 h-4 text-[#6BCB77]" />
                    ) : result.impact === "negative" ? (
                      <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
                    ) : null}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-white">
                      {typeof result.projectedValue === "number"
                        ? result.projectedValue > 1000
                          ? `$${(result.projectedValue / 1000).toFixed(0)}K`
                          : result.projectedValue.toFixed(1)
                        : result.projectedValue}
                    </p>
                    <span
                      className={`flex items-center text-sm ${
                        result.changePercent > 0
                          ? result.impact === "positive"
                            ? "text-[#6BCB77]"
                            : "text-[#ff6b6b]"
                          : result.impact === "positive"
                          ? "text-[#6BCB77]"
                          : "text-[#ff6b6b]"
                      }`}
                    >
                      {result.changePercent > 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      {Math.abs(result.changePercent).toFixed(1)}%
                    </span>
                  </div>
                  {result.warnings && result.warnings.length > 0 && (
                    <p className="text-xs text-[#ffce33] mt-2">
                      {result.warnings[0]}
                    </p>
                  )}
                  {result.recommendation && (
                    <p className="text-xs text-[#65cdd8] mt-2">
                      {result.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Advanced Mode Toggle */}
      {showAdvanced && (
        <>
          {/* Alpha Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Advanced 52-Week Simulation</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#1a1a3e] rounded-xl p-1">
                <button
                  onClick={() => setRetailAlphaMode("sellThroughProxy")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    retailAlphaMode === "sellThroughProxy"
                      ? "bg-[#e3f98a] text-[#0D0D2A]"
                      : "text-[#676986] hover:text-white"
                  }`}
                >
                  Sell-Through
                </button>
                <button
                  onClick={() => setRetailAlphaMode("sellInScaled")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    retailAlphaMode === "sellInScaled"
                      ? "bg-[#e3f98a] text-[#0D0D2A]"
                      : "text-[#676986] hover:text-white"
                  }`}
                >
                  Sell-In
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={copyActualsToScenario}>
                <Copy className="w-4 h-4" />
                Copy to Scenario
              </Button>
              <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Status Banner */}
      <Card className={`mb-6 ${
        scenarioOutput.goNoGo
          ? "bg-gradient-to-r from-[#e3f98a]/10 to-transparent border-[#e3f98a]/20"
          : "bg-gradient-to-r from-[#ff6b6b]/10 to-transparent border-[#ff6b6b]/20"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-[#676986] mb-1">Scenario Status</p>
              <h2 className="text-lg font-bold text-white">{recommendation.text}</h2>
            </div>
            <StatusBadge
              status={scenarioOutput.goNoGo ? "go" : actualsOutput.goNoGo ? "caution" : "stop"}
              label={scenarioOutput.goNoGo ? "GO" : "NO-GO"}
            />
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-[#676986]">Min Cash</p>
              <p className="text-lg font-bold text-white">${(scenarioOutput.minCash / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-xs text-[#676986]">Trough</p>
              <p className="text-lg font-bold text-white">Wk {scenarioOutput.troughWeek}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              scenarioOutput.goNoGo ? "bg-[#e3f98a]/20" : "bg-[#ff6b6b]/20"
            }`}>
              {scenarioOutput.goNoGo ? "🚀" : "⚠️"}
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPICard
          title="Min Cash (Actuals)"
          value={actualsOutput.minCash}
          subtitle={`Week ${actualsOutput.troughWeek}`}
          variant={actualsOutput.goNoGo ? "success" : "danger"}
          icon="💵"
          progress={(actualsOutput.minCash / actualsInputs.cash.cashOnHand) * 100}
        />
        <KPICard
          title="Min Cash (Scenario)"
          value={scenarioOutput.minCash}
          subtitle={`Week ${scenarioOutput.troughWeek}`}
          variant={scenarioOutput.goNoGo ? "success" : "danger"}
          icon="🔮"
          progress={(scenarioOutput.minCash / scenarioInputs.cash.cashOnHand) * 100}
        />
        <KPICard
          title="Active Subs (W52)"
          value={Math.round(actualsOutput.activeSubs[51])}
          subtitle={`Started: ${Math.round(actualsInputs.subs.startingActiveSubs)}`}
          variant="default"
          icon="🔄"
          trend={actualsOutput.activeSubs[51] > actualsInputs.subs.startingActiveSubs ? "up" : "down"}
          trendValue={`${((actualsOutput.activeSubs[51] / actualsInputs.subs.startingActiveSubs - 1) * 100).toFixed(0)}%`}
        />
        <KPICard
          title="Total DTC Rev"
          value={actualsOutput.dtcRevenueTotal.reduce((a, b) => a + b, 0)}
          subtitle="52-week total"
          variant="default"
          icon="🛒"
        />
        <KPICard
          title="Total Retail Rev"
          value={actualsOutput.retailCashIn.reduce((a, b) => a + b, 0)}
          subtitle="52-week total"
          variant="default"
          icon="🏪"
        />
        <KPICard
          title="Loan Suggestion"
          value={suggestedLoanDraw > 0 ? suggestedLoanDraw : "None"}
          subtitle={suggestedLoanDraw > 0 ? "Recommended draw" : "No loan needed"}
          variant={suggestedLoanDraw > 0 ? "warning" : "success"}
          icon="🏦"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Inputs */}
        <div className="lg:col-span-1 space-y-4">
          {/* Insights Panel */}
          <InsightsPanel insights={insights} />

          {/* Tab Switcher */}
          <Tabs
            tabs={[
              { id: "actuals", label: "Actuals", icon: <span>📊</span> },
              { id: "scenario", label: "Scenario", icon: <span>🔮</span> },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as "actuals" | "scenario")}
          />

          {/* Input Panel */}
          <Card className="max-h-[calc(100vh-400px)] overflow-y-auto">
            {activeTab === "actuals" ? (
              <>
                <InputPanel
                  inputs={actualsInputs}
                  onChange={setActualsInputs}
                  title="Actuals Inputs"
                />
                <div className="mt-4 pt-4 border-t border-white/10">
                  <CSVUpload csvData={csvData} onUpdate={setCsvData} />
                </div>
              </>
            ) : (
              <InputPanel
                inputs={scenarioInputs}
                onChange={setScenarioInputs}
                title="Scenario Inputs"
                isScenario
              />
            )}
          </Card>
        </div>

        {/* Right Panel - Charts */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <CashBalanceChart
              actuals={actualsOutput}
              scenario={scenarioOutput}
              reserveFloor={actualsInputs.cash.reserveFloor}
            />
            <SpendCACChart
              actuals={actualsOutput}
              scenario={scenarioOutput}
            />
            <RetailChart actuals={actualsOutput} scenario={scenarioOutput} />
            <SubsChart actuals={actualsOutput} scenario={scenarioOutput} />
            <div className="xl:col-span-2">
              <RevenueChart
                actuals={actualsOutput}
                scenario={scenarioOutput}
              />
            </div>
          </div>

          {/* Summary Table */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Weekly Summary (First 12 Weeks)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-4 text-left font-semibold text-[#e3f98a]">Week</th>
                    <th className="py-3 px-4 text-right font-semibold text-[#e3f98a]">Cash (A)</th>
                    <th className="py-3 px-4 text-right font-semibold text-[#65cdd8]">Cash (S)</th>
                    <th className="py-3 px-4 text-right font-semibold text-white">DTC Rev</th>
                    <th className="py-3 px-4 text-right font-semibold text-white">Retail</th>
                    <th className="py-3 px-4 text-right font-semibold text-white">Subs</th>
                    <th className="py-3 px-4 text-right font-semibold text-white">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {actualsOutput.weeks.slice(0, 12).map((week, i) => (
                    <tr
                      key={week}
                      className={`hover:bg-white/5 ${
                        actualsOutput.cashBalance[i] < actualsInputs.cash.reserveFloor
                          ? "bg-[#ff6b6b]/10"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-[#a8a8a8]">
                        {actualsOutput.weekDates[i]}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        actualsOutput.cashBalance[i] < actualsInputs.cash.reserveFloor
                          ? "text-[#ff6b6b]"
                          : "text-[#e3f98a]"
                      }`}>
                        ${(actualsOutput.cashBalance[i] / 1000).toFixed(0)}K
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        scenarioOutput.cashBalance[i] < scenarioInputs.cash.reserveFloor
                          ? "text-[#ff6b6b]"
                          : "text-[#65cdd8]"
                      }`}>
                        ${(scenarioOutput.cashBalance[i] / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-right text-[#a8a8a8]">
                        ${(actualsOutput.dtcRevenueTotal[i] / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-right text-[#a8a8a8]">
                        ${(actualsOutput.retailCashIn[i] / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-right text-[#a8a8a8]">
                        {actualsOutput.activeSubs[i].toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#a8a8a8]">
                        ${(actualsOutput.dtcSpend[i] / 1000).toFixed(0)}K
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
