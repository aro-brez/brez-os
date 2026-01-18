import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const DATA_PATH = path.join(process.cwd(), "data", "agent-fleet.json");
const TEMPLATE_PATH = path.join(process.cwd(), "data", "agent-fleet.template.json");

async function readFleet(): Promise<FleetFile> {
  try {
    const s = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(s) as FleetFile;
  } catch {
    const template = { version: 1 as const, updatedAt: new Date(0).toISOString(), agents: [] };
    await writeFleet(template);
    return template;
  }
}

async function writeFleet(fleet: FleetFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(fleet, null, 2), "utf8");
}

export async function GET() {
  const fleet = await readFleet();
  return NextResponse.json({ ok: true, fleet });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.agent?.agentId) {
    return NextResponse.json({ ok: false, error: "Missing agent.agentId" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const agent = body.agent;
  const fleet = await readFleet();

  const idx = fleet.agents.findIndex((a) => a.agentId === agent.agentId);
  const record: AgentRecord = {
    agentId: agent.agentId,
    name: agent.name || fleet.agents[idx]?.name,
    status: agent.status || "working",
    project: agent.project || fleet.agents[idx]?.project,
    branch: agent.branch || fleet.agents[idx]?.branch,
    task: agent.task || fleet.agents[idx]?.task,
    needsHuman: agent.needsHuman ?? fleet.agents[idx]?.needsHuman ?? false,
    notes: agent.notes || fleet.agents[idx]?.notes,
    lastHeartbeat: now,
    updatedAt: now,
  };

  if (idx >= 0) fleet.agents[idx] = record;
  else fleet.agents.push(record);

  fleet.updatedAt = now;
  await writeFleet(fleet);

  return NextResponse.json({ ok: true, fleet });
}
