"use client";

import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from "react";
import { clsx } from "clsx";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { brain } from "@/lib/ai/brain";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantContextType {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  addMessage: (content: string) => Promise<void>;
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null);

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return context;
}

// Get AI insight from brain recommendations
function getInsightFromBrain(): { text: string; type: "tip" | "warning" | "success" | "action" } {
  const recommendations = brain.getRecommendations();

  if (recommendations.length === 0) {
    return { text: "System running smoothly. Focus on Growth Generator principles.", type: "tip" };
  }

  // Pick a random recommendation and format it
  const rec = recommendations[Math.floor(Math.random() * recommendations.length)];

  let type: "tip" | "warning" | "success" | "action" = "tip";
  if (rec.type === "warning" || rec.priority === "critical") {
    type = "warning";
  } else if (rec.type === "action") {
    type = "action";
  } else if (rec.type === "decision" || rec.type === "insight") {
    type = "tip";
  }

  return { text: rec.description, type };
}

// Generate context-aware suggestions based on brain response
function getSuggestionsForContext(message: string): string[] {
  const context = brain.parseConversation(message);

  if (context.intent === "simulate") {
    return ["Simulate CAC at $50", "What if we increase spend?", "Test conversion improvement"];
  }
  if (context.topic === "finance") {
    return ["Show AP breakdown", "Project runway", "Simulate spend reduction"];
  }
  if (context.topic === "growth") {
    return ["View DTC metrics", "Run growth simulation", "Check conversion rate"];
  }
  if (context.topic === "operations") {
    return ["View at-risk goals", "Review overdue tasks", "Check pending decisions"];
  }

  return ["What should I focus on?", "Show financial health", "Run a simulation"];
}

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(getInsightFromBrain());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rotate insights from brain
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight(getInsightFromBrain());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Get real AI response from brain
    try {
      const brainResponse = await brain.generateResponse(content);
      const suggestions = getSuggestionsForContext(content);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: brainResponse.response,
        timestamp: new Date(),
        suggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: "I encountered an issue processing your request. Please try again.",
        timestamp: new Date(),
        suggestions: ["What should I focus on?", "Show financial health"],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
    setIsTyping(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage(input);
  };

  const getInsightIcon = () => {
    switch (currentInsight.type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-[#ffce33]" />;
      case "success": return <CheckCircle className="w-4 h-4 text-[#6BCB77]" />;
      case "action": return <Zap className="w-4 h-4 text-[#65cdd8]" />;
      default: return <Lightbulb className="w-4 h-4 text-[#e3f98a]" />;
    }
  };

  return (
    <AIAssistantContext.Provider value={{ open, close, toggle, isOpen, addMessage }}>
      {children}

      {/* Floating AI Button */}
      <button
        onClick={toggle}
        className={clsx(
          "fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
          "bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] hover:scale-110 hover:shadow-xl",
          "md:bottom-8 md:right-8",
          isOpen && "rotate-180 scale-90"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#0D0D2A]" />
        ) : (
          <Bot className="w-6 h-6 text-[#0D0D2A]" />
        )}
      </button>

      {/* AI Panel */}
      <div
        className={clsx(
          "fixed bottom-24 right-6 z-[99] w-[400px] max-w-[calc(100vw-3rem)] bg-[#0D0D2A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
          "md:bottom-28 md:right-8",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#e3f98a]/10 to-[#65cdd8]/10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#0D0D2A]" />
              </div>
              <div>
                <h3 className="font-bold text-white">BRĒZ AI</h3>
                <p className="text-xs text-[#676986]">Your operating system assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[#676986] text-xs">
              <span>⌘J</span>
            </div>
          </div>

          {/* Smart Insight */}
          <div className="mt-3 p-3 rounded-xl bg-[#1a1a3e] border border-white/5">
            <div className="flex items-start gap-2">
              {getInsightIcon()}
              <p className="text-sm text-[#a8a8a8] flex-1">{currentInsight.text}</p>
              <button
                onClick={() => setCurrentInsight(getInsightFromBrain())}
                className="text-[#676986] hover:text-white transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-[#676986] opacity-50" />
              <p className="text-[#676986] mb-4">Ask me anything about BRĒZ operations</p>
              <div className="space-y-2">
                {["What should I focus on today?", "How's our cash position?", "Review pending decisions"].map((q) => (
                  <button
                    key={q}
                    onClick={() => addMessage(q)}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 text-sm text-[#a8a8a8] hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 inline mr-2 opacity-50" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-[#e3f98a] text-[#0D0D2A]"
                      : "bg-[#1a1a3e] text-white border border-white/5"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggestions && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => addMessage(s)}
                          className="flex items-center gap-2 text-xs text-[#65cdd8] hover:text-white transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-center gap-2 text-[#676986]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e3f98a]/20 to-[#65cdd8]/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#e3f98a]" />
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BRĒZ AI..."
              className="flex-1 bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-[#e3f98a] flex items-center justify-center text-[#0D0D2A] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4ea7b] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </AIAssistantContext.Provider>
  );
}
