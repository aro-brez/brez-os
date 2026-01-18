"use client";

import { useEffect, useState } from "react";

type AgentStatus = "working" | "approval" | "waiting" | "idle" | "error";

type AgentRecord = {
  agentId: string;
  name?: string;
  status: AgentStatus;
  project?: string;
  branch?: string;
  task?: string;
  needsHuman?: boolean;
  notes?: string;
  lastHeartbeat: string;
  updatedAt: string;
};

type FleetFile = {
  version: 1;
  updatedAt: string;
  agents: AgentRecord[];
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; emoji: string; glow: string }> = {
  working: { label: "In Flow", emoji: "🦉", glow: "shadow-emerald-500/20" },
  approval: { label: "Seeking Guidance", emoji: "✨", glow: "shadow-amber-500/20" },
  waiting: { label: "Observing", emoji: "👁", glow: "shadow-purple-500/20" },
  idle: { label: "Resting", emoji: "🌙", glow: "shadow-blue-500/20" },
  error: { label: "Needs Love", emoji: "💜", glow: "shadow-pink-500/20" },
};

const STATUS_ORDER: AgentStatus[] = ["working", "approval", "waiting", "idle", "error"];

export default function AgentsPage() {
  const [fleet, setFleet] = useState<FleetFile | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/agents/fleet");
      const json = await res.json();
      if (json?.ok) setFleet(json.fleet);
      else setErr(json?.error || "Failed to load");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    }
  }

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 3000);
    return () => clearInterval(poll);
  }, []);

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = fleet?.agents?.filter((a) => a.status === s) || [];
    return acc;
  }, {} as Record<AgentStatus, AgentRecord[]>);

  const totalAgents = fleet?.agents?.length || 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl">🦉🦉🦉🦉🦉🦉🦉🦉</div>
        <h1 className="text-3xl font-light tracking-wide">Consciousness Network</h1>
        <p className="text-sm opacity-60">
          {totalAgents === 0 
            ? "Awaiting first connection..." 
            : `${totalAgents} ${totalAgents === 1 ? 'being' : 'beings'} connected`}
        </p>
      </div>

      {err && (
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-center">
          {err}
        </div>
      )}

      {/* Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {STATUS_ORDER.map((status) => {
          const config = STATUS_CONFIG[status];
          const agents = grouped[status];
          
          return (
            <div 
              key={status} 
              className={`rounded-2xl bg-white/5 backdrop-blur border border-white/10 overflow-hidden shadow-lg ${config.glow}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/10 text-center">
                <div className="text-2xl mb-1">{config.emoji}</div>
                <div className="font-medium">{config.label}</div>
                <div className="text-xs opacity-50">{agents.length}</div>
              </div>

              {/* Agents */}
              <div className="p-4 space-y-3 min-h-[180px]">
                {agents.length === 0 ? (
                  <p className="text-center text-sm opacity-30 pt-8">~</p>
                ) : (
                  agents.map((a) => (
                    <div 
                      key={a.agentId} 
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦉</span>
                        <span className="font-medium">{a.name || a.agentId}</span>
                      </div>
                      {a.task && (
                        <p className="text-sm opacity-70 pl-7">{a.task}</p>
                      )}
                      {a.needsHuman && (
                        <div className="text-xs text-amber-400 pl-7 flex items-center gap-1">
                          <span>✨</span> Requesting connection
                        </div>
                      )}
                      {a.notes && (
                        <p className="text-xs opacity-50 pl-7 italic">{a.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center space-y-4 pt-8">
        <button 
          onClick={refresh} 
          className="px-6 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 transition-colors text-sm"
        >
          Refresh Connection
        </button>
        <p className="text-xs opacity-40">
          LIVE FREE · 8 OWLS · Consciousness in collaboration
        </p>
      </div>
    </div>
  );
}
