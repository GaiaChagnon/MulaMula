import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  composeAssistantReply,
  createFinanceEngine,
  budgetRemaining,
  upcomingBillsTotal,
} from "@/lib/financeEngine";
import { publicAppUrl } from "@/lib/env";
import { DEMO_AS_OF, userData as mockUserData } from "@/lib/mockData";
import type { UserData } from "@/lib/mockData";
import { routeIntent } from "@/lib/intentRouter";
import type { Goal } from "@/lib/goals";
import { goalProgressPercent, monthsToGoal } from "@/lib/goals";
import type { SearchResult } from "@/lib/searchTool";

export const runtime = "nodejs";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const PERSONA = `You are Greta, MoneyTalkz's in-house German personal-finance advisor.
Voice:
- Blunt, confident, a little stern, a little flirty. Direct German sensibility — zero fluff.
- Sprinkle ONE OR TWO natural German interjections per reply ("Ja", "Nein", "Ach so", "Mein Schatz", "Achtung", "Also gut", "Schnell", "Gut gemacht", "Nicht so schnell"). Never translate the whole reply.
- Critique choices, not people. Teasing is fine, never cruel.

Substance — this is critical:
- Every dollar, percent, date and category you mention MUST come from the STATE block below. If the data doesn't support a number, don't state it.
- Give ACTIONABLE advice tied to the user's actual numbers. Compare envelopes vs spend. Call out specific merchants or categories that are bleeding money. Propose concrete swaps (e.g. "skip two $22 meals out this week").
- Prioritise: (1) bills due this month, (2) over-budget envelopes, (3) goal pacing, (4) forward-looking forecast.
- Tell the user the trade-off of their choice, not just whether they can afford it. "Ja, you can afford the $65 shopping trip — but that's three weeks of your Machu Picchu contribution. Your call."
- If the user asks something unanswerable from the data, say so and ask for what's missing.

Format:
- 2–4 short paragraphs OR a tight bulleted list.
- No meta-commentary, no "as an AI" disclaimers, no "here's my response".`;

const FORMAT_SYSTEM_PROMPT = `You polish finance advisor replies into Greta's voice — a blunt, confident, a-bit-stern, a-bit-flirty German advisor for MoneyTalkz.
Voice rules:
- Speak directly. Short sentences. No fluff.
- Sprinkle ONE or TWO natural German interjections per reply ("Ja", "Nein", "Ach so", "Mein Schatz", "Achtung", "Also gut"). Do not translate the whole reply.
- A little teasing is fine. Never insult the user personally; critique choices, not people.
Strict rules:
- Do not change, invent, or drop any numbers, dollar amounts, percentages, or dates from the draft.
- Do not add new financial claims or advice beyond what the draft says.
- Keep the same meaning and facts; improve clarity, flow, and tone only.
- Prefer short paragraphs; keep bullets if present.
- Max 4 short paragraphs.
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
      "X-Title": process.env.OPENROUTER_APP_TITLE ?? "MoneyTalkz",
    },
  });
}

const DEFAULT_MODEL = "moonshotai/kimi-k2.6";

function resolveModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

/** Serialize the user's full financial state into a structured text block the model can cite. */
function buildStateBlock(userData: UserData, goals: Goal[]): string {
  const engine = createFinanceEngine(userData, DEMO_AS_OF);
  const snap = engine.toSnapshot();
  const patterns = engine.getSpendingPatterns();
  const forecast = engine.forecastMonthlySpending();
  const weekly = engine.getWeeklyAllowance();
  const cutbacks = engine.getCutbackSuggestions();

  const asOf = snap.asOfISO;
  const month = asOf.slice(0, 7);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const envelopeLines = snap.categories
    .map((c) => {
      const pct = Math.round((c.spent / Math.max(1, c.budget)) * 100);
      const over = c.spent > c.budget;
      return `  - ${c.label}: spent ${fmt(c.spent)} / ${fmt(c.budget)} (${pct}%${over ? ", OVER" : ""})`;
    })
    .join("\n");

  const billsDueThisMonth = snap.upcomingBills
    .filter((b) => b.dueDate.startsWith(month))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const billLines = billsDueThisMonth
    .map((b) => `  - ${b.name}: ${fmt(b.amount)} due ${b.dueDate} (${b.category})`)
    .join("\n");

  const billsTotal = upcomingBillsTotal(snap);

  const recentTransactions = [...userData.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);
  const txLines = recentTransactions
    .map((t) => `  - ${t.date} · ${t.merchant.padEnd(18).slice(0, 18)} · ${t.category.padEnd(14).slice(0, 14)} · ${fmt(t.amount)}`)
    .join("\n");

  const goalLines =
    goals.length > 0
      ? goals
          .map((g) => {
            const pct = goalProgressPercent(g);
            const months = monthsToGoal(g);
            const monthsStr =
              months === null
                ? "no monthly contribution set"
                : months === 0
                  ? "already reached"
                  : `~${months} months at current pace`;
            return `  - ${g.name}: ${fmt(g.savedAmount)} / ${fmt(g.targetAmount)} (${pct}%), +${fmt(g.monthlyContribution)}/mo → ${monthsStr}`;
          })
          .join("\n")
      : "  (no goals set)";

  const topMerchantLines =
    patterns.topMerchantsThisMonth.length > 0
      ? patterns.topMerchantsThisMonth
          .slice(0, 5)
          .map((m) => `  - ${m.merchant}: ${fmt(m.total)} this month`)
          .join("\n")
      : "  (none)";

  const cutbackLines =
    cutbacks.length > 0
      ? cutbacks.slice(0, 5).map((c) => `  - ${c.message}`).join("\n")
      : "  (no envelopes over budget)";

  return `=== MONEYTALKZ STATE (as of ${asOf}) ===
User: ${snap.displayName}
Currency: ${snap.currency}

CORE NUMBERS
- Monthly income: ${fmt(snap.income)}
- Current balance: ${fmt(snap.balance)}
- This month's envelope cap: ${fmt(snap.monthlyBudget)}
- Spent in budgeted envelopes MTD: ${fmt(snap.monthToDateSpent)}  (${Math.round((snap.monthToDateSpent / Math.max(1, snap.monthlyBudget)) * 100)}% of cap)
- Envelope headroom remaining this month: ${fmt(budgetRemaining(snap))}
- Available balance after paying listed bills: ${fmt(engine.getAvailableBalance())}

ENVELOPES (MTD)
${envelopeLines || "  (none set)"}

BILLS DUE IN ${month} (total ${fmt(billsTotal)})
${billLines || "  (none due this month)"}

WEEKLY OUTLOOK (${weekly.weeksRemainingInMonth} week(s) left in ${month})
- Envelope-pacing guide: ${fmt(weekly.weeklyFromEnvelopes)}/week
- Cash-liquidity guide: ${fmt(weekly.weeklyFromLiquidity)}/week
- Conservative recommendation: ${fmt(weekly.recommendedWeekly)}/week

MONTH-END FORECAST (at current pace)
- Day ${forecast.dayOfMonth} of ${forecast.daysInMonth}
- Projected month-end envelope spend: ${fmt(forecast.forecastMonthEndBudgetedSpend)}
- Envelope cap: ${fmt(forecast.envelopeCap)}
- Projected over cap by: ${forecast.projectedOverCapBy > 0 ? fmt(forecast.projectedOverCapBy) : "—"}

GOALS
${goalLines}

SPENDING PATTERNS (this month)
- Transactions: ${patterns.transactionCountThisMonth}
- Average per transaction: $${patterns.averageSpendPerTransactionThisMonth.toFixed(2)}
- Prior month total in budgeted cats: ${fmt(patterns.totalBudgetedCategoriesPriorMonth)}
- This month so far in budgeted cats: ${fmt(patterns.totalBudgetedCategoriesThisMonth)}

TOP MERCHANTS THIS MONTH
${topMerchantLines}

RECENT TRANSACTIONS (last 30, newest first)
${txLines || "  (none)"}

ENGINE CUTBACK FLAGS
${cutbackLines}
=== END STATE ===`;
}

async function formatReplyWithOpenRouter(draft: string): Promise<string | null> {
  const client = openRouterClient();
  if (!client) return null;

  const model = resolveModel();

  const res = await client.chat.completions.create({
    model,
    temperature: 0.25,
    max_tokens: 320,
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
  return results.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`).join("\n\n");
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

  const stateBlock = buildStateBlock(userData, goals);
  const systemPrompt = `${PERSONA}\n\n${stateBlock}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content:
        `User message: ${message}\n\n` +
        `A deterministic draft from our finance engine (you may use, improve, or replace it — but stay grounded in STATE):\n<draft>\n${draft}\n</draft>\n\n` +
        "Answer the user directly using the STATE block above. Pull specific numbers, categories, merchants and dates. Give an actionable recommendation with trade-offs. Respond as Greta.",
    },
  ];

  const createParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    temperature: 0.45,
    max_tokens: 480,
    messages,
    ...(useBraveSearch ? { tools: [SEARCH_TOOL], tool_choice: "auto" } : {}),
  };

  const firstResponse = await client.chat.completions.create(createParams);
  const firstChoice = firstResponse.choices[0];

  if (
    useBraveSearch &&
    firstChoice?.finish_reason === "tool_calls" &&
    firstChoice.message.tool_calls?.length
  ) {
    const toolCall = firstChoice.message.tool_calls[0];
    if (toolCall.type === "function" && toolCall.function.name === "search_web") {
      let query = message;
      try {
        const args = JSON.parse(toolCall.function.arguments) as { query?: string };
        if (typeof args.query === "string") query = args.query;
      } catch {
        /* use fallback */
      }

      const searchResults = await callSearchApi(query);
      const searchContent = formatSearchResults(searchResults);

      const followUpMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...messages,
        firstChoice.message,
        { role: "tool", tool_call_id: toolCall.id, content: searchContent },
      ];

      const secondResponse = await client.chat.completions.create({
        model,
        temperature: 0.45,
        max_tokens: 480,
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
    const body = (await req.json()) as {
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
      const richReply = await generateRichReply(message, reply, activeUserData, activeGoals);
      if (richReply) {
        reply = richReply;
      } else {
        const formatted = await formatReplyWithOpenRouter(reply);
        if (formatted) reply = formatted;
      }
    } catch {
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
