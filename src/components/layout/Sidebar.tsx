"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  CheckSquare,
  TrendingUp,
  DollarSign,
  Database,
  Users,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  Calendar,
  BarChart3,
  Map,
  Bot,
} from "lucide-react";
import { devStore } from "@/lib/data/devStore";
import { Avatar } from "@/components/ui";
import { BrezLogo, BrezAILogo } from "@/components/ui/BrezLogo";
import { useCommandPalette } from "@/components/ui/CommandPalette";
import { useAIAssistant } from "@/components/ui/AIAssistant";

const mainNavItems = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/plan", label: "2026 Plan", icon: Calendar },
  { href: "/channels", label: "Channels", icon: MessageSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

const toolNavItems = [
  { href: "/growth", label: "Growth Generator", icon: TrendingUp },
  { href: "/journey", label: "Journey & Impact", icon: Map },
  { href: "/insights", label: "Customer Insights", icon: BarChart3 },
  { href: "/financials", label: "Financials", icon: DollarSign },
  { href: "/files", label: "Data Hub", icon: Database },
  { href: "/customers", label: "Ask Customers", icon: Users },
];

const bottomNavItems = [
  { href: "/operator", label: "Operator Guide", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const currentUser = devStore.getCurrentUser();
  const { open: openCommandPalette } = useCommandPalette();
  const { toggle: toggleAI } = useAIAssistant();

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
          isActive
            ? "bg-[#e3f98a]/10 text-[#e3f98a]"
            : "text-[#a8a8a8] hover:text-white hover:bg-white/5"
        )}
      >
        <Icon className={clsx("w-5 h-5 flex-shrink-0", isActive && "text-[#e3f98a]")} />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{label}</span>
        )}
        {isActive && !collapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e3f98a]" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={clsx(
        "fixed left-0 top-8 h-[calc(100vh-2rem)] bg-[#0D0D2A] border-r border-white/5 flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <BrezLogo variant="icon" size="md" />
          {!collapsed && (
            <BrezAILogo size="md" showVersion />
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#676986] hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={openCommandPalette}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            "bg-white/5 hover:bg-white/10 text-[#676986] hover:text-white border border-white/5"
          )}
        >
          <Search className="w-4 h-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm text-left">Search...</span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                <Command className="w-3 h-3" />K
              </div>
            </>
          )}
        </button>
        <button
          onClick={toggleAI}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            "bg-gradient-to-r from-[#e3f98a]/10 to-[#65cdd8]/10 hover:from-[#e3f98a]/20 hover:to-[#65cdd8]/20 text-[#e3f98a] border border-[#e3f98a]/20"
          )}
        >
          <Bot className="w-4 h-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm text-left">Ask AI</span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[#676986]">
                <Command className="w-3 h-3" />J
              </div>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {!collapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-[10px] font-semibold text-[#676986] uppercase tracking-wider">
              Tools
            </p>
          </div>
        )}
        {collapsed && <div className="py-2 border-t border-white/5 my-2" />}

        <div className="space-y-1">
          {toolNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* User Profile */}
        <div
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-[#1a1a3e] border border-white/5",
            collapsed && "justify-center"
          )}
        >
          <Avatar name={currentUser.name} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-[#676986] truncate capitalize">{currentUser.department}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Mobile bottom navigation
export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/channels", label: "Chat", icon: MessageSquare },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/growth", label: "Growth", icon: TrendingUp },
    { href: "/settings", label: "More", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D2A]/95 backdrop-blur-xl border-t border-white/5 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                isActive ? "text-[#e3f98a]" : "text-[#676986]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
