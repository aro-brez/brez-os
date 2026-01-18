"use client";

import React, { createContext, useContext, useState } from "react";

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "insight" | "suggestion" | "warning" | "info";
  timestamp: Date;
};

type AIAssistantContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (message: Omit<AIMessage, "id" | "timestamp">) => void;
};

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return context;
}

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  const addMessage = () => {}; // No-op, OWL handles messages now

  return (
    <AIAssistantContext.Provider value={{ open, close, toggle, isOpen, addMessage }}>
      {children}
    </AIAssistantContext.Provider>
  );
}
