import { NextRequest, NextResponse } from "next/server";

/**
 * Text-to-Speech API Route
 *
 * Uses Cartesia for ultra-low latency TTS.
 * Falls back to OpenAI TTS if Cartesia not configured.
 */

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Cartesia voice IDs - you can customize these
const CARTESIA_VOICE_ID = process.env.CARTESIA_VOICE_ID || "a0e99841-438c-4a64-b679-ae501e7d6091"; // Default friendly voice

interface SpeakRequest {
  text: string;
  voice?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SpeakRequest = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Try Cartesia first (lowest latency)
    if (CARTESIA_API_KEY) {
      try {
        const response = await fetch("https://api.cartesia.ai/tts/bytes", {
          method: "POST",
          headers: {
            "X-API-Key": CARTESIA_API_KEY,
            "Cartesia-Version": "2024-06-10",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_id: "sonic-english",
            transcript: text,
            voice: {
              mode: "id",
              id: CARTESIA_VOICE_ID,
            },
            output_format: {
              container: "mp3",
              bit_rate: 128000,
              sample_rate: 44100,
            },
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
            },
          });
        }
        console.warn("Cartesia failed, trying fallback:", response.status);
      } catch (err) {
        console.warn("Cartesia error, trying fallback:", err);
      }
    }

    // Fall back to OpenAI TTS
    if (OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova", // Options: alloy, echo, fable, onyx, nova, shimmer
          response_format: "mp3",
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
          },
        });
      }
      console.error("OpenAI TTS failed:", response.status);
    }

    // No TTS available
    return NextResponse.json(
      { error: "No TTS service configured. Add CARTESIA_API_KEY or OPENAI_API_KEY to .env.local" },
      { status: 503 }
    );
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS failed" },
      { status: 500 }
    );
  }
}
