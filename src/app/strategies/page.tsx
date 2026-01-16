"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Palette,
  Building2,
  ShieldCheck,
  Target,
  Lock,
  Eye,
  ChevronRight,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Scale,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";

interface StrategyDocument {
  slug: string;
  title: string;
  description: string;
  icon: typeof FileText;
  owner: string;
  status: "draft" | "review" | "active" | "archived";
  updated: string;
  access: "all" | "team" | "managers" | "directors" | "elt" | "aaron";
  tags: string[];
  progress?: number;
}

const strategies: StrategyDocument[] = [
  {
    slug: "capital-strategy-2026",
    title: "Capital Strategy 2026",
    description: "Multi-path capital strategy including AP restructuring, debt facilities, and equity paths",
    icon: DollarSign,
    owner: "Aaron Nosbisch",
    status: "active",
    updated: "January 14, 2026",
    access: "elt",
    tags: ["capital", "finance", "growth"],
    progress: 100,
  },
  {
    slug: "dtc-growth-strategy",
    title: "D2C Growth Strategy",
    description: "Customer acquisition, retention, and lifetime value optimization playbook",
    icon: TrendingUp,
    owner: "Al Huynh",
    status: "draft",
    updated: "Coming soon",
    access: "directors",
    tags: ["growth", "marketing", "dtc"],
  },
  {
    slug: "retail-strategy",
    title: "Retail Strategy",
    description: "Channel expansion, velocity optimization, and retail partnership framework",
    icon: Building2,
    owner: "Niall Little",
    status: "draft",
    updated: "Coming soon",
    access: "directors",
    tags: ["retail", "distribution", "partnerships"],
  },
  {
    slug: "product-strategy",
    title: "Product Strategy",
    description: "Product roadmap, SKU rationalization, and innovation pipeline",
    icon: Package,
    owner: "Travis Duncan",
    status: "draft",
    updated: "Coming soon",
    access: "team",
    tags: ["product", "innovation", "roadmap"],
  },
  {
    slug: "creative-strategy",
    title: "Creative Strategy",
    description: "Brand expression, content calendar, and creative direction",
    icon: Palette,
    owner: "Andrew Deitsch",
    status: "draft",
    updated: "Coming soon",
    access: "team",
    tags: ["creative", "brand", "content"],
  },
  {
    slug: "team-strategy",
    title: "Team Strategy",
    description: "Organizational design, hiring priorities, and culture development",
    icon: Users,
    owner: "Malia Steel",
    status: "draft",
    updated: "Coming soon",
    access: "managers",
    tags: ["team", "hiring", "culture"],
  },
  {
    slug: "operations-strategy",
    title: "Operations Strategy",
    description: "Supply chain, production, and operational excellence",
    icon: Target,
    owner: "Dan",
    status: "draft",
    updated: "Coming soon",
    access: "team",
    tags: ["operations", "supply-chain", "efficiency"],
  },
  {
    slug: "regulatory-strategy",
    title: "Regulatory Strategy",
    description: "Compliance roadmap, Nov 2026 preparation, and legal framework",
    icon: ShieldCheck,
    owner: "Andrea Golan",
    status: "draft",
    updated: "Coming soon",
    access: "elt",
    tags: ["regulatory", "compliance", "legal"],
  },
  {
    slug: "trademark-portfolio-strategy",
    title: "Trademark Portfolio Strategy",
    description: "Complete trademark portfolio status, registration strategy, and counsel communication templates",
    icon: Scale,
    owner: "Andrea Golan",
    status: "active",
    updated: "January 16, 2026",
    access: "elt",
    tags: ["legal", "trademark", "brand", "ip"],
    progress: 100,
  },
  {
    slug: "trademark-decision-matrix",
    title: "Trademark Decision Matrix",
    description: "Executive summary: costs, timeline, and authorization for trademark strategy",
    icon: Scale,
    owner: "Andrea Golan",
    status: "active",
    updated: "January 16, 2026",
    access: "elt",
    tags: ["legal", "trademark", "decision"],
    progress: 100,
  },
];

const accessLevels: Record<string, { label: string; color: string }> = {
  all: { label: "All Team", color: "#6BCB77" },
  team: { label: "Team+", color: "#65cdd8" },
  managers: { label: "Managers+", color: "#8533fc" },
  directors: { label: "Directors+", color: "#ffce33" },
  elt: { label: "ELT Only", color: "#ff6b6b" },
  aaron: { label: "Aaron Only", color: "#ff6b6b" },
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-[#676986]/20", text: "text-[#676986]", label: "Draft" },
  review: { bg: "bg-[#ffce33]/20", text: "text-[#ffce33]", label: "In Review" },
  active: { bg: "bg-[#6BCB77]/20", text: "text-[#6BCB77]", label: "Active" },
  archived: { bg: "bg-[#ff6b6b]/20", text: "text-[#ff6b6b]", label: "Archived" },
};

export default function StrategiesPage() {
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const currentUser = devStore.getCurrentUser();

  // Check if user can access a strategy
  // In production, this would use proper role-based access from the auth system
  const canAccess = (access: string) => {
    // For now, admin users can access everything, members can access team+, viewers limited
    const accessHierarchy = ["all", "team", "managers", "directors", "elt", "aaron"];
    const userLevel = currentUser.role === "admin" ? "aaron" :
                      currentUser.role === "member" ? "directors" : "team";
    const userIndex = accessHierarchy.indexOf(userLevel);
    const requiredIndex = accessHierarchy.indexOf(access);
    return userIndex >= requiredIndex;
  };

  const filteredStrategies = strategies.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const activeCount = strategies.filter((s) => s.status === "active").length;
  const draftCount = strategies.filter((s) => s.status === "draft").length;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#8533fc]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#8533fc]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Strategy Documents
              </h1>
              <p className="text-[#676986]">
                2026 Operating Plan • Modular Strategy Architecture
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="text-sm px-3 py-1.5">
            <CheckCircle className="w-3 h-3 mr-1" />
            {activeCount} Active
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1.5">
            <Clock className="w-3 h-3 mr-1" />
            {draftCount} In Progress
          </Badge>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-gradient-to-r from-[#8533fc]/10 to-transparent border-[#8533fc]/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8533fc]/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-[#8533fc]" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Modular Strategy Architecture</h4>
            <p className="text-sm text-[#a8a8a8]">
              Each strategy document feeds into the Master Plan. Documents are updated by their owners and automatically
              sync to the central operating system. Access is role-based to protect sensitive information.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "all", label: "All Strategies" },
          { key: "active", label: "Active" },
          { key: "draft", label: "In Progress" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? "bg-[#e3f98a]/20 text-[#e3f98a] border border-[#e3f98a]/30"
                : "text-[#676986] hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStrategies.map((strategy) => {
          const hasAccess = canAccess(strategy.access);
          const StatusIcon = strategy.status === "active" ? CheckCircle : Clock;
          const accessLevel = accessLevels[strategy.access];
          const statusStyle = statusColors[strategy.status];

          return (
            <Card
              key={strategy.slug}
              className={`group transition-all duration-200 ${
                hasAccess && strategy.status === "active"
                  ? "hover:border-[#e3f98a]/30 hover:shadow-[0_0_30px_rgba(227,249,138,0.1)] cursor-pointer"
                  : "opacity-75"
              }`}
            >
              {hasAccess && strategy.status === "active" ? (
                <Link href={`/strategies/${strategy.slug}`} className="block">
                  <StrategyCardContent strategy={strategy} StatusIcon={StatusIcon} accessLevel={accessLevel} statusStyle={statusStyle} />
                </Link>
              ) : (
                <StrategyCardContent strategy={strategy} StatusIcon={StatusIcon} accessLevel={accessLevel} statusStyle={statusStyle} locked={!hasAccess} />
              )}
            </Card>
          );
        })}
      </div>

      {/* Access Legend */}
      <Card className="mt-6">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#676986]" />
          Access Levels
        </h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(accessLevels).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-[#a8a8a8]">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// _StatusIcon passed for future status indicator display
function StrategyCardContent({
  strategy,
  StatusIcon: _StatusIcon,
  accessLevel,
  statusStyle,
  locked = false,
}: {
  strategy: StrategyDocument;
  StatusIcon: typeof CheckCircle;
  accessLevel: { label: string; color: string };
  statusStyle: { bg: string; text: string; label: string };
  locked?: boolean;
}) {
  return (
    <div className="relative">
      {locked && (
        <div className="absolute inset-0 bg-[#0D0D2A]/80 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-6 h-6 text-[#676986] mx-auto mb-2" />
            <span className="text-xs text-[#676986]">Access Restricted</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a3e] flex items-center justify-center">
          <strategy.icon className="w-5 h-5 text-[#65cdd8]" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text} font-medium`}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-1 group-hover:text-[#e3f98a] transition-colors">
        {strategy.title}
      </h3>
      <p className="text-sm text-[#a8a8a8] mb-3 line-clamp-2">
        {strategy.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-[#676986] mb-3">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {strategy.owner}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {strategy.updated}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" style={{ color: accessLevel.color }} />
          <span className="text-[10px]" style={{ color: accessLevel.color }}>
            {accessLevel.label}
          </span>
        </div>
        {strategy.status === "active" && !locked && (
          <ChevronRight className="w-4 h-4 text-[#676986] group-hover:text-[#e3f98a] group-hover:translate-x-1 transition-all" />
        )}
      </div>

      {strategy.progress !== undefined && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#676986]">Completion</span>
            <span className="text-[10px] text-[#6BCB77]">{strategy.progress}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6BCB77] rounded-full"
              style={{ width: `${strategy.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {strategy.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#676986]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
