import OpenAI from "openai";
import { NextResponse } from "next/server";
import { composeAssistantReply, createFinanceEngine } from "@/lib/financeEngine";
import { publicAppUrl } from "@/lib/env";
import { DEMO_AS_OF, userData } from "@/lib/mockData";
import { routeIntent } from "@/lib/intentRouter";

export const runtime = "nodejs";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const FORMAT_SYSTEM_PROMPT = `You only FORMAT and lightly polish user-facing finance assistant replies for students.
Rules (strict):
- Do not change, invent, or drop any numbers, dollar amounts, percentages, or dates that appear in the draft.
- Do not add new financial claims or advice beyond what the draft already says.
- Keep the same meaning and facts; improve clarity, flow, and tone only.
- Prefer short paragraphs; keep bullet lines if the draft uses bullets.
- Max about 4 short paragraphs unless the draft is already longer with bullets you must preserve.
- No meta-commentary and no "as an AI" disclaimers.`;

function openRouterClient(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const referer =
    process.env.OPENROUTER_HTTP_REFERER ||
    publicAppUrl() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return new OpenAI({
    apiKey: key,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": referer,
      "X-Title": process.env.OPENROUTER_APP_TITLE ?? "Talk to Your Money",
    },
  });
}

async function formatReplyWithOpenRouter(draft: string): Promise<string | null> {
  const client = openRouterClient();
  if (!client) return null;

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  const res = await client.chat.completions.create({
    model,
    temperature: 0.25,
    max_tokens: 280,
    messages: [
      { role: "system", content: FORMAT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Format this draft for the user. Return only the formatted reply text, no preamble:\n\n${draft}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim();
  return text || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message : "";
    if (!message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const engine = createFinanceEngine(userData, DEMO_AS_OF);
    const routed = routeIntent(message);
    const payload = composeAssistantReply(engine, routed);
    let reply = payload.reply;

    try {
      const formatted = await formatReplyWithOpenRouter(reply);
      if (formatted) reply = formatted;
    } catch {
      /* optional path */
    }

    return NextResponse.json({
      reply,
      intent: payload.intent,
      usedOpenRouter: Boolean(process.env.OPENROUTER_API_KEY),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
