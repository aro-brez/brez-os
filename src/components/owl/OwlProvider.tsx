"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type UserRole = "admin" | "builder" | "viewer";

export type User = {
  id: string;
  name: string;
  email?: string;
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
  clearHistory: () => void;
};

const OwlContext = createContext<OwlContextType | null>(null);

export const DEFAULT_USERS: User[] = [
  { id: "aro", name: "Arō", role: "admin", owlId: "aro-owl", owlName: "Arō-Owl" },
  { id: "andrew", name: "Andrew", role: "builder", owlId: "andrew-owl", owlName: "Andrew-Owl" },
  { id: "liana", name: "Liana", role: "builder", owlId: "liana-owl", owlName: "Liana-Owl" },
];

function getStorageKey(userId: string) {
  return `owl-chat-${userId}`;
}

export function OwlProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isFullFace, setFullFace] = useState(false);
  const [pendingAction, setPendingAction] = useState<OwlAction | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("owl-user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserState(parsed);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(getStorageKey(user.id));
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } else {
        setMessages([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(messages));
    }
  }, [messages, user]);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("owl-user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("owl-user");
    }
  }, []);

  const clearHistory = useCallback(() => {
    if (user) {
      localStorage.removeItem(getStorageKey(user.id));
      setMessages([]);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    let response: { content: string; action?: OwlAction };

    try {
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
        clearHistory,
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

async function generateOwlResponse(
  input: string,
  user: User
): Promise<{ content: string; action?: OwlAction }> {
  const lower = input.toLowerCase();

  if (lower.includes("home") || lower.includes("dashboard")) {
    return {
      content: "Taking you home.",
      action: { type: "navigate", path: "/" },
    };
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return { content: "Hey " + user.name + ". What's up?" };
  }

  return { content: "I hear you. API might be down - try again." };
}
