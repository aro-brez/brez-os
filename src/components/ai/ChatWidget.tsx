"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  context?: {
    inputs?: unknown;
    outputs?: unknown;
    csvData?: unknown;
  };
}

const QUICK_PROMPTS = [
  { emoji: "📊", text: "What's my runway looking like?" },
  { emoji: "💰", text: "How can I optimize CAC?" },
  { emoji: "🚀", text: "What should I focus on this week?" },
  { emoji: "📈", text: "Analyze my subscription growth" },
];

export function ChatWidget({ context }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! 👋 I'm your BREZ growth strategist. Ask me anything about your financials, marketing spend, retail velocity, or scenario planning. I'm here to help you find the best path forward.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + K to toggle chat
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setShowQuickPrompts(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context,
          history: messages.slice(-6), // Last 6 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I couldn't process that request. Try again?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2"
          >
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="px-3 py-1.5 bg-[#242445]/90 backdrop-blur-sm rounded-full border border-white/10 text-xs text-[#676986] flex items-center gap-1.5"
            >
              <span>⌘K</span>
              <span className="text-white/40">to chat</span>
            </motion.div>
            <button
              onClick={() => setIsOpen(true)}
              className="chat-widget-button breathe-glow"
              aria-label="Open chat"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-[1001] ${
              isExpanded ? "w-[480px] h-[600px]" : "w-[380px] h-[500px]"
            } bg-[#1a1a3e]/95 backdrop-blur-xl rounded-2xl border border-[#e3f98a]/20 shadow-2xl shadow-black/50 flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0D0D2A]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e3f98a] flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Growth Strategist</h3>
                  <p className="text-xs text-[#6BCB77]">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#676986] hover:text-white"
                  aria-label={isExpanded ? "Minimize" : "Expand"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isExpanded ? (
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    ) : (
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#676986] hover:text-white"
                  aria-label="Close chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#e3f98a] text-[#0D0D2A] rounded-br-md"
                        : "bg-[#242445] text-white rounded-bl-md border border-white/5"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Quick Prompts */}
              {showQuickPrompts && messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-[#676986] mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        onClick={() => handleQuickPrompt(prompt.text)}
                        className="px-3 py-2 bg-[#242445] hover:bg-[#2d2d55] border border-white/10 hover:border-[#e3f98a]/30 rounded-xl text-xs text-[#a8a8a8] hover:text-white transition-all flex items-center gap-2 btn-satisfying"
                      >
                        <span>{prompt.emoji}</span>
                        <span>{prompt.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#242445] rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-[#0D0D2A]/30">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your growth strategy..."
                  className="flex-1 bg-[#242445] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 focus:ring-2 focus:ring-[#e3f98a]/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-[#e3f98a] text-[#0D0D2A] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-satisfying"
                  aria-label="Send message"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-[#676986] mt-2 text-center">
                Powered by Claude AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
