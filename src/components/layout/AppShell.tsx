"use client";

import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";
import { AIAssistantProvider } from "@/components/ui/AIAssistant";
import { StatusBar } from "@/components/ui/StatusBar";
import { WelcomeModal } from "@/components/ui/WelcomeModal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <AIAssistantProvider>
          <div className="min-h-screen bg-[#0D0D2A]">
            {/* Global Status Bar */}
            <StatusBar />

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Main Content - adjusted for status bar */}
            <main className="md:ml-64 min-h-screen pb-20 md:pb-0 md:pt-8">
              {children}
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* Welcome Modal for first-time users */}
            <WelcomeModal />
          </div>
        </AIAssistantProvider>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
