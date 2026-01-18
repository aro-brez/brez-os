"use client";
import React, { createContext, useContext, useState } from "react";
type AIAssistantContextType = { isOpen: boolean; open: () => void; close: () => void; toggle: () => void; };
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return context;
}
export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AIAssistantContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen(!isOpen) }}>
      {children}
    </AIAssistantContext.Provider>
  );
}
