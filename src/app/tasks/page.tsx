"use client";

import { useState, useEffect } from "react";
import { format, isToday, isThisWeek, isBefore, startOfDay } from "date-fns";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Filter,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Target,
  Sparkles,
} from "lucide-react";
import { Card, Button, Badge, Modal, Input, Textarea, Select, Avatar, Tabs } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { Task, Department, TaskStatus, TaskPriority } from "@/lib/data/schemas";
import { useToast } from "@/components/ui/Toast";
import { Confetti } from "@/components/ui/Celebration";

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

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "doing", label: "In Progress" },
  { value: "done", label: "Done" },
];

type ViewTab = "today" | "week" | "later" | "all";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<ViewTab>("today");
  const [filterDept, setFilterDept] = useState<Department | "all">("all");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast, celebrate } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(devStore.getTasks());
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by department
    if (filterDept !== "all") {
      filtered = filtered.filter((t) => t.department === filterDept);
    }

    // Filter by view
    const today = startOfDay(new Date());
    switch (activeView) {
      case "today":
        filtered = filtered.filter((t) => {
          if (t.status === "done") return false;
          if (!t.dueDate) return false;
          return isToday(new Date(t.dueDate)) || isBefore(new Date(t.dueDate), today);
        });
        break;
      case "week":
        filtered = filtered.filter((t) => {
          if (t.status === "done") return false;
          if (!t.dueDate) return false;
          return isThisWeek(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
        });
        break;
      case "later":
        filtered = filtered.filter((t) => {
          if (t.status === "done") return false;
          if (!t.dueDate) return true; // No due date = later
          return !isThisWeek(new Date(t.dueDate));
        });
        break;
      case "all":
        // Show all non-done tasks
        filtered = filtered.filter((t) => t.status !== "done");
        break;
    }

    // Sort by priority, then due date
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const filteredTasks = getFilteredTasks();

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    devStore.updateTask(taskId, { status });
    loadTasks();

    // Celebrate when completing a task
    if (status === "done" && task) {
      setShowConfetti(true);
      celebrate(`"${task.title}" completed!`);
      setTimeout(() => setShowConfetti(false), 2500);
    } else if (status === "doing" && task) {
      toast(`Started working on "${task.title}"`, "info");
    }
  };

  const deleteTask = (taskId: string) => {
    devStore.deleteTask(taskId);
    loadTasks();
    toast("Task deleted", "info");
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent": return <Badge variant="danger">Urgent</Badge>;
      case "high": return <Badge variant="warning">High</Badge>;
      case "medium": return <Badge variant="info">Medium</Badge>;
      case "low": return <Badge variant="default">Low</Badge>;
    }
  };

  const viewTabs = [
    { id: "today", label: "Today", icon: <Clock className="w-4 h-4" /> },
    { id: "week", label: "This Week", icon: <Calendar className="w-4 h-4" /> },
    { id: "later", label: "Later", icon: <Calendar className="w-4 h-4" /> },
    { id: "all", label: "All", icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Celebration Effect */}
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-[#e3f98a]" />
            Tasks
          </h1>
          <p className="text-[#676986] mt-1">Manage your team&apos;s work</p>
        </div>
        <Button onClick={() => setShowNewTaskModal(true)}>
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs
        tabs={viewTabs}
        activeTab={activeView}
        onChange={(id) => setActiveView(id as ViewTab)}
        className="mb-6"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={[{ value: "all", label: "All Departments" }, ...DEPARTMENTS]}
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value as Department | "all")}
          className="w-48"
        />
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <p className="text-xs text-[#676986] uppercase">To Do</p>
          <p className="text-xl font-bold text-white">{tasks.filter((t) => t.status === "todo").length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-[#65cdd8] uppercase">In Progress</p>
          <p className="text-xl font-bold text-[#65cdd8]">{tasks.filter((t) => t.status === "doing").length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-[#6BCB77] uppercase">Done Today</p>
          <p className="text-xl font-bold text-[#6BCB77]">
            {tasks.filter((t) => t.status === "done" && isToday(new Date(t.updatedAt))).length}
          </p>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="py-12">
            <div className="text-center">
              <CheckSquare className="w-12 h-12 text-[#676986] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No tasks here</h3>
              <p className="text-sm text-[#676986]">
                {activeView === "today"
                  ? "Nothing due today. Great job!"
                  : "No tasks match your filters"}
              </p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const owner = task.ownerId ? devStore.getUser(task.ownerId) : null;
            const goal = task.goalId ? devStore.getGoal(task.goalId) : null;
            const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), startOfDay(new Date()));

            return (
              <Card key={task.id} className="group hover:border-[#e3f98a]/30 transition-all">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      task.status === "done"
                        ? "bg-[#6BCB77] border-[#6BCB77]"
                        : "border-[#676986] hover:border-[#e3f98a]"
                    }`}
                  >
                    {task.status === "done" && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${task.status === "done" ? "text-[#676986] line-through" : "text-white"}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-[#676986] mt-1 truncate">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 text-[#676986] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {getPriorityBadge(task.priority)}
                      <Badge variant="default">{task.department}</Badge>

                      {task.status === "doing" && (
                        <Badge variant="info">In Progress</Badge>
                      )}

                      {task.dueDate && (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-[#ff6b6b]" : "text-[#676986]"}`}>
                          <Clock className="w-3 h-3" />
                          {isOverdue ? "Overdue: " : ""}
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}

                      {owner && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={owner.name} size="sm" />
                          <span className="text-xs text-[#676986]">{owner.name.split(" ")[0]}</span>
                        </div>
                      )}

                      {goal && (
                        <span className="flex items-center gap-1 text-xs text-[#65cdd8]">
                          <Target className="w-3 h-3" />
                          {goal.title}
                        </span>
                      )}

                      {task.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#676986]">
                          <MessageSquare className="w-3 h-3" />
                          {task.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* New/Edit Task Modal */}
      <TaskModal
        isOpen={showNewTaskModal || !!editingTask}
        onClose={() => {
          setShowNewTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={() => {
          loadTasks();
          setShowNewTaskModal(false);
          setEditingTask(null);
        }}
        onDelete={(taskId) => {
          deleteTask(taskId);
          setEditingTask(null);
        }}
      />
    </div>
  );
}

function TaskModal({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: () => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<Department>("growth");
  const [ownerId, setOwnerId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [goalId, setGoalId] = useState<string>("");
  const [newComment, setNewComment] = useState("");

  const users = devStore.getUsers();
  const goals = devStore.getGoals();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDepartment(task.department);
      setOwnerId(task.ownerId || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setPriority(task.priority);
      setStatus(task.status);
      setGoalId(task.goalId || "");
    } else {
      setTitle("");
      setDescription("");
      setDepartment("growth");
      setOwnerId("");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setPriority("medium");
      setStatus("todo");
      setGoalId("");
    }
    setNewComment("");
  }, [task]);

  const handleSave = () => {
    if (!title) return;

    if (task) {
      devStore.updateTask(task.id, {
        title,
        description: description || undefined,
        department,
        ownerId: ownerId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        status,
        goalId: goalId || null,
      });
    } else {
      devStore.addTask({
        title,
        description: description || undefined,
        department,
        ownerId: ownerId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        status,
        goalId: goalId || null,
        projectId: null,
        attachments: [],
      });
    }
    onSave();
  };

  const addComment = () => {
    if (!task || !newComment.trim()) return;
    devStore.addTaskComment(task.id, devStore.getCurrentUser().id, newComment);
    setNewComment("");
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "New Task"} size="md">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
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
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Owner"
            options={[{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <Select
          label="Linked Goal (optional)"
          options={[{ value: "", label: "No goal" }, ...goals.map((g) => ({ value: g.id, label: g.title }))]}
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
        />
        {task && (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
        )}

        {/* Comments Section */}
        {task && task.comments.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-[#a8a8a8] mb-3">Comments</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {task.comments.map((comment) => {
                const author = devStore.getUser(comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar name={author?.name || "Unknown"} size="sm" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">{author?.name}</span>
                        <span className="text-xs text-[#676986]">
                          {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-[#a8a8a8]">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {task && (
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button variant="secondary" onClick={addComment} disabled={!newComment.trim()}>
              Add
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-white/10">
          {task ? (
            <Button variant="danger" onClick={() => onDelete(task.id)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title}>
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
