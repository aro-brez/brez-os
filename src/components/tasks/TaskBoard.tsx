"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types/tasks";

interface TaskBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onPendingCountChange?: (count: number) => void;
}

// Demo tasks for when not connected to database
const DEMO_TASKS: Task[] = [
  {
    id: "demo-1",
    content: "Review Q1 marketing spend allocation",
    status: "pending",
    priority: "high",
    createdBy: {
      id: "1",
      name: "Aaron",
      email: "aaron@drinkbrez.com",
    },
    createdAt: new Date().toISOString(),
    readBy: [],
  },
  {
    id: "demo-2",
    content: "Upload latest retail velocity data from distributors",
    status: "in_progress",
    priority: "medium",
    createdBy: {
      id: "2",
      name: "Dan",
      email: "dan@drinkbrez.com",
    },
    assignedTo: {
      id: "1",
      name: "Aaron",
      email: "aaron@drinkbrez.com",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readBy: ["1"],
  },
  {
    id: "demo-3",
    content: "Analyze CAC trend from last 4 weeks",
    status: "completed",
    priority: "low",
    createdBy: {
      id: "1",
      name: "Aaron",
      email: "aaron@drinkbrez.com",
    },
    completedBy: {
      id: "1",
      name: "Aaron",
      email: "aaron@drinkbrez.com",
    },
    completedAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    readBy: ["1", "2"],
  },
];

export function TaskBoard({ isOpen, onClose, onPendingCountChange }: TaskBoardProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isLoading, setIsLoading] = useState(false);

  // In demo mode, use local state
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Notify parent about pending count changes
  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);

  useEffect(() => {
    if (!isDemo && isOpen) {
      fetchTasks();
    }
  }, [isOpen, isDemo]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim()) return;

    if (isDemo) {
      // Demo mode - add locally
      const newTask: Task = {
        id: `demo-${Date.now()}`,
        content: newTaskContent,
        status: "pending",
        priority: newTaskPriority,
        createdBy: {
          id: session?.user?.id || "guest",
          name: session?.user?.name || "You",
          email: session?.user?.email || "guest@brez.com",
        },
        createdAt: new Date().toISOString(),
        readBy: [session?.user?.id || "guest"],
      };
      setTasks([newTask, ...tasks]);
      setNewTaskContent("");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newTaskContent,
          priority: newTaskPriority,
        }),
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks([task, ...tasks]);
        setNewTaskContent("");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "pending" : "completed";

    // Show celebration for completing a task
    if (newStatus === "completed") {
      setShowCelebration(taskId);
      setTimeout(() => setShowCelebration(null), 1500);
    }

    if (isDemo) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
                completedBy:
                  newStatus === "completed"
                    ? {
                        id: session?.user?.id || "guest",
                        name: session?.user?.name || "You",
                        email: session?.user?.email || "guest@brez.com",
                      }
                    : undefined,
              }
            : t
        )
      );
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const { task: updatedTask } = await res.json();
        setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isDemo) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "pending") return task.status !== "completed";
    return task.status === "completed";
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#ff6b6b]/20 text-[#ff6b6b]";
      case "medium":
        return "bg-[#ffce33]/20 text-[#ffce33]";
      default:
        return "bg-[#65cdd8]/20 text-[#65cdd8]";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-[#1a1a3e] to-[#0D0D2A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8533fc]/20 flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Team Tasks</h2>
                    <p className="text-xs text-[#676986]">
                      {isDemo ? "Demo Mode" : `${tasks.length} tasks`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#676986] hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Add Task Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    placeholder="Add a task for the team..."
                    className="flex-1 bg-[#242445] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 transition-colors"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskContent.trim()}
                    className="px-4 py-3 bg-[#e3f98a] text-[#0D0D2A] font-semibold rounded-xl hover:bg-[#c5e066] transition-all btn-satisfying disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#676986]">Priority:</span>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        newTaskPriority === p
                          ? getPriorityColor(p)
                          : "bg-white/5 text-[#676986] hover:bg-white/10"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 border-b border-white/10">
              <div className="flex gap-2">
                {(["all", "pending", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      filter === f
                        ? "bg-[#e3f98a]/20 text-[#e3f98a]"
                        : "text-[#676986] hover:bg-white/5"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "pending" && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-[#ff6b6b]/20 text-[#ff6b6b] rounded text-[10px]">
                        {tasks.filter((t) => t.status !== "completed").length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#e3f98a]/20 border-t-[#e3f98a] rounded-full animate-spin" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#242445] flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✨</span>
                  </div>
                  <p className="text-[#676986] text-sm">
                    {filter === "completed" ? "No completed tasks" : "No tasks yet"}
                  </p>
                  <p className="text-[#676986]/60 text-xs mt-1">
                    Add a task to get started
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`task-card p-4 rounded-xl border transition-all group relative overflow-hidden ${
                        task.status === "completed"
                          ? "bg-[#242445]/50 border-white/5"
                          : "bg-[#242445] border-white/10 hover:border-[#e3f98a]/20"
                      }`}
                    >
                      {/* Celebration Effect */}
                      <AnimatePresence>
                        {showCelebration === task.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none"
                          >
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{
                                  x: "50%",
                                  y: "50%",
                                  scale: 0,
                                  opacity: 1
                                }}
                                animate={{
                                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                                  scale: [0, 1, 0],
                                  opacity: [1, 1, 0]
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: ["#e3f98a", "#6BCB77", "#65cdd8", "#8533fc"][i % 4],
                                }}
                              />
                            ))}
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                              transition={{ duration: 0.6 }}
                              className="absolute inset-0 flex items-center justify-center text-4xl"
                            >
                              ✨
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${
                            task.status === "completed"
                              ? "bg-[#6BCB77] border-[#6BCB77]"
                              : "border-[#676986] hover:border-[#e3f98a]"
                          }`}
                        >
                          {task.status === "completed" && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              task.status === "completed"
                                ? "text-[#676986] line-through"
                                : "text-white"
                            }`}
                          >
                            {task.content}
                          </p>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[10px] text-[#676986]">
                              {task.createdBy.name} &middot; {formatDate(task.createdAt)}
                            </span>
                            {task.completedBy && (
                              <span className="text-[10px] text-[#6BCB77]">
                                ✓ {task.completedBy.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#ff6b6b]/20 transition-all text-[#676986] hover:text-[#ff6b6b]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {isDemo && (
              <div className="p-4 border-t border-white/10 bg-[#8533fc]/10">
                <div className="flex items-center gap-2 text-xs text-[#8533fc]">
                  <span>✨</span>
                  <span>
                    Demo mode - Sign in with Google to sync tasks with your team
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Task notification badge for header
 */
export function TaskBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors group"
        title="Team Tasks (⌘T)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#676986] group-hover:text-white transition-colors">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        {count > 0 && (
          <>
            {/* Pulse ring animation */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6b6b] rounded-full animate-ping opacity-75" />
            {/* Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#ff6b6b]/30">
              {count > 9 ? "9+" : count}
            </span>
          </>
        )}
      </button>
      {/* Keyboard hint on hover */}
      <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="px-2 py-1 bg-[#242445] rounded text-[10px] text-[#676986] whitespace-nowrap border border-white/10">
          ⌘T
        </div>
      </div>
    </div>
  );
}
