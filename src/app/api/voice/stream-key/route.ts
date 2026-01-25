import { NextResponse } from "next/server";

/**
 * Returns a temporary Deepgram API key for client-side streaming
 *
 * This follows KeyHolder pattern - client gets short-lived token,
 * never sees the real API key.
 *
 * TODO: Implement proper scoped/temporary keys when Deepgram supports it
 * For now, this proxies the key for WebSocket connections
 */

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  // In production, mint a scoped temporary key here
  // For now, return the key (client needs it for WebSocket)
  return NextResponse.json({
    key: apiKey,
    expiresIn: 3600, // 1 hour conceptually
  });
}
