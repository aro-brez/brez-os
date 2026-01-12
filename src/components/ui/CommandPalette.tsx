"use client";

import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Target,
  CheckSquare,
  TrendingUp,
  DollarSign,
  FolderOpen,
  Users,
  Settings,
  BookOpen,
  Plus,
  ArrowRight,
  Command,
  Sparkles,
} from "lucide-react";
import { devStore } from "@/lib/data/devStore";

interface CommandPaletteContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command items
  const tasks = devStore.getTasks().slice(0, 5);
  const goals = devStore.getGoals().slice(0, 5);

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-home", label: "Go to Command Center", icon: <LayoutDashboard className="w-4 h-4" />, action: () => router.push("/"), category: "Navigation", keywords: ["home", "dashboard"] },
    { id: "nav-channels", label: "Go to Channels", icon: <MessageSquare className="w-4 h-4" />, action: () => router.push("/channels"), category: "Navigation", keywords: ["chat", "messages"] },
    { id: "nav-goals", label: "Go to Goals", icon: <Target className="w-4 h-4" />, action: () => router.push("/goals"), category: "Navigation", keywords: ["objectives"] },
    { id: "nav-tasks", label: "Go to Tasks", icon: <CheckSquare className="w-4 h-4" />, action: () => router.push("/tasks"), category: "Navigation", keywords: ["todo", "work"] },
    { id: "nav-growth", label: "Go to Growth Generator", icon: <TrendingUp className="w-4 h-4" />, action: () => router.push("/growth"), category: "Navigation", keywords: ["simulation", "forecast"] },
    { id: "nav-financials", label: "Go to Financials", icon: <DollarSign className="w-4 h-4" />, action: () => router.push("/financials"), category: "Navigation", keywords: ["cash", "money"] },
    { id: "nav-files", label: "Go to Files", icon: <FolderOpen className="w-4 h-4" />, action: () => router.push("/files"), category: "Navigation", keywords: ["documents", "uploads"] },
    { id: "nav-customers", label: "Go to Ask Customers", icon: <Users className="w-4 h-4" />, action: () => router.push("/customers"), category: "Navigation", keywords: ["feedback", "reviews"] },
    { id: "nav-settings", label: "Go to Settings", icon: <Settings className="w-4 h-4" />, action: () => router.push("/settings"), category: "Navigation", keywords: ["config", "preferences"] },
    { id: "nav-guide", label: "Go to Operator Guide", icon: <BookOpen className="w-4 h-4" />, action: () => router.push("/operator"), category: "Navigation", keywords: ["help", "docs"] },

    // Quick Actions
    { id: "action-new-task", label: "Create New Task", description: "Add a task to your list", icon: <Plus className="w-4 h-4" />, action: () => router.push("/tasks?new=true"), category: "Actions" },
    { id: "action-new-goal", label: "Create New Goal", description: "Set a new objective", icon: <Plus className="w-4 h-4" />, action: () => router.push("/goals?new=true"), category: "Actions" },
    { id: "action-reset", label: "Reset Demo Data", description: "Restore default data", icon: <Sparkles className="w-4 h-4" />, action: () => router.push("/settings?tab=data"), category: "Actions" },

    // Recent Tasks
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      label: task.title,
      description: task.department,
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => router.push(`/tasks?task=${task.id}`),
      category: "Recent Tasks",
    })),

    // Goals
    ...goals.map((goal) => ({
      id: `goal-${goal.id}`,
      label: goal.title,
      description: goal.department,
      icon: <Target className="w-4 h-4" />,
      action: () => router.push(`/goals?goal=${goal.id}`),
      category: "Goals",
    })),
  ];

  // Filter commands
  const filteredCommands = query
    ? commands.filter((cmd) => {
        const searchStr = `${cmd.label} ${cmd.description || ""} ${cmd.keywords?.join(" ") || ""}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
      })
    : commands;

  // Group by category
  const groupedCommands: Record<string, CommandItem[]> = {};
  filteredCommands.forEach((cmd) => {
    if (!groupedCommands[cmd.category]) {
      groupedCommands[cmd.category] = [];
    }
    groupedCommands[cmd.category].push(cmd);
  });

  // Flatten for selection
  const flatCommands = Object.values(groupedCommands).flat();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatCommands[selectedIndex]) {
      e.preventDefault();
      flatCommands[selectedIndex].action();
      close();
    }
  };

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={close}
          />

          {/* Palette */}
          <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a3e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
              <Search className="w-5 h-5 text-[#676986]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, pages, tasks..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white placeholder-[#676986] focus:outline-none text-lg"
              />
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[#676986]">
                <Command className="w-3 h-3" />
                <span className="text-xs">K</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-[#676986] uppercase tracking-wider bg-[#0D0D2A]/50">
                    {category}
                  </div>
                  {items.map((cmd) => {
                    const index = flatCommands.indexOf(cmd);
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          close();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={clsx(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          isSelected ? "bg-[#e3f98a]/10" : "hover:bg-white/5"
                        )}
                      >
                        <div className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-[#e3f98a]/20 text-[#e3f98a]" : "bg-white/5 text-[#a8a8a8]"
                        )}>
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={clsx("font-medium truncate", isSelected ? "text-white" : "text-[#a8a8a8]")}>
                            {cmd.label}
                          </p>
                          {cmd.description && (
                            <p className="text-xs text-[#676986] truncate">{cmd.description}</p>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 text-[#e3f98a]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {flatCommands.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-[#676986]">No results found</p>
                  <p className="text-xs text-[#676986] mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-[#676986]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">↵</kbd> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">esc</kbd> close
                </span>
              </div>
              <span className="text-[#e3f98a]">BRĒZ AI</span>
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}
