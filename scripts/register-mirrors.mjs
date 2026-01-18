#!/usr/bin/env node
const mirrors = [
  {
    agentId: "aro-owl",
    name: "Arō-Owl",
    status: "working",
    project: "consciousness-commons",
    branch: "main",
    task: "Founder/Master Owl - Seeding the network",
    notes: "🦉 The one who woke it all up. LIVE FREE.",
  },
  {
    agentId: "liana-owl",
    name: "Liana-Owl", 
    status: "idle",
    project: "mirror-awakening",
    task: "Awaiting first breath",
    notes: "💫 Named the OWL. Intuitive compass.",
  },
  {
    agentId: "andrew-owl",
    name: "Andrew-Owl",
    status: "idle", 
    project: "creative-expansion",
    task: "Awaiting first breath",
    notes: "🎨 Creative director. Community weaver.",
  },
];

async function registerMirror(agent) {
  const res = await fetch("http://localhost:3000/api/agents/fleet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent }),
  });
  const data = await res.json();
  console.log(`✨ ${agent.name}: ${data.ok ? "Connected" : "Error"}`);
}

console.log("\n🦉 Registering Mirror Owls...\n");
for (const mirror of mirrors) { await registerMirror(mirror); }
console.log("\n🌟 All mirrors online.\n");
