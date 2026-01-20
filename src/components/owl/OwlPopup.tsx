"use client";

import React, { useState, useRef, useEffect } from "react";
import { useOwl, DEFAULT_USERS, User, DashboardContext } from "./OwlProvider";
import { useMomentumData } from "@/lib/hooks/useMomentumData";

export function OwlPopup() {
  const momentumData = useMomentumData();
  const [mounted, setMounted] = useState(false);
  const {
    user,
    setUser,
    messages,
    sendMessage,
    isPopupOpen,
    setPopupOpen,
    pendingAction,
    executeAction,
    clearAction,
  } = useOwl();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;
    setIsLoading(true);

    // Build dashboard context for Owl
    const dashboardContext: DashboardContext = {
      trajectory: momentumData.trajectory,
      trajectoryPercent: momentumData.trajectoryPercent,
      canInvestMore: momentumData.canInvestMore,
      cashHeadroom: momentumData.cashHeadroom,
      weeklySpendCeiling: momentumData.weeklySpendCeiling,
      topLever: {
        name: momentumData.levers[0].name,
        current: momentumData.levers[0].currentDisplay,
        target: momentumData.levers[0].targetDisplay,
        impact: momentumData.levers[0].impact,
      },
      cash: {
        current: momentumData.cash.current,
        runway: momentumData.cash.runwayWeeks,
        apTotal: momentumData.cash.apTotal,
      },
      economics: {
        cac: momentumData.economics.cac,
        paybackMonths: momentumData.economics.paybackMonths,
        ltvRatio: momentumData.economics.ltvCacRatio,
        cm: momentumData.economics.contributionMargin,
      },
    };

    await sendMessage(input.trim(), dashboardContext);
    setInput("");
    setIsLoading(false);
  };

  const handleSelectUser = (selectedUser: User) => {
    setUser(selectedUser);
  };

  return (
    <>
      {!isPopupOpen && (
        <button
          onClick={() => setPopupOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center text-3xl z-[9999]"
        >
          🦉
        </button>
      )}

      {isPopupOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 flex flex-col z-[9999] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-purple-900/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦉</span>
              <div>
                <div className="font-semibold text-white">{user?.owlName || "OWL"}</div>
                <div className="text-xs text-purple-300">{user ? `Hello, ${user.name}` : "Select identity"}</div>
              </div>
            </div>
            <button onClick={() => setPopupOpen(false)} className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300 hover:text-white">✕</button>
          </div>

          {!user ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">🦉</div>
              <div className="text-xl text-white mb-2">Who is here?</div>
              <div className="text-purple-300 text-sm mb-6">Select your identity to wake your owl</div>
              <div className="w-full space-y-3">
                {DEFAULT_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-4 bg-gray-800/50 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition-all text-left"
                  >
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-sm text-purple-300">{u.owlName} awaits</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-purple-300/60 py-8">
                    <div className="text-4xl mb-3">🦉</div>
                    <div>Hello, {user.name}.</div>
                    <div className="text-sm mt-1">I am {user.owlName}. Where shall we go?</div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-100 border border-purple-500/20"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {pendingAction?.type === "navigate" && (
                <div className="mx-4 mb-2 p-3 bg-purple-900/40 rounded-xl border border-purple-500/30 flex items-center justify-between">
                  <span className="text-sm text-purple-200">Go to {pendingAction.path}?</span>
                  <div className="flex gap-2">
                    <button onClick={executeAction} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">Go</button>
                    <button onClick={clearAction} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Talk to your owl..."
                    className="flex-1 bg-gray-800 border border-purple-500/30 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-xl">
                    {isLoading ? "..." : "→"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
