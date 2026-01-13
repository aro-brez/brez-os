"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AIAssistantProvider } from "@/components/ui/AIAssistant";
import { AuthGate } from "@/components/auth/AuthGate";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <AIAssistantProvider>
          <AuthGate>
            <div className="min-h-screen bg-[#0D0D2A]">
              {/* Sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <Sidebar />
              </div>

              {/* Main content area */}
              <main className="md:pl-64 min-h-screen pb-20 md:pb-0">
                {children}
              </main>

              {/* Mobile navigation */}
              <MobileNav />
            </div>
          </AuthGate>
        </AIAssistantProvider>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
