"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Calendar,
} from "lucide-react";
import { Card, Button, Badge, Modal, Input, Textarea, ProgressBar } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { FinancialSnapshot } from "@/lib/data/schemas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FinancialsPage() {
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);
  const [showNewSnapshotModal, setShowNewSnapshotModal] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = () => {
    setSnapshots(devStore.getFinancialSnapshots());
  };

  const latest = snapshots[0];
  const netCashFlow = latest ? latest.arExpectedNext2Weeks - latest.apDueNext2Weeks : 0;
  const runway = latest ? Math.floor(latest.cashOnHand / latest.fixedWeeklyStack) : 0;
  const projectedCash = latest ? latest.cashOnHand + netCashFlow - (latest.fixedWeeklyStack * 2) : 0;

  // Chart data
  const chartData = snapshots
    .slice()
    .reverse()
    .map((s) => ({
      date: format(new Date(s.date), "MMM d"),
      cash: s.cashOnHand / 1000,
      projected: (s.cashOnHand + s.arExpectedNext2Weeks - s.apDueNext2Weeks - s.fixedWeeklyStack * 2) / 1000,
    }));

  // Determine next best action
  const getNextBestAction = () => {
    if (!latest) return null;

    if (runway < 4) {
      return {
        action: "Raise capital or cut costs immediately",
        type: "critical" as const,
        reason: `Only ${runway} weeks of runway remaining`,
      };
    }

    if (netCashFlow < -50000) {
      return {
        action: "Review accounts payable for deferrals",
        type: "warning" as const,
        reason: "High cash outflow expected in next 2 weeks",
      };
    }

    if (projectedCash < latest.cashOnHand * 0.8) {
      return {
        action: "Accelerate AR collection",
        type: "warning" as const,
        reason: "Cash position declining",
      };
    }

    return {
      action: "Maintain current trajectory",
      type: "success" as const,
      reason: "Financial position is healthy",
    };
  };

  const nextAction = getNextBestAction();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#e3f98a]" />
            Financials
          </h1>
          <p className="text-[#676986] mt-1">Track cash position and runway</p>
        </div>
        <Button onClick={() => setShowNewSnapshotModal(true)}>
          <Plus className="w-4 h-4" />
          New Snapshot
        </Button>
      </div>

      {!latest ? (
        <Card className="py-12">
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-[#676986] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No financial data yet</h3>
            <p className="text-sm text-[#676986] mb-4">
              Add your first snapshot to start tracking
            </p>
            <Button onClick={() => setShowNewSnapshotModal(true)}>
              <Plus className="w-4 h-4" />
              Add Snapshot
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Next Best Action */}
          {nextAction && (
            <Card className={`mb-6 border-l-4 ${
              nextAction.type === "critical" ? "border-l-[#ff6b6b] bg-[#ff6b6b]/5" :
              nextAction.type === "warning" ? "border-l-[#ffce33] bg-[#ffce33]/5" :
              "border-l-[#6BCB77] bg-[#6BCB77]/5"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  nextAction.type === "critical" ? "bg-[#ff6b6b]/20" :
                  nextAction.type === "warning" ? "bg-[#ffce33]/20" :
                  "bg-[#6BCB77]/20"
                }`}>
                  <Zap className={`w-5 h-5 ${
                    nextAction.type === "critical" ? "text-[#ff6b6b]" :
                    nextAction.type === "warning" ? "text-[#ffce33]" :
                    "text-[#6BCB77]"
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#a8a8a8] uppercase tracking-wider">
                      Next Best Action
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">{nextAction.action}</h2>
                  <p className="text-sm text-[#676986]">{nextAction.reason}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#676986] uppercase">Cash on Hand</span>
                <DollarSign className="w-4 h-4 text-[#6BCB77]" />
              </div>
              <p className="text-2xl font-bold text-[#6BCB77]">
                ${(latest.cashOnHand / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-[#676986] mt-1">
                as of {format(new Date(latest.date), "MMM d")}
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#676986] uppercase">Runway</span>
                {runway > 8 ? (
                  <CheckCircle className="w-4 h-4 text-[#6BCB77]" />
                ) : runway > 4 ? (
                  <AlertTriangle className="w-4 h-4 text-[#ffce33]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
                )}
              </div>
              <p className={`text-2xl font-bold ${
                runway > 8 ? "text-[#6BCB77]" :
                runway > 4 ? "text-[#ffce33]" :
                "text-[#ff6b6b]"
              }`}>
                {runway} weeks
              </p>
              <p className="text-xs text-[#676986] mt-1">
                @ ${(latest.fixedWeeklyStack / 1000).toFixed(0)}K/week
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#676986] uppercase">Net Flow (2wk)</span>
                {netCashFlow >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#6BCB77]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#ff6b6b]" />
                )}
              </div>
              <p className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-[#6BCB77]" : "text-[#ff6b6b]"}`}>
                {netCashFlow >= 0 ? "+" : ""}${(netCashFlow / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-[#676986] mt-1">AR - AP</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#676986] uppercase">Projected (2wk)</span>
                <Calendar className="w-4 h-4 text-[#65cdd8]" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${(projectedCash / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-[#676986] mt-1">after expenses</p>
            </Card>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* AR/AP Details */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Cash Flow Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#676986]">AR Expected (2wk)</span>
                    <span className="text-[#6BCB77] font-semibold">
                      +${(latest.arExpectedNext2Weeks / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <ProgressBar
                    value={latest.arExpectedNext2Weeks}
                    max={latest.cashOnHand}
                    variant="success"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#676986]">AP Due (2wk)</span>
                    <span className="text-[#ff6b6b] font-semibold">
                      -${(latest.apDueNext2Weeks / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <ProgressBar
                    value={latest.apDueNext2Weeks}
                    max={latest.cashOnHand}
                    variant="danger"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#676986]">Fixed Weekly Stack</span>
                    <span className="text-white font-semibold">
                      ${(latest.fixedWeeklyStack / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <ProgressBar
                    value={latest.fixedWeeklyStack * 2}
                    max={latest.cashOnHand}
                    variant="warning"
                  />
                </div>
              </div>
              {latest.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-[#676986]">Notes</p>
                  <p className="text-sm text-[#a8a8a8] mt-1">{latest.notes}</p>
                </div>
              )}
            </Card>

            {/* Chart */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-white mb-4">Cash History</h3>
              {chartData.length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#242445" />
                      <XAxis dataKey="date" stroke="#676986" tick={{ fill: "#676986", fontSize: 12 }} />
                      <YAxis
                        stroke="#676986"
                        tick={{ fill: "#676986", fontSize: 12 }}
                        tickFormatter={(v) => `$${v}K`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a3e",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{ color: "#a8a8a8" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cash"
                        stroke="#e3f98a"
                        strokeWidth={2}
                        dot={{ fill: "#e3f98a", r: 4 }}
                        name="Cash on Hand"
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#65cdd8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#65cdd8", r: 3 }}
                        name="Projected"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#676986]">
                  Add more snapshots to see trends
                </div>
              )}
            </Card>
          </div>

          {/* Snapshot History */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Snapshot History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-[#676986] font-medium">Date</th>
                    <th className="text-right py-3 px-4 text-[#676986] font-medium">Cash</th>
                    <th className="text-right py-3 px-4 text-[#676986] font-medium">AR (2wk)</th>
                    <th className="text-right py-3 px-4 text-[#676986] font-medium">AP (2wk)</th>
                    <th className="text-right py-3 px-4 text-[#676986] font-medium">Weekly Stack</th>
                    <th className="text-right py-3 px-4 text-[#676986] font-medium">Runway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {snapshots.map((snapshot) => {
                    const snapshotRunway = Math.floor(snapshot.cashOnHand / snapshot.fixedWeeklyStack);
                    return (
                      <tr key={snapshot.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 text-white">
                          {format(new Date(snapshot.date), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-right text-[#6BCB77] font-medium">
                          ${(snapshot.cashOnHand / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-right text-[#6BCB77]">
                          +${(snapshot.arExpectedNext2Weeks / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-right text-[#ff6b6b]">
                          -${(snapshot.apDueNext2Weeks / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          ${(snapshot.fixedWeeklyStack / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            variant={snapshotRunway > 8 ? "success" : snapshotRunway > 4 ? "warning" : "danger"}
                          >
                            {snapshotRunway}wk
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* New Snapshot Modal */}
      <SnapshotModal
        isOpen={showNewSnapshotModal}
        onClose={() => setShowNewSnapshotModal(false)}
        onSave={() => {
          loadSnapshots();
          setShowNewSnapshotModal(false);
        }}
      />
    </div>
  );
}

function SnapshotModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [cashOnHand, setCashOnHand] = useState("");
  const [apDue, setApDue] = useState("");
  const [arExpected, setArExpected] = useState("");
  const [weeklyStack, setWeeklyStack] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!cashOnHand || !apDue || !arExpected || !weeklyStack) return;

    devStore.addFinancialSnapshot({
      date,
      cashOnHand: Number(cashOnHand),
      apDueNext2Weeks: Number(apDue),
      arExpectedNext2Weeks: Number(arExpected),
      fixedWeeklyStack: Number(weeklyStack),
      notes: notes || undefined,
      createdBy: devStore.getCurrentUser().id,
    });

    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Financial Snapshot" size="md">
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Cash on Hand ($)"
          type="number"
          value={cashOnHand}
          onChange={(e) => setCashOnHand(e.target.value)}
          placeholder="e.g., 685000"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="AP Due (2 weeks) ($)"
            type="number"
            value={apDue}
            onChange={(e) => setApDue(e.target.value)}
            placeholder="e.g., 125000"
          />
          <Input
            label="AR Expected (2 weeks) ($)"
            type="number"
            value={arExpected}
            onChange={(e) => setArExpected(e.target.value)}
            placeholder="e.g., 95000"
          />
        </div>
        <Input
          label="Fixed Weekly Stack ($)"
          type="number"
          value={weeklyStack}
          onChange={(e) => setWeeklyStack(e.target.value)}
          placeholder="e.g., 45000"
        />
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any context for this snapshot..."
          rows={2}
        />
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!cashOnHand || !apDue || !arExpected || !weeklyStack}>
            Save Snapshot
          </Button>
        </div>
      </div>
    </Modal>
  );
}
