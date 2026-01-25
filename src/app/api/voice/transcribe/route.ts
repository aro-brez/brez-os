import { NextRequest, NextResponse } from "next/server";

/**
 * Deepgram Speech-to-Text API Route
 *
 * Accepts audio blob, returns transcription.
 * For real-time streaming, use WebSocket directly from client.
 */

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export async function POST(request: NextRequest) {
  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const audioBlob = await request.blob();

    if (!audioBlob || audioBlob.size === 0) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": audioBlob.type || "audio/webm",
        },
        body: audioBlob,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram error:", errorText);
      return NextResponse.json(
        { error: `Deepgram error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({
      transcript,
      confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence,
      words: data.results?.channels?.[0]?.alternatives?.[0]?.words,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
