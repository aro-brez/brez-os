"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AIAssistantProvider } from "@/components/ui/AIAssistant";
import { AuthGate } from "@/components/auth/AuthGate";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider>
      <AIAssistantProvider>
        <AuthGate>
          <div className="min-h-screen bg-[#0D0D2A]">
            {children}
          </div>
        </AuthGate>
      </AIAssistantProvider>
    </ToastProvider>
  );
}
