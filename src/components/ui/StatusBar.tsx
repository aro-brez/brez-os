"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
} from "lucide-react";
import { devStore } from "@/lib/data/devStore";

interface MetricPulse {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  status: "good" | "warning" | "danger" | "neutral";
  href?: string;
}

export function StatusBar() {
  const [metrics, setMetrics] = useState<MetricPulse[]>([]);
  const [phase, setPhase] = useState<"stabilize" | "thrive" | "scale">("stabilize");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateMetrics = () => {
      const tasks = devStore.getTasks();
      const goals = devStore.getGoals();
      const snapshots = devStore.getFinancialSnapshots();
      const latestSnapshot = snapshots[0];

      const overdueTasks = tasks.filter((t) => {
        if (t.status === "done") return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      });

      const atRiskGoals = goals.filter((g) => g.status === "at_risk" || g.status === "behind");
      const inProgressTasks = tasks.filter((t) => t.status === "doing");
      const completedTasks = tasks.filter((t) => t.status === "done");

      setMetrics([
        {
          label: "Cash",
          value: latestSnapshot ? `$${(latestSnapshot.cashOnHand / 1000).toFixed(0)}K` : "$300K",
          status: latestSnapshot && latestSnapshot.cashOnHand > 250000 ? "good" : "warning",
          href: "/financials",
        },
        {
          label: "Runway",
          value: latestSnapshot ? `${Math.floor(latestSnapshot.cashOnHand / latestSnapshot.fixedWeeklyStack)}wk` : "5wk",
          status: latestSnapshot && (latestSnapshot.cashOnHand / latestSnapshot.fixedWeeklyStack) > 6 ? "good" : "warning",
          href: "/financials",
        },
        {
          label: "In Progress",
          value: `${inProgressTasks.length}`,
          status: inProgressTasks.length > 0 ? "good" : "neutral",
          href: "/tasks",
        },
        {
          label: "Goals",
          value: `${goals.filter((g) => g.status !== "completed").length}`,
          status: atRiskGoals.length > 0 ? "warning" : "good",
          href: "/goals",
        },
        {
          label: "At Risk",
          value: `${atRiskGoals.length}`,
          status: atRiskGoals.length > 0 ? "danger" : "good",
          href: "/goals",
        },
        {
          label: "Overdue",
          value: `${overdueTasks.length}`,
          status: overdueTasks.length > 0 ? "danger" : "good",
          href: "/tasks",
        },
      ]);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: MetricPulse["status"]) => {
    switch (status) {
      case "good": return "text-[#6BCB77]";
      case "warning": return "text-[#ffce33]";
      case "danger": return "text-[#ff6b6b]";
      default: return "text-[#a8a8a8]";
    }
  };

  const getStatusDot = (status: MetricPulse["status"]) => {
    switch (status) {
      case "good": return "bg-[#6BCB77]";
      case "warning": return "bg-[#ffce33]";
      case "danger": return "bg-[#ff6b6b]";
      default: return "bg-[#676986]";
    }
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case "stabilize":
        return { icon: <Shield className="w-3 h-3" />, color: "#ffce33", label: "STABILIZE" };
      case "thrive":
        return { icon: <TrendingUp className="w-3 h-3" />, color: "#6BCB77", label: "THRIVE" };
      case "scale":
        return { icon: <Zap className="w-3 h-3" />, color: "#65cdd8", label: "SCALE" };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-[#0D0D2A]/95 backdrop-blur-sm border-b border-white/5 hidden md:flex items-center px-4 md:pl-[272px]">
      {/* Phase Badge */}
      <Link href="/plan" className="flex items-center gap-1.5 px-2 py-0.5 rounded-full mr-4 hover:bg-white/5 transition-colors" style={{ backgroundColor: `${phaseInfo.color}15`, color: phaseInfo.color }}>
        {phaseInfo.icon}
        <span className="text-[10px] font-bold tracking-wider">{phaseInfo.label}</span>
      </Link>

      {/* Metrics */}
      <div className="flex items-center gap-4 flex-1">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href || "#"}
            className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-colors group"
          >
            <div className={clsx("w-1.5 h-1.5 rounded-full", getStatusDot(metric.status))} />
            <span className="text-[10px] text-[#676986] uppercase tracking-wider group-hover:text-[#a8a8a8]">{metric.label}</span>
            <span className={clsx("text-xs font-semibold", getStatusColor(metric.status))}>{metric.value}</span>
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 text-[10px] text-[#676986]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#8533fc]/20 text-[#8533fc] font-semibold">DEV MODE</span>
      </div>
    </div>
  );
}
