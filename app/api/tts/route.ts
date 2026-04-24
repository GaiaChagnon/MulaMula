import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "openai/gpt-4o-mini-tts";
const DEFAULT_VOICE = "shimmer"; // warm female voice; handles German interjections well

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: unknown;
      voice?: unknown;
      format?: unknown;
    };
    const input = typeof body.input === "string" ? body.input.trim() : "";
    if (!input) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "TTS unavailable" }, { status: 503 });
    }

    const voice = typeof body.voice === "string" && body.voice ? body.voice : DEFAULT_VOICE;
    const format = typeof body.format === "string" && body.format ? body.format : "mp3";
    const model = process.env.OPENROUTER_TTS_MODEL?.trim() || DEFAULT_MODEL;

    // Guide the voice to sound German by prefixing an instructional SSML-like hint.
    // gpt-4o-mini-tts accepts an `instructions` field for tone/accent steering.
    const instructions =
      "Speak in English with a pronounced German accent — hard consonants, rolled 'r', 'w' pronounced as 'v', 'th' pronounced as 'z'. Confident, direct, a little stern, a little flirty. Medium pace.";

    const payload = {
      model,
      input,
      voice,
      response_format: format,
      instructions,
    };

    const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_HTTP_REFERER ||
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
        "X-Title": process.env.OPENROUTER_APP_TITLE ?? "MoneyTalkz",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `TTS provider error ${res.status}`, detail: errText.slice(0, 400) },
        { status: 502 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = format === "mp3" ? "audio/mpeg" : res.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
  }
}
