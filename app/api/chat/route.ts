import OpenAI from "openai";
import { NextResponse } from "next/server";
import { composeAssistantReply, createFinanceEngine } from "@/lib/financeEngine";
import { publicAppUrl } from "@/lib/env";
import { DEMO_AS_OF, userData as mockUserData } from "@/lib/mockData";
import type { UserData } from "@/lib/mockData";
import { routeIntent } from "@/lib/intentRouter";
import type { Goal } from "@/lib/goals";
import { goalProgressPercent, monthsToGoal } from "@/lib/goals";
import type { SearchResult } from "@/lib/searchTool";

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

const DEFAULT_MODEL = "moonshotai/kimi-k2.5";

function resolveModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

async function formatReplyWithOpenRouter(draft: string): Promise<string | null> {
  const client = openRouterClient();
  if (!client) return null;

  const model = resolveModel();

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

function buildGoalsContext(goals: Goal[]): string {
  if (goals.length === 0) return "";
  const lines = goals.map((g) => {
    const progress = goalProgressPercent(g);
    const months = monthsToGoal(g);
    const monthsStr = months === null ? "no monthly contribution set" : months === 0 ? "already reached" : `~${months} months to go`;
    const notesStr = g.notes ? ` Notes: ${g.notes}.` : "";
    return `• ${g.name}: target $${g.targetAmount}, saved $${g.savedAmount} (${progress}%), contributing $${g.monthlyContribution}/mo — ${monthsStr}.${notesStr}`;
  });
  return `User's savings goals:\n${lines.join("\n")}`;
}

function buildRichSystemPrompt(userData: UserData, goals: Goal[]): string {
  const engine = createFinanceEngine(userData, DEMO_AS_OF);
  const patterns = engine.getSpendingPatterns();
  const cutbacks = engine.getCutbackSuggestions();

  const parts: string[] = [];

  parts.push(
    "You are a supportive personal finance assistant for students. " +
    "Be encouraging, positive, and supportive. You are helping a student manage their finances. " +
    "Celebrate progress. Suggest improvements gently."
  );

  const goalsCtx = buildGoalsContext(goals);
  if (goalsCtx) parts.push(goalsCtx);

  // Spending patterns
  const topMerchants = patterns.topMerchantsThisMonth
    .map((m) => `${m.merchant} ($${m.total})`)
    .join(", ");
  const byCat = Object.entries(patterns.byCategoryThisMonth)
    .map(([cat, amt]) => `${cat}: $${amt}`)
    .join(", ");
  parts.push(
    `Spending patterns (${patterns.asOfMonth}): ` +
    `${patterns.transactionCountThisMonth} transactions, avg $${patterns.averageSpendPerTransactionThisMonth}/tx. ` +
    `By category: ${byCat || "none"}. ` +
    `Top merchants: ${topMerchants || "none"}. ` +
    `Prior month total (budgeted): $${patterns.totalBudgetedCategoriesPriorMonth}, this month so far: $${patterns.totalBudgetedCategoriesThisMonth}.`
  );

  // Cutback suggestions
  if (cutbacks.length > 0) {
    const bullets = cutbacks.map((c) => `• ${c.message}`).join("\n");
    parts.push(`Cutback suggestions:\n${bullets}`);
  } else {
    parts.push("No categories are currently over budget — great job!");
  }

  return parts.join("\n\n");
}

const SEARCH_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "search_web",
    description:
      "Search the web for current financial information, tips, or news relevant to the user's question",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
};

async function callSearchApi(query: string): Promise<SearchResult[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: SearchResult[] };
  return data.results ?? [];
}

function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return "No results found.";
  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`)
    .join("\n\n");
}

async function generateRichReply(
  message: string,
  draft: string,
  userData: UserData,
  goals: Goal[]
): Promise<string | null> {
  const client = openRouterClient();
  if (!client) return null;

  const useBraveSearch = Boolean(process.env.BRAVE_SEARCH_API_KEY);
  const model = resolveModel();

  const systemPrompt = buildRichSystemPrompt(userData, goals);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content:
        `User asked: ${message}\n\n` +
        `Here is a draft reply based on their financial data:\n${draft}\n\n` +
        "Refine this reply using the context above. Keep it concise and encouraging.",
    },
  ];

  const createParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    temperature: 0.4,
    max_tokens: 400,
    messages,
    ...(useBraveSearch ? { tools: [SEARCH_TOOL], tool_choice: "auto" } : {}),
  };

  const firstResponse = await client.chat.completions.create(createParams);
  const firstChoice = firstResponse.choices[0];

  // Handle tool call
  if (
    useBraveSearch &&
    firstChoice?.finish_reason === "tool_calls" &&
    firstChoice.message.tool_calls?.length
  ) {
    const toolCall = firstChoice.message.tool_calls[0];
    // Narrow to standard function tool calls (type === "function")
    if (toolCall.type === "function" && toolCall.function.name === "search_web") {
      let query = message; // fallback
      try {
        const args = JSON.parse(toolCall.function.arguments) as { query?: string };
        if (typeof args.query === "string") query = args.query;
      } catch {
        // use fallback
      }

      const searchResults = await callSearchApi(query);
      const searchContent = formatSearchResults(searchResults);

      const followUpMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...messages,
        firstChoice.message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: searchContent,
        },
      ];

      const secondResponse = await client.chat.completions.create({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages: followUpMessages,
      });

      const text = secondResponse.choices[0]?.message?.content?.trim();
      return text || null;
    }
  }

  const text = firstChoice?.message?.content?.trim();
  return text || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      message?: unknown;
      userData?: UserData;
      goals?: Goal[];
    };

    const message = typeof body.message === "string" ? body.message : "";
    if (!message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const activeUserData: UserData = body.userData ?? mockUserData;
    const activeGoals: Goal[] = body.goals ?? [];

    const engine = createFinanceEngine(activeUserData, DEMO_AS_OF);
    const routed = routeIntent(message);
    const payload = composeAssistantReply(engine, routed);
    let reply = payload.reply;

    try {
      // If we have OpenRouter available, use the rich reply path (which includes goals + patterns context).
      // Fall back to the plain formatter if that fails.
      const richReply = await generateRichReply(message, reply, activeUserData, activeGoals);
      if (richReply) {
        reply = richReply;
      } else {
        // No rich reply (e.g. no OpenRouter key); try plain formatter
        const formatted = await formatReplyWithOpenRouter(reply);
        if (formatted) reply = formatted;
      }
    } catch {
      // Optional path — still run the plain formatter as fallback
      try {
        const formatted = await formatReplyWithOpenRouter(reply);
        if (formatted) reply = formatted;
      } catch {
        /* keep original draft */
      }
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
