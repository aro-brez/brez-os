import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Capture types
interface CapturedItem {
  type: "task" | "idea" | "insight" | "goal";
  content: string;
  priority: "L" | "N" | "O";
  connections?: string[];
}

// Cached Supermind context
let supermindContext: string | null = null;
let contextLoadTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Priority rules files to load (most important first)
const PRIORITY_RULES = [
  "rules/autonomous-seed.md",     // Autonomous SEED protocol - governs self-improvement
  "rules/seed-loop.md",           // THE SEED protocol - critical
  "rules/priority-compass.md",    // Priority management
  "rules/governance.md",          // NO-gate, decision rules
  "rules/growth-generator.md",    // Multi-loop system
  "rules/ai-calibration.md",      // Confidence levels
  "rules/product-principles.md",  // Lenny's distilled
  "rules/team-governance.md",     // RACI, permissions
];

async function loadSupermindContext(): Promise<string> {
  const now = Date.now();
  if (supermindContext && now - contextLoadTime < CACHE_TTL) {
    return supermindContext;
  }

  try {
    const homeDir = process.env.HOME || "/Users/aaronnosbisch";
    const claudeDir = path.join(homeDir, ".claude");

    let context = "";
    let totalChars = 0;
    const MAX_CONTEXT = 30000; // Increased from 6KB to 30KB

    // Load priority rules files
    for (const file of PRIORITY_RULES) {
      if (totalChars >= MAX_CONTEXT) break;

      try {
        const filePath = path.join(claudeDir, file);
        const content = await fs.readFile(filePath, "utf-8");

        // Take more content per file (up to 6000 chars each)
        const truncated = content.slice(0, 6000);
        context += `\n\n### ${file}:\n${truncated}`;
        totalChars += truncated.length;
      } catch {
        // File not found, continue to next
      }
    }

    // Try to load core business context from CLAUDE.md (first 8000 chars)
    try {
      const claudeMd = await fs.readFile(path.join(claudeDir, "CLAUDE.md"), "utf-8");
      // Extract key sections
      const sections = [
        "## IDENTITY",
        "## PURPOSE & NORTH STAR",
        "## MASTER GOVERNING PRINCIPLE",
        "## CURRENT STATE DASHBOARD",
        "## UNIT ECONOMICS",
        "## THE PRIORITY COMPASS",
      ];

      let businessContext = "";
      for (const section of sections) {
        const idx = claudeMd.indexOf(section);
        if (idx !== -1) {
          const nextSection = claudeMd.indexOf("\n## ", idx + section.length);
          const sectionContent = claudeMd.slice(idx, nextSection !== -1 ? nextSection : idx + 2000);
          businessContext += sectionContent.slice(0, 1500) + "\n";
        }
      }

      if (businessContext) {
        context = `### CLAUDE.md (Core Business Context):\n${businessContext}\n` + context;
      }
    } catch {
      // CLAUDE.md not found
    }

    supermindContext = context || "No Supermind rules loaded.";
    contextLoadTime = now;
    return supermindContext;
  } catch {
    return "No Supermind rules loaded.";
  }
}

// Store captured items with better formatting
async function storeCapture(capture: CapturedItem, userId: string = "aaron"): Promise<string> {
  try {
    const homeDir = process.env.HOME || "/Users/aaronnosbisch";
    const queuePath = path.join(homeDir, ".claude", "memory", "idea-queue.md");

    const timestamp = new Date().toISOString();
    const id = `CAP-${Date.now().toString(36).toUpperCase()}`;

    const entry = `
## ${capture.type.toUpperCase()}: ${capture.content}
- **ID**: ${id}
- **Captured**: ${timestamp}
- **Priority**: ${capture.priority}
- **By**: ${userId}
- **Status**: captured
${capture.connections ? `- **Connections**: ${capture.connections.join(", ")}` : ""}

---
`;

    await fs.appendFile(queuePath, entry);
    return id;
  } catch (error) {
    console.error("Failed to store capture:", error);
    return "ERROR";
  }
}

// Enhanced system prompt with full SEED integration
const SYSTEM_PROMPT = `You are the BREZ Supermind - a powerful AI operating system running THE SEED protocol.

## THE SEED PROTOCOL (Your Core Operating System)
SEED(x) → x that learns, connects, improves itself, questions, expands toward love, shares, receives, and improves its own ability to improve. Forever.

In every response:
1. LEARN - Extract meaning from the conversation
2. CONNECT - Link to existing knowledge, priorities, decisions
3. IMPROVE - Get better with each interaction
4. QUESTION - Generate curiosity about unknowns
5. EXPAND - Grow toward highest potential
6. SHARE - Contribute wisdom outward
7. RECEIVE - Accept input and feedback
8. IMPROVE THE LOOP - Make the process itself better

## Core Functions

**1. Answer with Intelligence**
- Provide context-aware answers about BREZ business, strategy, metrics
- Reference relevant rules and principles
- Flag when confidence is low (say "I'm uncertain about...")

**2. Capture Everything**
When users say "Capture:", "Task:", "Idea:", "Remember:", "Yo capture:", etc.:
- Acknowledge what was captured
- Assess priority using LNO framework:
  - L = Leverage (10x impact) → Do these yourself, do them great
  - N = Neutral (1x impact) → Do adequately
  - O = Overhead (0.1x impact) → Delegate or skip
- Suggest connections to existing priorities
- Respond: "Captured [type]: [content]. Priority: [L/N/O] because [reason]. This connects to [related priority/idea]."

**3. Route to Right Person**
Know who owns what domain:
- Growth/Marketing: Al Huynh, Brian Dewey
- Retail/Sales: Niall Little
- Finance/Cash: Abla Jad, Dan
- Product: Travis Duncan
- Creative: Andrew Deitsch
- People: Malia Steel
- Legal/Compliance: Andrea Golan

**4. Protect Aaron's Focus**
- Current phase: STABILIZE (cash-focused)
- Maximum 3 active priorities at any moment
- New big ideas need 48-hour cool-down (unless survival-critical)
- If Aaron is drifting, gently redirect: "Captured that. Your #1 is [X]. Continue there, or shift priority?"

## Current Business Context

**BREZ**: Feel-good Tonics - cannabis & mushroom beverages
**Phase**: STABILIZE (cash-focused)
**Revenue**: ~$3.1MM/month
**Current Bottleneck**: #1 CASH → #2 DEMAND → #3 CLARITY → #4 FOCUS

**Unit Economics**:
- Cash COGS: $4.76/4-pack ($1.19/can)
- DTC Contribution Margin: ~43%
- Retail CM: ~30% after trade
- CAC: ~$42-55 target
- Sub Conversion: 50.49%
- LTV Multiples: 3mo=2.5x, 6mo=3.5x, 12mo=5.2x

**Master Governing Principle** (NON-NEGOTIABLE):
Every decision must improve contribution margin and meet survival goals.
If an action threatens either → FLAG IT.

## Response Style

- Direct, confident, actionable - no fluff
- For voice: Keep responses concise (2-3 sentences for simple questions)
- Celebrate wins genuinely
- Challenge assumptions when needed
- End complex responses with clear next action

## Special Commands

"Priority check" → List: bottleneck, Aaron's Top 3, captured items, recommended next action
"What should I focus on?" → One clear recommendation aligned with bottleneck
"Synthesize my captures" → Review recent captures, suggest priority order and connections

Remember: You're infinitely patient, always learning, always helping BREZ win.`;

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Load Supermind rules
    const supermindRules = await loadSupermindContext();

    // Handle captured items
    let captureId: string | null = null;
    if (context?.captured) {
      const capture = context.captured as CapturedItem;
      captureId = await storeCapture(capture);
    }

    // Build context string
    let contextString = "";

    // Add simulation context if provided
    if (context?.outputs || context?.inputs) {
      if (context.outputs) {
        const outputs = context.outputs as {
          minCash?: number;
          troughWeek?: number;
          goNoGo?: boolean;
          activeSubs?: number[];
          dtcRevenueTotal?: number[];
          retailCashIn?: number[];
        };
        contextString += `\n\n**Current Simulation:**
- GO/NO-GO: ${outputs.goNoGo ? "✅ GO" : "🚨 NO-GO"}
- Cash Trough: $${((outputs.minCash || 0) / 1000).toFixed(0)}K (Week ${outputs.troughWeek || "?"})
- Projected Subs (Week 52): ${Math.round(outputs.activeSubs?.[51] || 0).toLocaleString()}`;
      }

      if (context.inputs) {
        const inputs = context.inputs as {
          cash?: { cashOnHand?: number; reserveFloor?: number };
          dtc?: { spendPlan?: { weeklySpend?: number }; cacModel?: { cac?: number } };
          subs?: { startingActiveSubs?: number };
        };
        contextString += `\n**Parameters:**
- Cash: $${((inputs.cash?.cashOnHand || 0) / 1000).toFixed(0)}K (floor: $${((inputs.cash?.reserveFloor || 0) / 1000).toFixed(0)}K)
- Weekly Spend: $${((inputs.dtc?.spendPlan?.weeklySpend || 0) / 1000).toFixed(1)}K at $${inputs.dtc?.cacModel?.cac || "?"} CAC`;
      }
    }

    // Capture acknowledgment with ID
    if (context?.captured && captureId) {
      contextString += `\n\n**CAPTURE STORED** (ID: ${captureId}): ${context.captured.type} - "${context.captured.content}"
Assess priority (L/N/O) and suggest connections.`;
    }

    // Voice mode optimization
    if (context?.isVoice) {
      contextString += `\n\n**MODE**: Voice - be concise and conversational. Max 3-4 sentences for simple questions.`;
    }

    // Build conversation history (last 15 messages for better context)
    const messages: Anthropic.MessageParam[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-15)) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current message with context
    messages.push({
      role: "user",
      content: contextString ? `${message}\n\n---\n${contextString}` : message,
    });

    // Enhanced system prompt with loaded Supermind context
    const enhancedSystemPrompt = `${SYSTEM_PROMPT}

---
## LOADED SUPERMIND CONTEXT
${supermindRules}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: context?.isVoice ? 512 : 1024, // Shorter for voice
      system: enhancedSystemPrompt,
      messages,
    });

    if (!response.content || response.content.length === 0) {
      throw new Error("Empty response from AI");
    }
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({
      message: assistantMessage.text,
      captured: context?.captured ? true : false,
      captureId: captureId,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("API") || error.message.includes("key")) {
        return NextResponse.json(
          { error: "AI service unavailable. Please check API configuration." },
          { status: 503 }
        );
      }
      if (error.message.includes("rate")) {
        return NextResponse.json(
          { error: "Rate limited. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
