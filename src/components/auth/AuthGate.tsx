"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { BrezLogo } from "@/components/ui/BrezLogo";
import { Button } from "@/components/ui";
import {
  getAllTeamMembers,
  findUserByEmail,
  getSelectedUser,
  setSelectedUser,
  type BrezUser,
} from "@/lib/stores/userStore";
import { Search, ChevronRight } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { data: session, status } = useSession();
  const [selectedUser, setLocalSelectedUser] = useState<BrezUser | null>(null);
  const [needsSelection, setNeedsSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already selected
    const stored = getSelectedUser();
    if (stored) {
      setLocalSelectedUser(stored);
      setIsLoading(false);
      return;
    }

    // If logged in, try to match email to org chart
    if (session?.user?.email) {
      const matched = findUserByEmail(session.user.email);
      if (matched) {
        setSelectedUser(matched);
        setLocalSelectedUser(matched);
      } else {
        setNeedsSelection(true);
      }
    }
    setIsLoading(false);
  }, [session]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center">
        <div className="text-center">
          <BrezLogo variant="icon" size="xl" className="mx-auto mb-4 animate-pulse" />
          <p className="text-[#676986]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login screen
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <BrezLogo variant="icon" size="xl" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-2">
            BREZ <span className="text-[#e3f98a]">Supermind</span>
          </h1>
          <p className="text-[#a8a8a8] mb-8">
            Your AI co-pilot for building a $200B company
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
            onClick={() => signIn("google")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-xs text-[#676986] mt-6">
            Use your @drinkbrez.com email
          </p>
        </div>
      </div>
    );
  }

  // Logged in but needs to select who they are
  if (needsSelection && !selectedUser) {
    const allUsers = getAllTeamMembers();
    const filteredUsers = searchQuery
      ? allUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allUsers;

    // Group by department
    const departments = [
      { key: "exec", label: "Executive" },
      { key: "growth", label: "Growth & Marketing" },
      { key: "retail", label: "Sales & Retail" },
      { key: "finance", label: "Finance" },
      { key: "ops", label: "Operations" },
      { key: "product", label: "Product" },
      { key: "cx", label: "Customer Experience" },
    ];

    return (
      <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <BrezLogo variant="icon" size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to BREZ Supermind
            </h1>
            <p className="text-[#a8a8a8]">
              Select your name so we can personalize your experience
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#676986]" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a3e] border border-white/10 rounded-xl text-white placeholder:text-[#676986] focus:outline-none focus:border-[#e3f98a]/50"
            />
          </div>

          {/* User List */}
          <div className="bg-[#1a1a3e] rounded-xl border border-white/10 max-h-[400px] overflow-y-auto">
            {departments.map((dept) => {
              const deptUsers = filteredUsers.filter((u) => u.department === dept.key);
              if (deptUsers.length === 0) return null;

              return (
                <div key={dept.key}>
                  <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-[#676986] uppercase tracking-wider sticky top-0">
                    {dept.label}
                  </div>
                  {deptUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setLocalSelectedUser(user);
                        setNeedsSelection(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="text-left">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-sm text-[#676986]">{user.title}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#676986]" />
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Fully authenticated and identified
  return <>{children}</>;
}
