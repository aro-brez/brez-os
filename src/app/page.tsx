"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, DollarSign, Users, ShoppingCart } from "lucide-react";

// Mock data - replace with real API calls when tokens are added
const mockMetrics = {
  revenue: { current: 182000, previous: 165000, target: 200000 },
  margin: { current: 0.18, previous: 0.15, target: 0.25 },
  cac: { current: 38, previous: 42, target: 29 },
  conversion: { current: 0.021, previous: 0.019, target: 0.028 },
  runway: { current: 8, previous: 7, target: 12 },
  subscribers: { current: 1240, previous: 1180, target: 2000 },
};

function calculateMomentumScore(metrics: typeof mockMetrics) {
  const revenueScore = Math.min(100, (metrics.revenue.current / metrics.revenue.target) * 100);
  const marginScore = Math.min(100, (metrics.margin.current / metrics.margin.target) * 100);
  const cacScore = Math.min(100, (metrics.cac.target / metrics.cac.current) * 100);
  const conversionScore = Math.min(100, (metrics.conversion.current / metrics.conversion.target) * 100);
  const runwayScore = Math.min(100, (metrics.runway.current / metrics.runway.target) * 100);
  
  return Math.round(
    revenueScore * 0.25 +
    marginScore * 0.20 +
    cacScore * 0.15 +
    conversionScore * 0.20 +
    runwayScore * 0.20
  );
}

function getTrend(current: number, previous: number) {
  const change = ((current - previous) / previous) * 100;
  if (change > 3) return { direction: "up", change };
  if (change < -3) return { direction: "down", change };
  return { direction: "flat", change };
}

function getStatus(score: number) {
  if (score >= 75) return { label: "GROWING", color: "text-green-400", bg: "bg-green-500/20" };
  if (score >= 50) return { label: "STABLE", color: "text-yellow-400", bg: "bg-yellow-500/20" };
  return { label: "AT RISK", color: "text-red-400", bg: "bg-red-500/20" };
}

function getConstraint(metrics: typeof mockMetrics) {
  const gaps = [
    { name: "Conversion Rate", gap: (metrics.conversion.target - metrics.conversion.current) / metrics.conversion.target, impact: 47000, current: `${(metrics.conversion.current * 100).toFixed(1)}%`, target: `${(metrics.conversion.target * 100).toFixed(1)}%` },
    { name: "CAC", gap: (metrics.cac.current - metrics.cac.target) / metrics.cac.current, impact: 32000, current: `$${metrics.cac.current}`, target: `$${metrics.cac.target}` },
    { name: "Contribution Margin", gap: (metrics.margin.target - metrics.margin.current) / metrics.margin.target, impact: 28000, current: `${(metrics.margin.current * 100).toFixed(0)}%`, target: `${(metrics.margin.target * 100).toFixed(0)}%` },
  ];
  return gaps.sort((a, b) => b.gap - a.gap)[0];
}

export default function MomentumDashboard() {
  const router = useRouter();
  const [metrics] = useState(mockMetrics);
  const score = calculateMomentumScore(metrics);
  const status = getStatus(score);
  const constraint = getConstraint(metrics);
  const revenueTrend = getTrend(metrics.revenue.current, metrics.revenue.previous);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-semibold">BREZ Momentum</h1>
          <p className="text-purple-300/50 text-sm">Real-time business health</p>
        </div>
        <button onClick={() => router.push("/owl")} className="text-3xl">🦉</button>
      </div>

      {/* Main Status Card */}
      <div className={`${status.bg} border border-purple-500/20 rounded-2xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`text-2xl font-bold ${status.color}`}>{status.label}</div>
          <div className="flex items-center gap-2">
            {revenueTrend.direction === "up" && <TrendingUp className="w-5 h-5 text-green-400" />}
            {revenueTrend.direction === "down" && <TrendingDown className="w-5 h-5 text-red-400" />}
            {revenueTrend.direction === "flat" && <Minus className="w-5 h-5 text-yellow-400" />}
            <span className={revenueTrend.change >= 0 ? "text-green-400" : "text-red-400"}>
              {revenueTrend.change >= 0 ? "+" : ""}{revenueTrend.change.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Momentum Score Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-300/70">Health Score</span>
            <span className="text-white font-mono">{score}/100</span>
          </div>
          <div className="h-3 bg-purple-900/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Constraint */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">PRIMARY CONSTRAINT</span>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">{constraint.name}</h3>
        <div className="flex items-center gap-4 text-sm mb-3">
          <div>
            <span className="text-purple-300/50">Current: </span>
            <span className="text-white">{constraint.current}</span>
          </div>
          <div>
            <span className="text-purple-300/50">Target: </span>
            <span className="text-green-400">{constraint.target}</span>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <span className="text-green-400 text-sm">If resolved: </span>
          <span className="text-green-300 font-semibold">+${(constraint.impact / 1000).toFixed(0)}K/mo revenue</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard 
          icon={<DollarSign className="w-4 h-4" />}
          label="Revenue"
          value={`$${(metrics.revenue.current / 1000).toFixed(0)}K`}
          trend={getTrend(metrics.revenue.current, metrics.revenue.previous)}
        />
        <MetricCard 
          icon={<Target className="w-4 h-4" />}
          label="Margin"
          value={`${(metrics.margin.current * 100).toFixed(0)}%`}
          trend={getTrend(metrics.margin.current, metrics.margin.previous)}
        />
        <MetricCard 
          icon={<Users className="w-4 h-4" />}
          label="CAC"
          value={`$${metrics.cac.current}`}
          trend={getTrend(metrics.cac.previous, metrics.cac.current)} // Inverted - lower is better
        />
        <MetricCard 
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Subscribers"
          value={metrics.subscribers.current.toLocaleString()}
          trend={getTrend(metrics.subscribers.current, metrics.subscribers.previous)}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button 
          onClick={() => router.push("/growth")}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 px-4 text-left flex items-center justify-between"
        >
          <span>Run Scenario Simulation</span>
          <span>→</span>
        </button>
        <button 
          onClick={() => router.push("/tasks")}
          className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 px-4 text-left flex items-center justify-between border border-purple-500/20"
        >
          <span>View Priority Stack</span>
          <span>→</span>
        </button>
      </div>

      {/* Data Source Indicator */}
      <div className="mt-6 text-center">
        <p className="text-purple-300/30 text-xs">Using demo data • Connect Shopify & QuickBooks for live metrics</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: { direction: string; change: number } }) {
  return (
    <div className="bg-white/5 border border-purple-500/15 rounded-xl p-4">
      <div className="flex items-center gap-2 text-purple-300/60 text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white text-xl font-semibold">{value}</span>
        <span className={`text-xs ${trend.direction === "up" ? "text-green-400" : trend.direction === "down" ? "text-red-400" : "text-purple-300/50"}`}>
          {trend.change >= 0 ? "+" : ""}{trend.change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
