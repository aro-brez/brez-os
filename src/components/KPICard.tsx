"use client";

import { useEffect, useState } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  progress?: number;
  animate?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  variant = "default",
  icon,
  trend,
  trendValue,
  progress,
  animate = true,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (animate && typeof value === "number") {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  const gradientStyles = {
    default: "from-[#e3f98a] to-[#c8e070]",
    success: "from-[#6BCB77] to-[#4ECDC4]",
    warning: "from-[#ffce33] to-[#FFA726]",
    danger: "from-[#ff6b6b] to-[#EE5A5A]",
  };

  const iconStyles = {
    default: "bg-[#e3f98a]/20 text-[#e3f98a]",
    success: "bg-[#6BCB77]/20 text-[#6BCB77]",
    warning: "bg-[#ffce33]/20 text-[#ffce33]",
    danger: "bg-[#ff6b6b]/20 text-[#ff6b6b]",
  };

  const glowStyles = {
    default: "group-hover:shadow-[0_0_30px_rgba(227,249,138,0.3)]",
    success: "group-hover:shadow-[0_0_30px_rgba(107,203,119,0.3)]",
    warning: "group-hover:shadow-[0_0_30px_rgba(255,206,51,0.3)]",
    danger: "group-hover:shadow-[0_0_30px_rgba(255,107,107,0.3)]",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  const trendColors = {
    up: "text-[#6BCB77]",
    down: "text-[#ff6b6b]",
    neutral: "text-[#676986]",
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br from-[#242445] to-[#1a1a3e]
        shadow-lg hover:shadow-2xl transition-all duration-300
        hover:-translate-y-1 cursor-pointer group
        border border-white/5 hover:border-[#e3f98a]/30
        ${glowStyles[variant]}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{ transitionDelay: "100ms" }}
    >
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientStyles[variant]}`}
      />

      {/* Floating decoration */}
      <div
        className={`
          absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20
          bg-gradient-to-br ${gradientStyles[variant]}
          group-hover:scale-125 transition-transform duration-500 blur-xl
        `}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#a8a8a8]">{title}</span>
          {icon && (
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${iconStyles[variant]}`}
            >
              {icon}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end gap-2">
          <span
            className={`text-3xl font-bold bg-gradient-to-r ${gradientStyles[variant]} bg-clip-text text-transparent`}
          >
            {typeof displayValue === "number"
              ? formatNumber(displayValue)
              : displayValue}
          </span>
          {trend && (
            <span
              className={`text-sm font-medium ${trendColors[trend]} flex items-center gap-1 mb-1`}
            >
              {trendIcons[trend]} {trendValue}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-sm text-[#676986]">{subtitle}</p>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-2 bg-[#0D0D2A] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradientStyles[variant]} progress-animated`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Achievement badge for success */}
      {variant === "success" && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs bg-[#6BCB77] text-[#0D0D2A] rounded-full font-bold shadow-[0_0_10px_rgba(107,203,119,0.5)]">
            ✓
          </span>
        </div>
      )}
    </div>
  );
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `$${(n / 1_000).toFixed(0)}K`;
  }
  return n < 0 ? `-$${Math.abs(n).toFixed(0)}` : `$${n.toFixed(0)}`;
}

// New component: Score Card for gamified metrics
interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
  icon: string;
  color: "lime" | "green" | "purple" | "gold" | "teal";
}

export function ScoreCard({
  label,
  score,
  maxScore,
  icon,
  color,
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  const colorStyles = {
    lime: {
      bg: "bg-[#e3f98a]/20",
      fill: "bg-gradient-to-r from-[#e3f98a] to-[#c8e070]",
      text: "text-[#e3f98a]",
      glow: "shadow-[0_0_15px_rgba(227,249,138,0.3)]",
    },
    green: {
      bg: "bg-[#6BCB77]/20",
      fill: "bg-gradient-to-r from-[#6BCB77] to-[#4ECDC4]",
      text: "text-[#6BCB77]",
      glow: "shadow-[0_0_15px_rgba(107,203,119,0.3)]",
    },
    purple: {
      bg: "bg-[#8533fc]/20",
      fill: "bg-gradient-to-r from-[#8533fc] to-[#EACCFF]",
      text: "text-[#EACCFF]",
      glow: "shadow-[0_0_15px_rgba(133,51,252,0.3)]",
    },
    gold: {
      bg: "bg-[#ffce33]/20",
      fill: "bg-gradient-to-r from-[#ffce33] to-[#FFA726]",
      text: "text-[#ffce33]",
      glow: "shadow-[0_0_15px_rgba(255,206,51,0.3)]",
    },
    teal: {
      bg: "bg-[#65cdd8]/20",
      fill: "bg-gradient-to-r from-[#65cdd8] to-[#4ECDC4]",
      text: "text-[#65cdd8]",
      glow: "shadow-[0_0_15px_rgba(101,205,216,0.3)]",
    },
  };

  return (
    <div className={`bg-gradient-to-br from-[#242445] to-[#1a1a3e] rounded-xl p-4 shadow-lg hover:${colorStyles[color].glow} transition-all border border-white/5 hover:border-[#e3f98a]/20`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colorStyles[color].bg}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-[#a8a8a8]">{label}</p>
          <p className={`text-lg font-bold ${colorStyles[color].text}`}>
            {score.toLocaleString()} / {maxScore.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="h-3 bg-[#0D0D2A] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorStyles[color].fill} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: "go" | "caution" | "stop";
  label: string;
  pulse?: boolean;
}

export function StatusBadge({ status, label, pulse = true }: StatusBadgeProps) {
  const styles = {
    go: {
      bg: "bg-[#e3f98a]",
      text: "text-[#0D0D2A]",
      glow: "shadow-[0_0_30px_rgba(227,249,138,0.6)]",
      icon: "🚀",
    },
    caution: {
      bg: "bg-gradient-to-r from-[#ffce33] to-[#FFA726]",
      text: "text-[#0D0D2A]",
      glow: "shadow-[0_0_30px_rgba(255,206,51,0.5)]",
      icon: "⚠️",
    },
    stop: {
      bg: "bg-gradient-to-r from-[#ff6b6b] to-[#EE5A5A]",
      text: "text-white",
      glow: "shadow-[0_0_30px_rgba(255,107,107,0.5)]",
      icon: "🛑",
    },
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 rounded-full
        ${styles[status].bg} ${styles[status].glow}
        ${styles[status].text} font-extrabold text-sm uppercase tracking-wider
        ${pulse ? "animate-pulse" : ""}
      `}
    >
      <span className="text-lg">{styles[status].icon}</span>
      {label}
    </div>
  );
}
