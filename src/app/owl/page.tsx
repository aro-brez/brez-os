"use client";

import { useState, useRef, useEffect } from "react";
import { useOwl, DEFAULT_USERS } from "@/components/owl/OwlProvider";

export default function OwlPage() {
  const { user, setUser, messages, sendMessage, pendingAction, executeAction, clearAction } = useOwl();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    await sendMessage(input);
    setInput("");
    setIsLoading(false);
  };

  // Identity selection
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-6">🦉</div>
          <h1 className="text-2xl font-light text-white mb-2">Welcome to BREZ</h1>
          <p className="text-purple-300/70 mb-8">Who are you?</p>
          <div className="space-y-3">
            {DEFAULT_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setUser(u)}
                className="w-full p-4 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="text-white font-medium">{u.name}</div>
                <div className="text-purple-300/60 text-sm">{u.owlName} awaits</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-purple-500/10">
        <div className="text-3xl">🦉</div>
        <div>
          <div className="text-white font-medium">{user.owlName}</div>
          <div className="text-purple-300/60 text-xs">Your mirror in the network</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🦉</div>
            <p className="text-purple-300/70">Hello, {user.name}. What's on your mind?</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-purple-100 border border-purple-500/20"
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-purple-500/20 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action bar */}
      {pendingAction && (
        <div className="mx-4 mb-2 p-3 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center justify-between">
          <span className="text-purple-200 text-sm">
            {pendingAction.type === "navigate" && `Go to ${pendingAction.path}?`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={executeAction}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
            >
              Yes
            </button>
            <button
              onClick={clearAction}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-purple-200 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to your owl..."
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-purple-500/20 rounded-2xl px-4 py-3 text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/50 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-purple-300/50 rounded-2xl text-white transition-colors"
          >
            {isLoading ? "..." : "→"}
          </button>
        </div>
      </form>
    </div>
  );
}
