export type Intent =
  | "afford_meal"
  | "category_spend"
  | "budget_left"
  | "weekly_safe_spend"
  | "purchase_check"
  | "cut_back"
  | "month_projection"
  | "general";

export type RoutedIntent = {
  intent: Intent;
  /** e.g. groceries */
  category?: string;
  /** parsed dollar amount if any */
  amount?: number;
};

const MEAL_RE = /dinner|lunch|eat out|takeout|restaurant|meal|tonight/i;
const GROCERY_RE = /grocery|groceries|food store|supermarket/i;
const BUDGET_LEFT_RE = /budget.*left|left.*budget|how much.*left|remaining budget/i;
const WEEK_RE = /this week|per week|weekly|week's|weeks/i;
const BUY_RE = /should i buy|can i buy|worth it|afford.*\$/i;
const CUT_RE = /cut back|save more|trim|reduce spending|where can i/i;
const MONTH_PROJ_RE = /this month|month spend|end of month|project|forecast/i;

function extractDollars(text: string): number | undefined {
  // Prefer $-prefixed amounts
  const dollar = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (dollar) return parseFloat(dollar[1].replace(/,/g, ""));

  // Bare amounts with a currency-ish keyword or purchase context ("3000 euros", "for 3000")
  const kw = text.match(/\b([\d,]+(?:\.\d{1,2})?)\s*(?:usd|eur|euros?|dollars?|bucks)\b/i);
  if (kw) return parseFloat(kw[1].replace(/,/g, ""));

  const forAmount = text.match(/\bfor\s+([\d,]{2,}(?:\.\d{1,2})?)\b/i);
  if (forAmount) return parseFloat(forAmount[1].replace(/,/g, ""));

  // Last resort: any standalone number ≥ 10 (skip trivial ones like "3 times")
  const bare = text.match(/\b([\d]{2,}[\d,]*(?:\.\d{1,2})?)\b/);
  if (bare) {
    const v = parseFloat(bare[1].replace(/,/g, ""));
    if (v >= 10) return v;
  }
  return undefined;
}

function extractCategoryHint(text: string): string | undefined {
  const t = text.toLowerCase();
  if (GROCERY_RE.test(t)) return "groceries";
  if (/transport|uber|bus|gas|metro|taxi/i.test(t)) return "transport";
  if (/entertain|stream|spotify|netflix|cinema|club|concert|fun/i.test(t)) return "entertainment";
  if (/dining|restaurant|takeout|eating out|eat out|uber eats/i.test(t)) return "eating_out";
  if (/shop|zara|amazon|clothes|retail/i.test(t)) return "shopping";
  if (/school|book|supplies/i.test(t)) return "school";
  return undefined;
}

export function routeIntent(raw: string): RoutedIntent {
  const text = raw.trim();
  const amount = extractDollars(text);
  const category = extractCategoryHint(text);

  if (CUT_RE.test(text)) return { intent: "cut_back" };
  if (MONTH_PROJ_RE.test(text)) return { intent: "month_projection" };
  if (BUDGET_LEFT_RE.test(text)) return { intent: "budget_left" };
  if (WEEK_RE.test(text) && /spend|afford|much can|how much/i.test(text)) {
    return { intent: "weekly_safe_spend" };
  }
  // Purchase check — fires on any "buy/purchase/get/spend on" + amount combination
  if (/\b(buy|purchase|pay|spend|get|grab|afford)\b/i.test(text) && amount != null) {
    return { intent: "purchase_check", amount };
  }
  if ((BUY_RE.test(text) || /\$\d/.test(text)) && /buy|jacket|item|purchase|worth/i.test(text)) {
    return { intent: "purchase_check", amount: amount ?? 150 };
  }
  if (MEAL_RE.test(text) && /afford|can i|ok to|should i/i.test(text)) {
    return { intent: "afford_meal", amount: amount };
  }
  if (GROCERY_RE.test(text) || /how much did i spend on/i.test(text)) {
    return { intent: "category_spend", category: category ?? "groceries" };
  }
  if (/spend on\s+(\w+)/i.test(text)) {
    const m = text.match(/spend on\s+([\w\s]+)/i);
    return { intent: "category_spend", category: m?.[1]?.trim().split(/\s+/)[0] };
  }
  if (/budget/i.test(text) && /left|remaining/i.test(text)) return { intent: "budget_left" };
  if (/afford/i.test(text) && amount != null) return { intent: "purchase_check", amount };
  if (/afford/i.test(text) && MEAL_RE.test(text)) return { intent: "afford_meal", amount };

  return { intent: "general", category, amount };
}
