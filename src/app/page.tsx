"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  CheckSquare,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Zap,
  HelpCircle,
  Clock,
  Users,
  Calendar,
  Video,
  Check,
  Plus,
  Bot,
  ChevronRight,
  Shield,
  RefreshCw,
  Play,
} from "lucide-react";
import { Card, Badge, Button, Avatar, ProgressBar } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { getTopPriorities, getNextBestAction, getQuestionsToAnswer, Priority, NextBestAction, QuestionToAnswer } from "@/lib/ai/prioritizer";
import { Huddle } from "@/lib/data/schemas";
import { useToast } from "@/components/ui/Toast";
import { useAIAssistant } from "@/components/ui/AIAssistant";

export default function CommandCenter() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [nextAction, setNextAction] = useState<NextBestAction | null>(null);
  const [questions, setQuestions] = useState<QuestionToAnswer[]>([]);
  const [huddles, setHuddles] = useState<Huddle[]>([]);
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });
  const [aiInsight, setAiInsight] = useState({ text: "", type: "tip" as "tip" | "warning" | "action" });
  const { celebrate } = useToast();
  const { toggle: toggleAI } = useAIAssistant();

  useEffect(() => {
    // Time-aware greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good morning", emoji: "sun" });
    else if (hour < 17) setGreeting({ text: "Good afternoon", emoji: "sun" });
    else if (hour < 21) setGreeting({ text: "Good evening", emoji: "moon" });
    else setGreeting({ text: "Burning midnight oil", emoji: "owl" });

    // Load AI-prioritized data
    setPriorities(getTopPriorities(5));
    setNextAction(getNextBestAction());
    setQuestions(getQuestionsToAnswer(undefined, 3));

    // Load recent meeting summaries
    setHuddles(devStore.getFinalizedHuddles().slice(0, 3));

    // Generate AI insight
    const insights = [
      { text: "Focus on DTC contribution margin - this is the Growth Generator's first step.", type: "tip" as const },
      { text: "2 goals are at risk. Consider reviewing blockers in today's standup.", type: "warning" as const },
      { text: "3 meeting action items await approval to become tasks.", type: "action" as const },
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, []);

  const approveActionItem = (huddleId: string, actionItemId: string) => {
    const newTask = devStore.approveHuddleActionItem(huddleId, actionItemId, true);
    if (newTask) {
      celebrate(`Task created: "${newTask.title.substring(0, 30)}..."`);
      setHuddles(devStore.getFinalizedHuddles().slice(0, 3));
    }
  };

  const currentUser = devStore.getCurrentUser();
  const tasks = devStore.getTasks();
  const goals = devStore.getGoals();
  const snapshots = devStore.getFinancialSnapshots();

  const todaysTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const atRiskGoals = goals.filter((g) => g.status === "at_risk" || g.status === "behind");
  const latestSnapshot = snapshots[0];

  const getGreetingEmoji = () => {
    if (greeting.emoji === "sun") return "☀️";
    if (greeting.emoji === "moon") return "🌙";
    if (greeting.emoji === "owl") return "🦉";
    return "👋";
  };

  const getPriorityColor = (urgency: Priority["urgency"]) => {
    switch (urgency) {
      case "critical": return "danger";
      case "high": return "warning";
      case "medium": return "info";
      default: return "default";
    }
  };

  const pendingDecisions = huddles.reduce((acc, h) => acc + (h.decisions?.filter((d) => !d.approved).length || 0), 0);
  const pendingActionItems = huddles.reduce((acc, h) => acc + (h.actionItems?.filter((ai) => !ai.taskId).length || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getGreetingEmoji()}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {greeting.text}, {currentUser.name.split(" ")[0]}
              </h1>
              <p className="text-[#676986]">
                {format(new Date(), "EEEE, MMMM d")} • Command Center
              </p>
            </div>
          </div>
          <Link href="/plan">
            <Button variant="secondary" size="sm" className="hidden md:flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ffce33]" />
              <span>Phase: Stabilize</span>
            </Button>
          </Link>
        </div>

        {/* AI Insight Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#e3f98a]/10 via-[#65cdd8]/5 to-transparent border border-[#e3f98a]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#0D0D2A]" />
              </div>
              <div>
                <p className="text-sm text-white">{aiInsight.text}</p>
                <p className="text-xs text-[#676986] mt-0.5">AI Insight • Updated just now</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleAI} className="text-[#e3f98a]">
              Ask AI <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Next Best Action - Hero Card */}
      {nextAction && (
        <Card className="mb-6 overflow-hidden border-2 border-[#e3f98a]/30">
          <div className="p-6 bg-gradient-to-r from-[#e3f98a]/10 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e3f98a]/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#e3f98a]" />
                  </div>
                  <span className="text-sm font-semibold text-[#e3f98a] uppercase tracking-wider">
                    Next Best Action
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {nextAction.action}
                </h2>
                <p className="text-[#a8a8a8]">{nextAction.reason}</p>
              </div>
              <div className="flex flex-col gap-2">
                {nextAction.linkedTaskId && (
                  <Link href={`/tasks?task=${nextAction.linkedTaskId}`}>
                    <Button variant="primary" size="sm">
                      <Play className="w-4 h-4 mr-1" /> Start Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link href="/tasks">
          <Card className="p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <CheckSquare className="w-5 h-5 text-[#65cdd8]" />
              <span className="text-2xl font-bold text-white">{todaysTasks.length}</span>
            </div>
            <p className="text-sm text-[#676986] group-hover:text-[#a8a8a8]">Due Today</p>
          </Card>
        </Link>
        <Link href="/goals">
          <Card className="p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-[#ffce33]" />
              <span className="text-2xl font-bold text-[#ffce33]">{atRiskGoals.length}</span>
            </div>
            <p className="text-sm text-[#676986] group-hover:text-[#a8a8a8]">At Risk Goals</p>
          </Card>
        </Link>
        <Link href="/channels">
          <Card className="p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-5 h-5 text-[#8533fc]" />
              <span className="text-2xl font-bold text-white">{pendingDecisions}</span>
            </div>
            <p className="text-sm text-[#676986] group-hover:text-[#a8a8a8]">Pending Decisions</p>
          </Card>
        </Link>
        <Link href="/financials">
          <Card className="p-4 hover:border-[#e3f98a]/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#6BCB77]" />
              <span className="text-2xl font-bold text-[#6BCB77]">
                ${latestSnapshot ? (latestSnapshot.cashOnHand / 1000).toFixed(0) : 300}K
              </span>
            </div>
            <p className="text-sm text-[#676986] group-hover:text-[#a8a8a8]">Cash on Hand</p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Priorities & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priorities */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e3f98a]" />
                <h3 className="font-semibold text-white">AI-Prioritized Tasks</h3>
                <Badge variant="info" size="sm">Smart Sort</Badge>
              </div>
              <Link href="/tasks" className="text-sm text-[#65cdd8] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {priorities.length === 0 ? (
                <div className="p-8 text-center text-[#676986]">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No urgent priorities right now</p>
                </div>
              ) : (
                priorities.map((priority, index) => (
                  <div key={priority.id} className="p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1a1a3e] flex items-center justify-center text-xs font-bold text-[#e3f98a] flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{priority.title}</h4>
                          <Badge variant={getPriorityColor(priority.urgency)} size="sm">
                            {priority.urgency}
                          </Badge>
                        </div>
                        {priority.description && (
                          <p className="text-sm text-[#676986] truncate">{priority.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#676986]">
                          {priority.owner && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {priority.owner}
                            </span>
                          )}
                          {priority.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {format(new Date(priority.dueDate), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/tasks?task=${priority.linkedId}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Meeting Summaries with Actions */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#8533fc]" />
                <h3 className="font-semibold text-white">Meeting Intelligence</h3>
                {(pendingDecisions + pendingActionItems) > 0 && (
                  <Badge variant="warning" size="sm">{pendingDecisions + pendingActionItems} pending</Badge>
                )}
              </div>
              <Link href="/channels" className="text-sm text-[#65cdd8] hover:underline flex items-center gap-1">
                All meetings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {huddles.length === 0 ? (
                <div className="p-8 text-center text-[#676986]">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No meeting summaries yet</p>
                </div>
              ) : (
                huddles.map((huddle) => (
                  <div key={huddle.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{huddle.title}</h4>
                        <p className="text-xs text-[#676986] flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(huddle.startedAt), "MMM d, yyyy")}
                          <span className="text-[#676986]">•</span>
                          <Users className="w-3 h-3" />
                          {huddle.participants.length} participants
                        </p>
                      </div>
                      <Badge variant="success" size="sm">Finalized</Badge>
                    </div>

                    {huddle.summary && (
                      <p className="text-sm text-[#a8a8a8] mb-3 line-clamp-2">{huddle.summary}</p>
                    )}

                    {/* Decisions */}
                    {huddle.decisions && huddle.decisions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-[#676986] uppercase tracking-wider mb-2">Decisions</p>
                        <div className="space-y-2">
                          {huddle.decisions.slice(0, 2).map((decision) => (
                            <div key={decision.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                              <span className="text-sm text-white flex items-center gap-2">
                                {decision.approved ? (
                                  <Check className="w-4 h-4 text-[#6BCB77]" />
                                ) : (
                                  <div className="w-4 h-4 rounded border border-[#676986]" />
                                )}
                                <span className="truncate max-w-[280px]">{decision.text}</span>
                              </span>
                              {decision.approved ? (
                                <Badge variant="success" size="sm">Approved</Badge>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    devStore.approveHuddleDecision(huddle.id, decision.id);
                                    celebrate(`Decision approved!`);
                                    setHuddles(devStore.getFinalizedHuddles().slice(0, 3));
                                  }}
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {huddle.actionItems && huddle.actionItems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#676986] uppercase tracking-wider mb-2">Action Items</p>
                        <div className="space-y-2">
                          {huddle.actionItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                              <span className="text-sm text-white flex items-center gap-2">
                                {item.taskId ? (
                                  <Check className="w-4 h-4 text-[#6BCB77]" />
                                ) : (
                                  <div className="w-4 h-4 rounded border border-[#676986]" />
                                )}
                                <span className="truncate max-w-[280px]">{item.text}</span>
                              </span>
                              {item.taskId ? (
                                <Badge variant="success" size="sm">Task Created</Badge>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => approveActionItem(huddle.id, item.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Create Task
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Stats & Navigation */}
        <div className="space-y-6">
          {/* Growth Generator Status */}
          <Card className="border-2 border-[#e3f98a]/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#e3f98a]" />
              <h3 className="font-semibold text-white">Growth Generator</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#e3f98a]/10 border border-[#e3f98a]/20">
                <p className="text-xs text-[#e3f98a] font-semibold uppercase tracking-wider mb-1">Current Step</p>
                <p className="text-sm text-white">Improve contribution margin</p>
              </div>
              <div className="text-xs text-[#676986] space-y-1">
                <p className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#6BCB77]" /> DTC currently profitable
                </p>
                <p className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-[#ffce33]" /> Optimizing conversion rates
                </p>
              </div>
            </div>
            <Link href="/growth" className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full">
                Open Growth Simulator
              </Button>
            </Link>
          </Card>

          {/* Cash Position */}
          {latestSnapshot && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Cash Position</h3>
                <Link href="/financials" className="text-xs text-[#65cdd8] hover:underline">
                  Details
                </Link>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#676986]">Cash on Hand</span>
                    <span className="font-semibold text-[#6BCB77]">
                      ${(latestSnapshot.cashOnHand / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <ProgressBar
                    value={latestSnapshot.cashOnHand}
                    max={1000000}
                    variant="success"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#676986]">AP Due (2wk)</span>
                  <span className="text-[#ff6b6b]">-${(latestSnapshot.apDueNext2Weeks / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#676986]">AR Expected (2wk)</span>
                  <span className="text-[#6BCB77]">+${(latestSnapshot.arExpectedNext2Weeks / 1000).toFixed(0)}K</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a8a8a8]">Runway</span>
                    <span className="font-semibold text-white">
                      {Math.floor(latestSnapshot.cashOnHand / latestSnapshot.fixedWeeklyStack)} weeks
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Questions to Answer */}
          <Card padding="none">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#65cdd8]" />
              <h3 className="font-semibold text-white">Questions to Answer</h3>
            </div>
            <div className="divide-y divide-white/5">
              {questions.length === 0 ? (
                <div className="p-6 text-center text-[#676986]">
                  <p className="text-sm">No open questions</p>
                </div>
              ) : (
                questions.slice(0, 2).map((q, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <h4 className="font-medium text-white text-sm mb-1">{q.question}</h4>
                    <Badge variant="default" size="sm">{q.department}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/channels">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4" />
                  Channels
                </Button>
              </Link>
              <Link href="/tasks?new=true">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4" />
                  New Task
                </Button>
              </Link>
              <Link href="/plan">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Target className="w-4 h-4" />
                  Master Plan
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4" />
                  Insights
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
