"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  ChevronRight,
  Award,
  Zap,
  Target,
  ArrowRight,
  ArrowDown,
  Package,
  MapPin,
  BarChart3,
  FileText,
  Plus,
  Gift,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, Badge, Button, ProgressBar } from "@/components/ui";
import { journeyEngine } from "@/lib/journey/engine";
import { JOURNEY_STAGES, SamplingEvent } from "@/lib/journey/types";
import { useToast } from "@/components/ui/Toast";

export default function JourneyPage() {
  const { celebrate } = useToast();

  // State
  const [cansMetrics, setCansMetrics] = useState<ReturnType<typeof journeyEngine.getCansInHandsSummary> | null>(null);
  const [stageMetrics, setStageMetrics] = useState<ReturnType<typeof journeyEngine.getJourneyStageMetrics>>([]);
  const [correlations, setCorrelations] = useState<ReturnType<typeof journeyEngine.getImpactCorrelations> | null>(null);
  const [changeLog, setChangeLog] = useState<ReturnType<typeof journeyEngine.getChangeLog>>([]);
  const [events, setEvents] = useState<SamplingEvent[]>([]);
  const [macroView, setMacroView] = useState<ReturnType<typeof journeyEngine.getGrowthGeneratorMacro> | null>(null);
  const [dataRequests, setDataRequests] = useState<ReturnType<typeof journeyEngine.getPendingDataRequests>>([]);

  useEffect(() => {
    // Load all data
    setCansMetrics(journeyEngine.getCansInHandsSummary(3));
    setStageMetrics(journeyEngine.getJourneyStageMetrics());
    setCorrelations(journeyEngine.getImpactCorrelations());
    setChangeLog(journeyEngine.getChangeLog(5));
    setEvents(journeyEngine.getEvents(5));
    setMacroView(journeyEngine.getGrowthGeneratorMacro());
    setDataRequests(journeyEngine.getPendingDataRequests());
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getStageColor = (index: number) => {
    const colors = [
      "from-blue-500/20 to-blue-600/10 border-blue-500/30",
      "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
      "from-teal-500/20 to-teal-600/10 border-teal-500/30",
      "from-green-500/20 to-green-600/10 border-green-500/30",
      "from-lime-500/20 to-lime-600/10 border-lime-500/30",
      "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
      "from-orange-500/20 to-orange-600/10 border-orange-500/30",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Journey & Impact
            </h1>
            <p className="text-[#676986]">
              Customer journey, events, and business correlation tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Event
            </Button>
            <Button variant="secondary" size="sm">
              <FileText className="w-4 h-4 mr-1" /> Log Change
            </Button>
          </div>
        </div>
      </div>

      {/* Macro Growth Generator View */}
      {macroView && (
        <Card className="mb-6 border-2 border-[#e3f98a]/30 bg-gradient-to-r from-[#e3f98a]/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e3f98a]/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-[#e3f98a]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-white">Growth Generator Macro</h2>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-[#a8a8a8] mb-3">{macroView.currentFocus}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-[#676986] mb-1">Key Lever</p>
                  <p className="text-sm text-white">{macroView.keyLever}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-[#676986] mb-1">Expected Impact</p>
                  <p className="text-sm text-[#e3f98a]">{macroView.expectedImpact}</p>
                </div>
                {macroView.topActivity && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-[#676986] mb-1">Top Activity</p>
                    <p className="text-sm text-white">
                      {macroView.topActivity.name}{" "}
                      <span className="text-[#6BCB77]">
                        ({(macroView.topActivity.projectedRoi * 100).toFixed(0)}% ROI)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cans in Hands Summary */}
      {cansMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-[#8533fc]" />
            </div>
            <p className="text-2xl font-bold text-white">{cansMetrics.totalCans.toLocaleString()}</p>
            <p className="text-sm text-[#676986]">Cans Distributed</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#ff6b6b]" />
            </div>
            <p className="text-2xl font-bold text-white">${cansMetrics.avgCostPerCan.toFixed(2)}</p>
            <p className="text-sm text-[#676986]">Avg Cost/Can</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#6BCB77]" />
            </div>
            <p className="text-2xl font-bold text-[#6BCB77]">{(cansMetrics.avgRoi * 100).toFixed(0)}%</p>
            <p className="text-sm text-[#676986]">Avg ROI</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#65cdd8]" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(cansMetrics.totalAttributedRevenue)}</p>
            <p className="text-sm text-[#676986]">Attributed Revenue</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-[#ffce33]" />
            </div>
            <p className="text-2xl font-bold text-white">{cansMetrics.eventCount}</p>
            <p className="text-sm text-[#676986]">Events (3mo)</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Journey Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Journey Funnel */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#65cdd8]" />
                <h3 className="font-semibold text-white">Customer Journey</h3>
              </div>
              <Badge variant="info" size="sm">7 Stages</Badge>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {stageMetrics.map((stage, index) => {
                  const stageConfig = JOURNEY_STAGES[index];
                  const prevCustomers = index > 0 ? stageMetrics[index - 1].customersInStage : stage.customersInStage * 2;
                  const conversionFromPrev = index > 0 ? (stage.customersInStage / prevCustomers * 100) : 100;

                  return (
                    <div key={stage.stage} className="relative">
                      {/* Connection arrow */}
                      {index > 0 && (
                        <div className="absolute -top-2 left-6 w-0.5 h-2 bg-white/10" />
                      )}

                      <div
                        className={`p-4 rounded-xl bg-gradient-to-r ${getStageColor(index)} border`}
                        style={{ marginLeft: `${index * 8}px` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{stageConfig.name}</h4>
                              <p className="text-xs text-[#a8a8a8]">{stageConfig.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {stage.customersInStage.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#676986]">customers</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                          <div>
                            <p className="text-xs text-[#676986]">Conversion</p>
                            <p className="text-sm font-semibold text-white">
                              {conversionFromPrev.toFixed(0)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#676986]">Avg Days</p>
                            <p className="text-sm font-semibold text-white">{stage.avgDaysInStage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#676986]">Avg LTV</p>
                            <p className="text-sm font-semibold text-[#6BCB77]">
                              ${stage.avgLtv.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Arrow to next */}
                      {index < stageMetrics.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ArrowDown className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Events List */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8533fc]" />
                <h3 className="font-semibold text-white">Sampling Events</h3>
              </div>
              <Link href="/journey/events">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{event.name}</h4>
                      <p className="text-sm text-[#676986] flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                        <span className="text-[#676986]">•</span>
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={event.roi && event.roi > 1 ? "success" : event.roi && event.roi > 0.5 ? "warning" : "danger"}
                      size="sm"
                    >
                      {event.roi ? `${(event.roi * 100).toFixed(0)}% ROI` : "No ROI data"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-sm font-semibold text-white">{event.cansDistributed.toLocaleString()}</p>
                      <p className="text-xs text-[#676986]">Cans</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-sm font-semibold text-white">${event.costPerCan.toFixed(2)}</p>
                      <p className="text-xs text-[#676986]">Cost/Can</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-sm font-semibold text-[#6BCB77]">
                        {event.attributedNewCustomers?.toLocaleString() || "—"}
                      </p>
                      <p className="text-xs text-[#676986]">New Customers</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-sm font-semibold text-[#65cdd8]">
                        {event.attributedRetailVelocityLift
                          ? `+${(event.attributedRetailVelocityLift * 100).toFixed(0)}%`
                          : "—"}
                      </p>
                      <p className="text-xs text-[#676986]">Velocity Lift</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Correlations, Change Log, Data Requests */}
        <div className="space-y-6">
          {/* Impact Correlations */}
          {correlations && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#e3f98a]" />
                <h3 className="font-semibold text-white">Impact Correlations</h3>
              </div>
              <div className="space-y-3 mb-4">
                {correlations.topCorrelations.slice(0, 4).map((corr, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{corr.activity}</p>
                      <p className="text-xs text-[#676986]">{corr.metric}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${corr.impact > 0 ? "text-[#6BCB77]" : "text-[#ff6b6b]"}`}>
                        {corr.impact > 0 ? "+" : ""}{corr.impact.toFixed(0)}%
                      </span>
                      <Badge
                        variant={corr.confidence === "high" ? "success" : corr.confidence === "medium" ? "warning" : "default"}
                        size="sm"
                      >
                        {corr.confidence}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {correlations.recommendations.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-[#676986] uppercase tracking-wider mb-2">Recommendations</p>
                  <div className="space-y-2">
                    {correlations.recommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#e3f98a]/10">
                        <Sparkles className="w-4 h-4 text-[#e3f98a] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#e3f98a]">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Change Log */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#65cdd8]" />
                <h3 className="font-semibold text-white">Change Log</h3>
              </div>
              <Badge variant="info" size="sm">{changeLog.length} recent</Badge>
            </div>
            <div className="divide-y divide-white/5">
              {changeLog.map((change) => (
                <div key={change.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      change.significance === "major"
                        ? "bg-[#e3f98a]/20 text-[#e3f98a]"
                        : "bg-white/10 text-[#676986]"
                    }`}>
                      {change.shouldRepeat ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white">{change.title}</h4>
                      <p className="text-xs text-[#676986] mt-1">
                        {change.department} • {format(new Date(change.changedAt), "MMM d")}
                      </p>
                      {change.actualImpact && (
                        <p className="text-xs text-[#6BCB77] mt-1">{change.actualImpact}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Contribution Requests */}
          <Card className="border-2 border-[#8533fc]/20">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#8533fc]" />
              <h3 className="font-semibold text-white">Help Improve the System</h3>
            </div>
            <p className="text-sm text-[#a8a8a8] mb-4">
              Add data to unlock better insights and earn XP
            </p>
            <div className="space-y-3">
              {dataRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">{request.title}</h4>
                        <Badge
                          variant={request.priority === "critical" ? "danger" : request.priority === "high" ? "warning" : "default"}
                          size="sm"
                        >
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#676986] mt-1">{request.targetDepartment}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#e3f98a]">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-semibold">+{request.xpReward}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8533fc] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {request.impactPreview}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-1" /> Contribute Data
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
