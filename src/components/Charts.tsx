"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";
import { SimulationOutputs } from "@/lib/types";

// BREZ Brand Colors - Dark Theme
const COLORS = {
  lime: "#e3f98a",
  purple: "#8533fc",
  teal: "#65cdd8",
  gold: "#ffce33",
  green: "#6BCB77",
  dark: "#0D0D2A",
  gray: "#676986",
  grayLight: "#a8a8a8",
  danger: "#ff6b6b",
  white: "#ffffff",
};

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Minimal Custom Tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="bg-[#1a1a3e]/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 px-3 py-2">
      <p className="text-xs font-medium text-[#676986] mb-1">Week {label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-semibold text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Stat Badge Component
function StatBadge({
  label,
  value,
  color = "lime",
  trend,
}: {
  label: string;
  value: string;
  color?: "lime" | "teal" | "purple" | "gold" | "green" | "danger";
  trend?: "up" | "down" | "flat";
}) {
  const colorMap = {
    lime: "text-[#e3f98a]",
    teal: "text-[#65cdd8]",
    purple: "text-[#8533fc]",
    gold: "text-[#ffce33]",
    green: "text-[#6BCB77]",
    danger: "text-[#ff6b6b]",
  };

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-[#676986]">
        {label}
      </span>
      <span className={`text-lg font-bold ${colorMap[color]}`}>
        {value}
        {trendIcon && <span className="text-sm ml-1 opacity-70">{trendIcon}</span>}
      </span>
    </div>
  );
}

interface ChartContainerProps {
  title: string;
  icon?: string;
  stats?: React.ReactNode;
  children: React.ReactNode;
}

function ChartContainer({ title, icon, stats, children }: ChartContainerProps) {
  return (
    <div className="bg-gradient-to-br from-[#242445]/80 to-[#1a1a3e]/80 rounded-2xl border border-white/5 p-5 hover:border-[#e3f98a]/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {stats && <div className="flex items-center gap-6">{stats}</div>}
      </div>
      {children}
    </div>
  );
}

interface CashBalanceChartProps {
  actuals: SimulationOutputs;
  scenario: SimulationOutputs;
  reserveFloor: number;
}

export function CashBalanceChart({
  actuals,
  scenario,
  reserveFloor,
}: CashBalanceChartProps) {
  const data = actuals.weeks.map((week, i) => ({
    week,
    cash: scenario.cashBalance[i],
  }));

  const minCash = Math.min(...scenario.cashBalance);
  const endCash = scenario.cashBalance[51];
  const aboveReserve = minCash - reserveFloor;

  return (
    <ChartContainer
      title="Cash Balance"
      icon="💰"
      stats={
        <>
          <StatBadge
            label="Min"
            value={formatCurrency(minCash)}
            color={aboveReserve > 0 ? "green" : "danger"}
          />
          <StatBadge label="End" value={formatCurrency(endCash)} color="lime" />
        </>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.lime} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.lime} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={reserveFloor}
            stroke={COLORS.danger}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="cash"
            stroke={COLORS.lime}
            fill="url(#cashGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.lime }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface SpendCACChartProps {
  actuals: SimulationOutputs;
  scenario: SimulationOutputs;
}

export function SpendCACChart({ scenario }: SpendCACChartProps) {
  const data = scenario.weeks.map((week, i) => ({
    week,
    spend: scenario.dtcSpend[i],
    cac: scenario.impliedCAC[i],
  }));

  const totalSpend = scenario.dtcSpend.reduce((a, b) => a + b, 0);
  const avgCAC = scenario.impliedCAC.reduce((a, b) => a + b, 0) / 52;

  return (
    <ChartContainer
      title="DTC Marketing"
      icon="🎯"
      stats={
        <>
          <StatBadge label="Total Spend" value={formatCurrency(totalSpend)} color="teal" />
          <StatBadge label="Avg CAC" value={`$${avgCAC.toFixed(0)}`} color="purple" />
        </>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis
            yAxisId="spend"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <YAxis
            yAxisId="cac"
            orientation="right"
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="spend"
            dataKey="spend"
            fill={COLORS.teal}
            name="Spend"
            radius={[2, 2, 0, 0]}
            opacity={0.6}
          />
          <Line
            yAxisId="cac"
            type="monotone"
            dataKey="cac"
            stroke={COLORS.purple}
            name="CAC"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.purple }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface RetailChartProps {
  actuals: SimulationOutputs;
  scenario: SimulationOutputs;
}

export function RetailChart({ scenario }: RetailChartProps) {
  const data = scenario.weeks.map((week, i) => ({
    week,
    velocity: scenario.retailVelocity[i],
    cashIn: scenario.retailCashIn[i],
  }));

  const totalCashIn = scenario.retailCashIn.reduce((a, b) => a + b, 0);
  const avgVelocity =
    scenario.retailVelocity.reduce((a, b) => a + b, 0) / 52;

  return (
    <ChartContainer
      title="Retail Performance"
      icon="🏪"
      stats={
        <>
          <StatBadge label="Total" value={formatCurrency(totalCashIn)} color="purple" />
          <StatBadge label="Avg Velocity" value={`${avgVelocity.toFixed(1)}/wk`} color="gold" />
        </>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="retailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cashIn"
            stroke={COLORS.purple}
            fill="url(#retailGradient)"
            strokeWidth={2}
            name="Cash In"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.purple }}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke={COLORS.gold}
            strokeWidth={2}
            name="Velocity"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.gold }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface SubsChartProps {
  actuals: SimulationOutputs;
  scenario: SimulationOutputs;
}

export function SubsChart({ scenario }: SubsChartProps) {
  const data = scenario.weeks.map((week, i) => ({
    week,
    subs: scenario.activeSubs[i],
    revenue: scenario.subscriptionRevenue[i],
  }));

  const startSubs = scenario.activeSubs[0];
  const endSubs = scenario.activeSubs[51];
  const growth = ((endSubs - startSubs) / startSubs) * 100;
  const totalRevenue = scenario.subscriptionRevenue.reduce((a, b) => a + b, 0);

  return (
    <ChartContainer
      title="Subscriptions"
      icon="🔄"
      stats={
        <>
          <StatBadge
            label="Growth"
            value={`${growth > 0 ? "+" : ""}${growth.toFixed(0)}%`}
            color={growth > 0 ? "green" : "danger"}
            trend={growth > 0 ? "up" : "down"}
          />
          <StatBadge label="Revenue" value={formatCurrency(totalRevenue)} color="lime" />
        </>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="subsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis
            yAxisId="subs"
            tickFormatter={formatNumber}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="subs"
            type="monotone"
            dataKey="subs"
            stroke={COLORS.green}
            fill="url(#subsGradient)"
            strokeWidth={2}
            name="Subs"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.green }}
          />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.lime}
            strokeWidth={2}
            name="Revenue"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.lime }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface RevenueChartProps {
  actuals: SimulationOutputs;
  scenario: SimulationOutputs;
}

export function RevenueChart({ scenario }: RevenueChartProps) {
  const data = scenario.weeks.map((week, i) => ({
    week,
    dtc: scenario.dtcRevenueTotal[i],
    retail: scenario.retailCashIn[i],
  }));

  const totalDTC = scenario.dtcRevenueTotal.reduce((a, b) => a + b, 0);
  const totalRetail = scenario.retailCashIn.reduce((a, b) => a + b, 0);
  const total = totalDTC + totalRetail;
  const dtcPct = (totalDTC / total) * 100;

  return (
    <ChartContainer
      title="Revenue Mix"
      icon="📈"
      stats={
        <>
          <StatBadge label="DTC" value={`${dtcPct.toFixed(0)}%`} color="lime" />
          <StatBadge label="Retail" value={`${(100 - dtcPct).toFixed(0)}%`} color="purple" />
          <StatBadge label="Total" value={formatCurrency(total)} color="teal" />
        </>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="dtcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.lime} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.lime} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="retailRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: COLORS.gray }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="dtc"
            stroke={COLORS.lime}
            fill="url(#dtcGradient)"
            strokeWidth={2}
            name="DTC"
            dot={false}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="retail"
            stroke={COLORS.purple}
            fill="url(#retailRevenueGradient)"
            strokeWidth={2}
            name="Retail"
            dot={false}
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
