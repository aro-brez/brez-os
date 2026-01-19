import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as Blob;
    const mimeType = (formData.get("mimeType") as string) || "audio/mp4";

    if (!audio || audio.size === 0) {
      return NextResponse.json({ error: "Empty audio" }, { status: 400 });
    }

    if (audio.size < 1000) {
      return NextResponse.json({ error: "Audio too short" }, { status: 400 });
    }

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = "mp4";
    if (mimeType.includes("webm")) ext = "webm";
    else if (mimeType.includes("ogg")) ext = "ogg";
    else if (mimeType.includes("wav")) ext = "wav";

    const file = new File([buffer], `audio.${ext}`, { type: mimeType });

    const openaiForm = new FormData();
    openaiForm.append("file", file);
    openaiForm.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiForm,
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: `Whisper ${response.status}: ${responseText.slice(0, 100)}` }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json({ text: data.text || "" });

  } catch (error: any) {
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
