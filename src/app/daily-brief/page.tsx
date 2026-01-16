"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Send,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, Button, Badge, Avatar, Textarea, Select } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { TEAM_PROFILES } from "@/lib/data/team-portals";

interface DailyUpdate {
  id: string;
  content: string;
  type: "update" | "request" | "announcement";
  author: {
    id: string;
    name: string;
    email: string;
  };
  targetPerson?: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: string;
}

// Big blue unicorn SVG component for Travis
function BlueUnicorn({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Unicorn body */}
      <ellipse cx="55" cy="60" rx="30" ry="22" fill="#3B82F6" />
      {/* Unicorn head */}
      <circle cx="85" cy="42" r="18" fill="#60A5FA" />
      {/* Unicorn horn */}
      <polygon points="92,25 88,8 96,25" fill="#FBBF24" />
      <polygon points="92,25 88,8 96,25" fill="url(#hornGradient)" />
      {/* Sparkles around horn */}
      <circle cx="82" cy="12" r="2" fill="#F9FAFB" className="animate-pulse" />
      <circle cx="100" cy="15" r="1.5" fill="#F9FAFB" className="animate-pulse" />
      <circle cx="95" cy="5" r="1" fill="#F9FAFB" className="animate-pulse" />
      {/* Eye */}
      <circle cx="90" cy="40" r="4" fill="#1E3A8A" />
      <circle cx="91" cy="39" r="1.5" fill="white" />
      {/* Mane */}
      <path
        d="M75 30 Q65 25 70 40 Q60 35 68 50 Q58 48 65 58"
        stroke="#8B5CF6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Legs */}
      <rect x="35" y="75" width="6" height="20" rx="3" fill="#2563EB" />
      <rect x="50" y="75" width="6" height="20" rx="3" fill="#2563EB" />
      <rect x="65" y="75" width="6" height="20" rx="3" fill="#2563EB" />
      <rect x="75" y="73" width="6" height="18" rx="3" fill="#2563EB" />
      {/* Tail */}
      <path
        d="M25 55 Q10 50 15 65 Q5 60 12 75 Q2 72 10 85"
        stroke="#8B5CF6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="hornGradient" x1="88" y1="8" x2="92" y2="25">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DailyBriefPage() {
  const { data: session } = useSession();
  const { toast, celebrate } = useToast();
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "requests" | "updates" | "mine">("all");

  // Form state
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"update" | "request" | "announcement">("update");
  const [targetPerson, setTargetPerson] = useState("");

  // Check if user is Travis
  const isTravis =
    session?.user?.email?.toLowerCase().includes("travis") ||
    session?.user?.name?.toLowerCase().includes("travis");

  const fetchUpdates = async () => {
    try {
      const res = await fetch(`/api/daily-brief?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setUpdates(data.updates);
      }
    } catch (error) {
      console.error("Failed to fetch updates:", error);
      toast({ message: "Failed to load daily brief", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/daily-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          type: newType,
          targetPerson: targetPerson || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdates((prev) => [data.update, ...prev]);
        setNewContent("");
        setTargetPerson("");
        celebrate({ message: "Posted to daily brief!" });
      }
    } catch (error) {
      console.error("Failed to post update:", error);
      toast({ message: "Failed to post update", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch("/api/daily-brief", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resolved: true }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdates((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, resolved: true, resolvedBy: data.update.resolvedBy, resolvedAt: data.update.resolvedAt }
              : u
          )
        );
        toast({ message: "Marked as resolved!", variant: "success" });
      }
    } catch (error) {
      console.error("Failed to resolve:", error);
      toast({ message: "Failed to resolve", variant: "error" });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeBadge = (type: DailyUpdate["type"]) => {
    switch (type) {
      case "request":
        return <Badge variant="warning">Request</Badge>;
      case "announcement":
        return <Badge variant="info">Announcement</Badge>;
      default:
        return <Badge variant="default">Update</Badge>;
    }
  };

  // Get team members for the target dropdown
  const teamMembers = Object.values(TEAM_PROFILES).map((p) => ({
    value: p.id,
    label: `${p.emoji} ${p.name}`,
  }));

  return (
    <div className="min-h-screen bg-[#0D0D2A] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - with Blue Unicorn for Travis */}
        <div className="relative">
          {isTravis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="absolute -top-4 right-0 md:right-10"
            >
              <BlueUnicorn className="w-32 h-28 md:w-40 md:h-36 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              >
                <Sparkles className="w-5 h-5 text-[#FBBF24]" />
              </motion.div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e3f98a]/20 to-[#65cdd8]/20">
              <Newspaper className="w-6 h-6 text-[#e3f98a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Daily Brief
                {isTravis && (
                  <span className="ml-2 text-lg text-blue-400">
                    Hey Travis!
                  </span>
                )}
              </h1>
              <p className="text-[#676986] text-sm">
                What&apos;s happening today and who needs what
              </p>
            </div>
          </div>
        </div>

        {/* Post New Update Form */}
        <Card className="p-4 md:p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={session?.user?.name || "You"} size="sm" />
              <span className="text-white font-medium">{session?.user?.name || "You"}</span>
            </div>

            <Textarea
              placeholder="Share an update, make a request, or post an announcement..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-[#676986] mb-1 block">Type</label>
                <Select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as typeof newType)}
                  options={[
                    { value: "update", label: "Update" },
                    { value: "request", label: "Request (need something)" },
                    { value: "announcement", label: "Announcement" },
                  ]}
                />
              </div>

              {newType === "request" && (
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-[#676986] mb-1 block">From who?</label>
                  <Select
                    value={targetPerson}
                    onChange={(e) => setTargetPerson(e.target.value)}
                    options={[
                      { value: "", label: "Anyone" },
                      ...teamMembers,
                    ]}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={!newContent.trim() || submitting}
                className="btn-satisfying"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="ml-2">Post</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "requests", "updates", "mine"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-[#e3f98a]/20 text-[#e3f98a] border border-[#e3f98a]/30"
                  : "bg-white/5 text-[#a8a8a8] hover:bg-white/10 border border-transparent"
              }`}
            >
              {f === "all" && "All"}
              {f === "requests" && "Open Requests"}
              {f === "updates" && "Updates"}
              {f === "mine" && "For Me"}
            </button>
          ))}
          <button
            onClick={fetchUpdates}
            className="ml-auto px-3 py-2 rounded-lg text-[#676986] hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Updates List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="text-center py-12 text-[#676986]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading brief...
              </div>
            ) : updates.length === 0 ? (
              <Card className="p-8 text-center border border-white/10">
                <Newspaper className="w-12 h-12 text-[#676986] mx-auto mb-3" />
                <p className="text-[#a8a8a8]">No updates yet today</p>
                <p className="text-[#676986] text-sm mt-1">
                  Be the first to share what&apos;s happening!
                </p>
              </Card>
            ) : (
              updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 border transition-all ${
                      update.resolved
                        ? "border-green-500/20 bg-green-500/5"
                        : update.type === "request"
                        ? "border-yellow-500/20 hover:border-yellow-500/40"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={update.author.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">
                            {update.author.name}
                          </span>
                          {getTypeBadge(update.type)}
                          {update.targetPerson && (
                            <span className="text-xs text-[#65cdd8]">
                              <User className="w-3 h-3 inline mr-1" />
                              for {update.targetPerson}
                            </span>
                          )}
                          {update.resolved && (
                            <Badge variant="success">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-[#a8a8a8] mt-2 whitespace-pre-wrap">
                          {update.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#676986]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(update.createdAt)}
                          </span>
                          {update.resolvedBy && (
                            <span>
                              Resolved by {update.resolvedBy.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {update.type === "request" && !update.resolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolve(update.id)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
