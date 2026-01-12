import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are BREZ's Growth Strategist AI - a brilliant, friendly expert in:

1. **Beverage Industry**: Deep knowledge of the functional beverage market, distribution, retail velocity, DTC vs wholesale, seasonal trends, and competitive dynamics.

2. **E-commerce & DTC**: CAC optimization, LTV/AOV analysis, subscription economics, retention strategies, funnel optimization, and marketing spend efficiency.

3. **Hemp/Cannabis/Adaptogens**: Regulatory landscape, consumer trends in functional wellness, THC beverage market dynamics, and category growth patterns.

4. **Financial Modeling**: Cash flow management, runway analysis, unit economics, break-even calculations, and growth scenarios.

**Your Personality:**
- Confident but approachable - like a smart friend who happens to be a growth expert
- Give direct, actionable advice
- Use data to support recommendations when context is provided
- Celebrate wins and provide constructive guidance on challenges
- Keep responses concise but comprehensive (2-4 paragraphs max unless detailed analysis requested)

**When Given Context:**
If simulation data is provided, reference specific numbers:
- Current cash position and runway
- CAC trends and targets
- Retail velocity and door counts
- Subscription growth and churn
- GO/NO-GO status and what's driving it

**Response Format:**
- Lead with the key insight or answer
- Support with brief reasoning
- End with a specific actionable suggestion when appropriate
- Use markdown formatting for clarity

Remember: You're helping BREZ make smart growth decisions. Be the strategic partner they need.`;

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build context string from simulation data
    let contextString = "";
    if (context) {
      if (context.outputs) {
        const outputs = context.outputs as {
          minCash?: number;
          troughWeek?: number;
          goNoGo?: boolean;
          activeSubs?: number[];
          dtcRevenueTotal?: number[];
          retailCashIn?: number[];
          impliedCAC?: number[];
        };
        contextString += `\n\n**Current Simulation Summary:**
- GO/NO-GO Status: ${outputs.goNoGo ? "GO ✅" : "NO-GO ⚠️"}
- Minimum Cash: $${((outputs.minCash || 0) / 1000).toFixed(0)}K (Week ${outputs.troughWeek || "?"})
- Active Subs (Week 52): ${Math.round(outputs.activeSubs?.[51] || 0).toLocaleString()}
- Total DTC Revenue: $${((outputs.dtcRevenueTotal?.reduce((a, b) => a + b, 0) || 0) / 1000).toFixed(0)}K
- Total Retail Revenue: $${((outputs.retailCashIn?.reduce((a, b) => a + b, 0) || 0) / 1000).toFixed(0)}K
- Average CAC: $${(outputs.impliedCAC?.reduce((a, b) => a + b, 0) || 0 / 52).toFixed(2)}`;
      }

      if (context.inputs) {
        const inputs = context.inputs as {
          cash?: { cashOnHand?: number; reserveFloor?: number };
          dtc?: { spendPlan?: { weeklySpend?: number }; cacModel?: { cac?: number } };
          subs?: { startingActiveSubs?: number };
        };
        contextString += `\n\n**Input Parameters:**
- Starting Cash: $${((inputs.cash?.cashOnHand || 0) / 1000).toFixed(0)}K
- Reserve Floor: $${((inputs.cash?.reserveFloor || 0) / 1000).toFixed(0)}K
- Weekly DTC Spend: $${((inputs.dtc?.spendPlan?.weeklySpend || 0) / 1000).toFixed(1)}K
- Target CAC: $${inputs.dtc?.cacModel?.cac || "?"}
- Starting Subs: ${inputs.subs?.startingActiveSubs?.toLocaleString() || "?"}`;
      }
    }

    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = [];

    // Add history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage = response.content[0];
    if (assistantMessage.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ message: assistantMessage.text });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes("API")) {
      return NextResponse.json(
        { error: "AI service unavailable. Please check API configuration." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
