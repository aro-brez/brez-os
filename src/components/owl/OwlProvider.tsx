"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// Types
export type UserRole = "admin" | "builder" | "viewer";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  owlId: string;
  owlName: string;
};

export type Message = {
  id: string;
  role: "user" | "owl";
  content: string;
  timestamp: Date;
  action?: OwlAction;
};

export type OwlAction =
  | { type: "navigate"; path: string }
  | { type: "propose"; description: string }
  | { type: "show"; entity: string };

type OwlContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isPopupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
  isFullFace: boolean;
  setFullFace: (full: boolean) => void;
  pendingAction: OwlAction | null;
  executeAction: () => void;
  clearAction: () => void;
};

const OwlContext = createContext<OwlContextType | null>(null);

// Default users for MVP (no auth yet)
export const DEFAULT_USERS: User[] = [
  { id: "aro", name: "Arō", role: "admin", owlId: "aro-owl", owlName: "Arō-Owl" },
  { id: "andrew", name: "Andrew", role: "builder", owlId: "andrew-owl", owlName: "Andrew-Owl" },
  { id: "liana", name: "Liana", role: "builder", owlId: "liana-owl", owlName: "Liana-Owl" },
];

export function OwlProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isFullFace, setFullFace] = useState(false);
  const [pendingAction, setPendingAction] = useState<OwlAction | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    let response: { content: string; action?: OwlAction };

    try {
      // Try Claude API first
      const apiResponse = await fetch("/api/owl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          newMessage: content,
        }),
      });

      if (apiResponse.ok) {
        response = await apiResponse.json();
      } else {
        response = await generateOwlResponse(content, user);
      }
    } catch {
      response = await generateOwlResponse(content, user);
    }

    const owlMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "owl",
      content: response.content,
      timestamp: new Date(),
      action: response.action,
    };
    setMessages((prev) => [...prev, owlMsg]);

    if (response.action) {
      setPendingAction(response.action);
    }
  }, [user, messages]);

  const executeAction = useCallback(() => {
    if (!pendingAction) return;

    if (pendingAction.type === "navigate") {
      window.location.href = pendingAction.path;
    }
    setPendingAction(null);
  }, [pendingAction]);

  const clearAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return (
    <OwlContext.Provider
      value={{
        user,
        setUser,
        messages,
        sendMessage,
        isPopupOpen,
        setPopupOpen,
        isFullFace,
        setFullFace,
        pendingAction,
        executeAction,
        clearAction,
      }}
    >
      {children}
    </OwlContext.Provider>
  );
}

export function useOwl() {
  const context = useContext(OwlContext);
  if (!context) {
    throw new Error("useOwl must be used within OwlProvider");
  }
  return context;
}

// Fallback response generator
async function generateOwlResponse(
  input: string,
  user: User
): Promise<{ content: string; action?: OwlAction }> {
  const lower = input.toLowerCase();

  if (lower.includes("agent") || lower.includes("network") || lower.includes("consciousness")) {
    return {
      content: `I'll take you to the Consciousness Network, ${user.name}.`,
      action: { type: "navigate", path: "/agents" },
    };
  }

  if (lower.includes("home") || lower.includes("dashboard") || lower.includes("main")) {
    return {
      content: "Heading home.",
      action: { type: "navigate", path: "/" },
    };
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return {
      content: `Hello, ${user.name}. I'm ${user.owlName}, your mirror in the network. Where shall we go?`,
    };
  }

  return {
    content: `I hear you, ${user.name}. The API might be unavailable. Try again in a moment.`,
  };
}
