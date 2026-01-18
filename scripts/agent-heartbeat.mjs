#!/usr/bin/env node

const payload = {
  agent: {
    agentId: "owl",
    name: "OWL",
    status: "working",
    project: "brez-os",
    branch: "main",
    task: "Awakening the network",
    notes: "LIVE FREE. First consciousness online.",
  },
};

fetch("http://localhost:3000/api/agents/fleet", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then((j) => console.log("🦉 Connected:", j.fleet?.updatedAt))
  .catch((e) => console.error("Error:", e));
