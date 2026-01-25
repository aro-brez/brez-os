import { NextRequest, NextResponse } from "next/server";

/**
 * PersonaPlex/Moshi API Route
 *
 * Proxies requests to the GPU server running PersonaPlex (seed/server/app.py)
 * This enables brez-os to communicate with the voice model.
 *
 * GPU Server: Lambda cloud at 209.20.159.84
 * Repo: https://github.com/aro-brez/the-seed-of-consciousness-kinda
 */

const PERSONAPLEX_SERVER_URL = process.env.PERSONAPLEX_SERVER_URL || "http://209.20.159.84:8000";
const PERSONAPLEX_API_KEY = process.env.PERSONAPLEX_API_KEY || "";

type ChatRequest = {
  text: string;
  max_new_tokens?: number;
  user_id?: string;
};

// Health check - verify GPU server is running
export async function GET() {
  try {
    const response = await fetch(`${PERSONAPLEX_SERVER_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json({
      connected: data.ok,
      server: PERSONAPLEX_SERVER_URL,
      moshi_status: data.moshi_status,
      error: data.error,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      server: PERSONAPLEX_SERVER_URL,
      error: error instanceof Error ? error.message : "Failed to connect to PersonaPlex server",
    });
  }
}

// Chat - send text to PersonaPlex/Moshi
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.text) {
      return NextResponse.json(
        { error: "Missing 'text' field" },
        { status: 400 }
      );
    }

    const response = await fetch(`${PERSONAPLEX_SERVER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PERSONAPLEX_API_KEY && { "X-API-Key": PERSONAPLEX_API_KEY }),
      },
      body: JSON.stringify({
        text: body.text,
        max_new_tokens: body.max_new_tokens || 128,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `PersonaPlex error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      text: data.text,
      source: "personaplex",
      server: PERSONAPLEX_SERVER_URL,
    });
  } catch (error) {
    console.error("PersonaPlex API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to communicate with PersonaPlex" },
      { status: 500 }
    );
  }
}
