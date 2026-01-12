"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Target,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, Button, Badge, Modal, Input, Textarea, Select, ProgressBar, Avatar } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { Goal, Department, GoalStatus } from "@/lib/data/schemas";

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "growth", label: "Growth" },
  { value: "retail", label: "Retail" },
  { value: "finance", label: "Finance" },
  { value: "ops", label: "Operations" },
  { value: "product", label: "Product" },
  { value: "cx", label: "Customer Experience" },
  { value: "creative", label: "Creative" },
  { value: "exec", label: "Executive" },
];

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "behind", label: "Behind" },
  { value: "completed", label: "Completed" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filterDept, setFilterDept] = useState<Department | "all">("all");
  const [filterStatus, setFilterStatus] = useState<GoalStatus | "all">("all");
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    setGoals(devStore.getGoals());
  };

  const filteredGoals = goals.filter((g) => {
    if (filterDept !== "all" && g.department !== filterDept) return false;
    if (filterStatus !== "all" && g.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case "on_track": return <Badge variant="success">On Track</Badge>;
      case "at_risk": return <Badge variant="warning">At Risk</Badge>;
      case "behind": return <Badge variant="danger">Behind</Badge>;
      case "completed": return <Badge variant="info">Completed</Badge>;
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case "on_track": return <TrendingUp className="w-4 h-4 text-[#6BCB77]" />;
      case "at_risk": return <AlertTriangle className="w-4 h-4 text-[#ffce33]" />;
      case "behind": return <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-[#65cdd8]" />;
    }
  };

  const stats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "on_track").length,
    atRisk: goals.filter((g) => g.status === "at_risk").length,
    behind: goals.filter((g) => g.status === "behind").length,
    completed: goals.filter((g) => g.status === "completed").length,
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-[#e3f98a]" />
            Goals
          </h1>
          <p className="text-[#676986] mt-1">Track objectives across all departments</p>
        </div>
        <Button onClick={() => setShowNewGoalModal(true)}>
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#6BCB77] uppercase tracking-wider mb-1">On Track</p>
          <p className="text-2xl font-bold text-[#6BCB77]">{stats.onTrack}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#ffce33] uppercase tracking-wider mb-1">At Risk</p>
          <p className="text-2xl font-bold text-[#ffce33]">{stats.atRisk}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#ff6b6b] uppercase tracking-wider mb-1">Behind</p>
          <p className="text-2xl font-bold text-[#ff6b6b]">{stats.behind}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#65cdd8] uppercase tracking-wider mb-1">Completed</p>
          <p className="text-2xl font-bold text-[#65cdd8]">{stats.completed}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={[{ value: "all", label: "All Departments" }, ...DEPARTMENTS]}
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value as Department | "all")}
          className="w-48"
        />
        <Select
          options={[{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as GoalStatus | "all")}
          className="w-40"
        />
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map((goal) => {
          const owner = devStore.getUser(goal.ownerId);

          return (
            <Card
              key={goal.id}
              hover
              onClick={() => setEditingGoal(goal)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{goal.title}</h3>
                  <p className="text-sm text-[#676986] truncate">{goal.description}</p>
                </div>
                {getStatusIcon(goal.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#676986]">Progress</span>
                    <span className="text-[#a8a8a8]">{goal.metricCurrent || "Not set"} / {goal.metricTarget}</span>
                  </div>
                  <ProgressBar
                    value={goal.status === "completed" ? 100 : goal.status === "on_track" ? 65 : goal.status === "at_risk" ? 40 : 20}
                    variant={goal.status === "on_track" || goal.status === "completed" ? "success" : goal.status === "at_risk" ? "warning" : "danger"}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {owner && <Avatar name={owner.name} size="sm" />}
                    <span className="text-xs text-[#676986]">{owner?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#676986]">
                    <Clock className="w-3 h-3" />
                    {format(new Date(goal.dueDate), "MMM d")}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(goal.status)}
                  <Badge variant="default">{goal.department}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* New/Edit Goal Modal */}
      <GoalModal
        isOpen={showNewGoalModal || !!editingGoal}
        onClose={() => {
          setShowNewGoalModal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={() => {
          loadGoals();
          setShowNewGoalModal(false);
          setEditingGoal(null);
        }}
      />
    </div>
  );
}

function GoalModal({
  isOpen,
  onClose,
  goal,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<Department>("growth");
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [impactScore, setImpactScore] = useState(5);
  const [metricTarget, setMetricTarget] = useState("");
  const [metricCurrent, setMetricCurrent] = useState("");
  const [status, setStatus] = useState<GoalStatus>("on_track");

  const users = devStore.getUsers();

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setDepartment(goal.department);
      setOwnerId(goal.ownerId);
      setDueDate(goal.dueDate.split("T")[0]);
      setImpactScore(goal.impactScore);
      setMetricTarget(goal.metricTarget);
      setMetricCurrent(goal.metricCurrent || "");
      setStatus(goal.status);
    } else {
      setTitle("");
      setDescription("");
      setDepartment("growth");
      setOwnerId(users[0]?.id || "");
      setDueDate(format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd"));
      setImpactScore(5);
      setMetricTarget("");
      setMetricCurrent("");
      setStatus("on_track");
    }
  }, [goal, users]);

  const handleSave = () => {
    if (!title || !metricTarget) return;

    if (goal) {
      devStore.updateGoal(goal.id, {
        title,
        description,
        department,
        ownerId,
        dueDate: new Date(dueDate).toISOString(),
        impactScore,
        metricTarget,
        metricCurrent: metricCurrent || undefined,
        status,
      });
    } else {
      devStore.addGoal({
        title,
        description,
        department,
        ownerId,
        dueDate: new Date(dueDate).toISOString(),
        impactScore,
        metricTarget,
        metricCurrent: metricCurrent || undefined,
        status,
        linkedTaskIds: [],
      });
    }
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? "Edit Goal" : "New Goal"} size="md">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Reduce CAC to $35"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the goal..."
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Department"
            options={DEPARTMENTS}
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
          />
          <Select
            label="Owner"
            options={users.map((u) => ({ value: u.id, label: u.name }))}
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Impact Score (1-10)"
            type="number"
            min={1}
            max={10}
            value={impactScore}
            onChange={(e) => setImpactScore(Number(e.target.value))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Metric"
            value={metricTarget}
            onChange={(e) => setMetricTarget(e.target.value)}
            placeholder="e.g., $35 CAC"
          />
          <Input
            label="Current Metric"
            value={metricCurrent}
            onChange={(e) => setMetricCurrent(e.target.value)}
            placeholder="e.g., $42 CAC"
          />
        </div>
        {goal && (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
          />
        )}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title || !metricTarget}>
            {goal ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
