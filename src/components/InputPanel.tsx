"use client";

import { Inputs } from "@/lib/types";
import { ChangeEvent, useState } from "react";

interface InputPanelProps {
  inputs: Inputs;
  onChange: (inputs: Inputs) => void;
  title: string;
  isScenario?: boolean;
}

export function InputPanel({
  inputs,
  onChange,
  title,
  isScenario = false,
}: InputPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Cash", "DTC Spend"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = <K extends keyof Inputs>(
    section: K,
    field: string,
    value: number | string | boolean
  ) => {
    const newInputs = { ...inputs };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionData = { ...(newInputs[section] as any) };

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      sectionData[parent] = { ...sectionData[parent], [child]: value };
    } else {
      sectionData[field] = value;
    }

    newInputs[section] = sectionData;
    onChange(newInputs);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg ${
          isScenario
            ? "bg-[#65cdd8]/20"
            : "bg-[#e3f98a]/20"
        }`}>
          {isScenario ? "🔮" : "📊"}
        </span>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-[#676986]">
            {isScenario ? "Test different scenarios" : "Current business state"}
          </p>
        </div>
      </div>

      {/* Sections */}
      <Section
        title="Cash"
        icon="💰"
        color="lime"
        expanded={expandedSections.has("Cash")}
        onToggle={() => toggleSection("Cash")}
      >
        <SliderInput
          label="Cash on Hand"
          value={inputs.cash.cashOnHand}
          onChange={(v) => updateField("cash", "cashOnHand", v)}
          min={0}
          max={2000000}
          step={10000}
          prefix="$"
          color="lime"
        />
        <SliderInput
          label="Reserve Floor"
          value={inputs.cash.reserveFloor}
          onChange={(v) => updateField("cash", "reserveFloor", v)}
          min={0}
          max={500000}
          step={10000}
          prefix="$"
          color="green"
        />
      </Section>

      <Section
        title="DTC Spend"
        icon="🎯"
        color="purple"
        expanded={expandedSections.has("DTC Spend")}
        onToggle={() => toggleSection("DTC Spend")}
      >
        <SliderInput
          label="Weekly Spend"
          value={inputs.dtc.spendPlan.weeklySpend}
          onChange={(v) => updateField("dtc", "spendPlan.weeklySpend", v)}
          min={0}
          max={100000}
          step={1000}
          prefix="$"
          color="purple"
        />
        <ToggleInput
          label="CAC Mode"
          options={[
            { value: "constant", label: "Constant", icon: "📊" },
            { value: "curve", label: "Curve", icon: "📈" },
          ]}
          value={inputs.dtc.cacModel.mode}
          onChange={(v) => updateField("dtc", "cacModel.mode", v)}
        />
        <SliderInput
          label="CAC"
          value={inputs.dtc.cacModel.cac}
          onChange={(v) => updateField("dtc", "cacModel.cac", v)}
          min={20}
          max={150}
          step={1}
          prefix="$"
          color="gold"
        />
        {inputs.dtc.cacModel.mode === "curve" && (
          <SliderInput
            label="CAC Curve Slope"
            value={inputs.dtc.cacModel.curve.slope}
            onChange={(v) => updateField("dtc", "cacModel.curve.slope", v)}
            min={0}
            max={0.005}
            step={0.0001}
            color="gold"
            decimals={4}
          />
        )}
      </Section>

      <Section
        title="First Order"
        icon="🛒"
        color="green"
        expanded={expandedSections.has("First Order")}
        onToggle={() => toggleSection("First Order")}
      >
        <SliderInput
          label="First Order AOV"
          value={inputs.dtc.firstOrder.firstOrderAOV}
          onChange={(v) => updateField("dtc", "firstOrder.firstOrderAOV", v)}
          min={50}
          max={200}
          step={1}
          prefix="$"
          color="green"
        />
        <SliderInput
          label="DTC Margin"
          value={inputs.dtc.firstOrder.dtcContributionMargin * 100}
          onChange={(v) => updateField("dtc", "firstOrder.dtcContributionMargin", v / 100)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          color="green"
        />
      </Section>

      <Section
        title="Subscriptions"
        icon="🔄"
        color="teal"
        expanded={expandedSections.has("Subscriptions")}
        onToggle={() => toggleSection("Subscriptions")}
      >
        <SliderInput
          label="Starting Subs"
          value={inputs.subs.startingActiveSubs}
          onChange={(v) => updateField("subs", "startingActiveSubs", v)}
          min={0}
          max={50000}
          step={100}
          color="teal"
        />
        <SliderInput
          label="Sub Share of New"
          value={inputs.subs.subShareOfNewCustomers * 100}
          onChange={(v) => updateField("subs", "subShareOfNewCustomers", v / 100)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          color="teal"
        />
        <SliderInput
          label="Weekly Survival"
          value={inputs.subs.weeklySurvival_sw * 100}
          onChange={(v) => updateField("subs", "weeklySurvival_sw", v / 100)}
          min={80}
          max={100}
          step={0.1}
          suffix="%"
          color="green"
          decimals={1}
        />
        <SliderInput
          label="Rev per Sub/Week"
          value={inputs.subs.weeklyRepeatPerActive_pw}
          onChange={(v) => updateField("subs", "weeklyRepeatPerActive_pw", v)}
          min={0}
          max={50}
          step={0.5}
          prefix="$"
          color="gold"
          decimals={2}
        />
      </Section>

      <Section
        title="Retail"
        icon="🏪"
        color="lime"
        expanded={expandedSections.has("Retail")}
        onToggle={() => toggleSection("Retail")}
      >
        <SliderInput
          label="Alpha (Sell-Through)"
          value={inputs.retail.alpha}
          onChange={(v) => updateField("retail", "alpha", v)}
          min={0}
          max={1}
          step={0.01}
          color="lime"
          decimals={3}
        />
        <SliderInput
          label="Alpha (Sell-In)"
          value={inputs.retail.alphaSellInScaled}
          onChange={(v) => updateField("retail", "alphaSellInScaled", v)}
          min={0}
          max={1}
          step={0.01}
          color="lime"
          decimals={3}
        />
        <SliderInput
          label="Retail Margin"
          value={inputs.retail.retailContributionMargin * 100}
          onChange={(v) => updateField("retail", "retailContributionMargin", v / 100)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          color="green"
        />
      </Section>

      {isScenario && (
        <Section
          title="Loan Modeling"
          icon="🏦"
          color="gold"
          expanded={expandedSections.has("Loan Modeling")}
          onToggle={() => toggleSection("Loan Modeling")}
        >
          <SwitchInput
            label="Enable Loan"
            checked={inputs.loan.enabled}
            onChange={(v) => updateField("loan", "enabled", v)}
          />
          {inputs.loan.enabled && (
            <>
              <SliderInput
                label="Draw Week"
                value={inputs.loan.drawWeek}
                onChange={(v) => updateField("loan", "drawWeek", v)}
                min={0}
                max={52}
                step={1}
                color="gold"
              />
              <SliderInput
                label="Draw Amount"
                value={inputs.loan.drawAmount}
                onChange={(v) => updateField("loan", "drawAmount", v)}
                min={0}
                max={inputs.loan.maxFacility}
                step={50000}
                prefix="$"
                color="gold"
              />
              <SliderInput
                label="Monthly Payment"
                value={inputs.loan.monthlyPayment}
                onChange={(v) => updateField("loan", "monthlyPayment", v)}
                min={0}
                max={500000}
                step={10000}
                prefix="$"
                color="lime"
              />
            </>
          )}
        </Section>
      )}

      <Section
        title="Non-Sub Revenue"
        icon="🔙"
        color="green"
        expanded={expandedSections.has("Non-Sub Revenue")}
        onToggle={() => toggleSection("Non-Sub Revenue")}
      >
        <SwitchInput
          label="Enable"
          checked={inputs.dtc.nonSubReturningBase.enabled}
          onChange={(v) => updateField("dtc", "nonSubReturningBase.enabled", v)}
        />
        {inputs.dtc.nonSubReturningBase.enabled && (
          <>
            <SliderInput
              label="Weekly Base"
              value={inputs.dtc.nonSubReturningBase.weeklyBaseRevenue}
              onChange={(v) => updateField("dtc", "nonSubReturningBase.weeklyBaseRevenue", v)}
              min={0}
              max={300000}
              step={5000}
              prefix="$"
              color="green"
            />
            <SliderInput
              label="Weekly Decay"
              value={inputs.dtc.nonSubReturningBase.weeklyDecay * 100}
              onChange={(v) => updateField("dtc", "nonSubReturningBase.weeklyDecay", v / 100)}
              min={80}
              max={100}
              step={0.5}
              suffix="%"
              color="lime"
              decimals={1}
            />
          </>
        )}
      </Section>
    </div>
  );
}

// Collapsible Section Component
function Section({
  title,
  icon,
  color,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  color: "lime" | "green" | "purple" | "gold" | "teal";
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const colorStyles = {
    lime: "border-[#e3f98a]/20 bg-[#e3f98a]/5",
    green: "border-[#6BCB77]/20 bg-[#6BCB77]/5",
    purple: "border-[#8533fc]/20 bg-[#8533fc]/5",
    gold: "border-[#ffce33]/20 bg-[#ffce33]/5",
    teal: "border-[#65cdd8]/20 bg-[#65cdd8]/5",
  };

  return (
    <div className={`rounded-xl border ${colorStyles[color]} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className={`text-lg text-[#676986] transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="p-3 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// Slider Input with visual feedback
function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  color = "lime",
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  color?: "lime" | "green" | "purple" | "gold" | "teal";
  decimals?: number;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  const colorStyles = {
    lime: "from-[#e3f98a] to-[#c8e070]",
    green: "from-[#6BCB77] to-[#4ECDC4]",
    purple: "from-[#8533fc] to-[#EACCFF]",
    gold: "from-[#ffce33] to-[#FFA726]",
    teal: "from-[#65cdd8] to-[#4ECDC4]",
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value) || 0;
    onChange(Math.max(min, Math.min(max, raw)));
  };

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(decimals > 0 ? 1 : 0)}K`;
    return v.toFixed(decimals);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#a8a8a8]">{label}</label>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#676986]">{prefix}</span>
          <input
            type="number"
            value={value.toFixed(decimals)}
            onChange={handleInputChange}
            step={step}
            className="w-20 px-2 py-1 text-sm font-semibold text-right bg-[#0D0D2A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#e3f98a] focus:ring-2 focus:ring-[#e3f98a]/20"
          />
          <span className="text-xs text-[#676986]">{suffix}</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-2 bg-[#0D0D2A] rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colorStyles[color]} transition-all duration-150`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#676986]/50">{prefix}{formatValue(min)}{suffix}</span>
          <span className="text-[10px] text-[#676986]/50">{prefix}{formatValue(max)}{suffix}</span>
        </div>
      </div>
    </div>
  );
}

// Toggle Button Group
function ToggleInput({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; icon?: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#a8a8a8]">{label}</label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? "bg-[#e3f98a] text-[#0D0D2A] shadow-lg shadow-[#e3f98a]/20"
                : "bg-[#0D0D2A] border border-white/10 text-[#a8a8a8] hover:border-[#e3f98a]/50"
            }`}
          >
            {option.icon && <span>{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Switch Input
function SwitchInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-[#a8a8a8]">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked
            ? "bg-[#e3f98a] shadow-lg shadow-[#e3f98a]/30"
            : "bg-[#0D0D2A] border border-white/10"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-transform ${
            checked ? "translate-x-7 bg-[#0D0D2A]" : "translate-x-1 bg-[#676986]"
          }`}
        />
      </button>
    </div>
  );
}
