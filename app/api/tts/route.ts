import { NextResponse } from "next/server";

export const runtime = "nodejs";
// TTS streaming can take up to ~30s for longer replies. Set headroom for Vercel.
export const maxDuration = 60;

const DEFAULT_MODEL = "google/gemini-3.1-flash-tts-preview";
// Gemini TTS "Kore" is a natural, warm female voice. Overridable via env or request.
const DEFAULT_VOICE = "Kore";

// Gemini returns raw 16-bit PCM mono at 24kHz. We wrap it in a minimal WAV header so browsers can play it.
function wrapPcmInWav(pcm: Uint8Array, sampleRate = 24000, channels = 1, bitsPerSample = 16): Uint8Array {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.byteLength;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const out = new Uint8Array(44 + dataSize);
  out.set(new Uint8Array(header), 0);
  out.set(pcm, 44);
  return out;
}

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

    const voice =
      typeof body.voice === "string" && body.voice
        ? body.voice
        : process.env.OPENROUTER_TTS_VOICE?.trim() || DEFAULT_VOICE;
    const model = process.env.OPENROUTER_TTS_MODEL?.trim() || DEFAULT_MODEL;
    const isGemini = model.toLowerCase().includes("gemini");

    // Gemini TTS requires pcm; other providers accept mp3/wav.
    const requestedFormat =
      typeof body.format === "string" && body.format ? body.format : isGemini ? "pcm" : "mp3";
    const responseFormat = isGemini ? "pcm" : requestedFormat;

    const instructions =
      "Speak in English with a pronounced German accent — hard consonants, rolled 'r', 'w' pronounced as 'v', 'th' pronounced as 'z'. Confident, direct, a little stern, a little flirty. Medium pace. Natural breathing and inflection, not robotic.";

    const payload = {
      model,
      input,
      voice,
      response_format: responseFormat,
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

    if (responseFormat === "pcm") {
      const wav = wrapPcmInWav(new Uint8Array(arrayBuffer));
      const out = new ArrayBuffer(wav.byteLength);
      new Uint8Array(out).set(wav);
      return new NextResponse(out, {
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    }

    const contentType =
      responseFormat === "mp3"
        ? "audio/mpeg"
        : res.headers.get("content-type") || "application/octet-stream";

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
