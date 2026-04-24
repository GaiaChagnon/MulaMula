import type { Bill, Jar, UserData } from "./mockData";
import { CATEGORY_COLORS } from "./mockData";
import type { RoutedIntent } from "./intentRouter";

export type CategoryRow = {
  id: string;
  label: string;
  budget: number;
  spent: number;
  color: string;
};

export type FinanceSnapshot = {
  displayName: string;
  currency: string;
  monthlyBudget: number;
  monthToDateSpent: number;
  balance: number;
  income: number;
  typicalMealOut: number;
  categories: CategoryRow[];
  jars: Jar[];
  upcomingBills: Bill[];
  monthSpendByCategory: Record<string, number>;
  asOfISO: string;
};

export type SpendingPeriod = {
  /** Inclusive YYYY-MM-DD */
  start: string;
  /** Inclusive YYYY-MM-DD */
  end: string;
};

export type BudgetStatus = {
  category: string;
  label: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  overBudget: boolean;
};

export type WeeklyAllowance = {
  weeksRemainingInMonth: number;
  envelopeRemaining: number;
  /** Spread envelope room across remaining weeks. */
  weeklyFromEnvelopes: number;
  /** Spread post-bill liquidity across remaining weeks. */
  weeklyFromLiquidity: number;
  /** Conservative weekly spending guide (min of the two). */
  recommendedWeekly: number;
};

export type GoalPlan = {
  name: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  monthsLeft: number;
  gapToTarget: number;
  progressPercent: number;
  /** Months to close gap at current monthlyContribution (ceil). */
  monthsToTargetAtContribution: number | null;
};

export type SpendingPatterns = {
  asOfMonth: string;
  transactionCountThisMonth: number;
  byCategoryThisMonth: Record<string, number>;
  topMerchantsThisMonth: { merchant: string; total: number }[];
  priorMonth: string;
  totalBudgetedCategoriesPriorMonth: number;
  totalBudgetedCategoriesThisMonth: number;
  averageSpendPerTransactionThisMonth: number;
};

export type MonthlyForecast = {
  dayOfMonth: number;
  daysInMonth: number;
  spentBudgetedCategoriesMtd: number;
  forecastMonthEndBudgetedSpend: number;
  envelopeCap: number;
  projectedOverCapBy: number;
};

export type CompareSpendingResult = {
  periodA: { start: string; end: string; total: number; byCategory: Record<string, number> };
  periodB: { start: string; end: string; total: number; byCategory: Record<string, number> };
  deltaTotal: number;
  deltaByCategory: Record<string, number>;
};

export type CutbackSuggestion = {
  category: string;
  label: string;
  spent: number;
  limit: number;
  overBy: number;
  message: string;
};

export type CanAffordResult = {
  affordable: boolean;
  reason: string;
  balanceAfterPurchase: number;
  /** balance after purchase minus bills due this snapshot month */
  afterPurchaseAndBills: number;
  availableBeforePurchase: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function labelFromCategoryId(id: string): string {
  return id
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function transactionInMonth(dateISO: string, asOf: Date): boolean {
  const prefix = `${asOf.getFullYear()}-${pad2(asOf.getMonth() + 1)}`;
  return dateISO.startsWith(prefix);
}

function transactionInInclusiveRange(dateISO: string, start: string, end: string): boolean {
  return dateISO >= start && dateISO <= end;
}

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function billDueInCalendarMonth(bill: Bill, asOf: Date): boolean {
  const d = new Date(`${bill.dueDate}T12:00:00`);
  return d.getFullYear() === asOf.getFullYear() && d.getMonth() === asOf.getMonth();
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function weeksRemainingInMonth(reference: Date): number {
  const last = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  const daysLeft = Math.max(1, last.getDate() - reference.getDate() + 1);
  return Math.max(1, Math.ceil(daysLeft / 7));
}

function normalizeCategoryKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

function sumSpendByCategoryInMonth(data: UserData, asOf: Date): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of data.transactions) {
    if (!transactionInMonth(t.date, asOf)) continue;
    out[t.category] = (out[t.category] ?? 0) + t.amount;
  }
  return out;
}

function sumSpendInRange(data: UserData, start: string, end: string): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const t of data.transactions) {
    if (!transactionInInclusiveRange(t.date, start, end)) continue;
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    total += t.amount;
  }
  return { total, byCategory };
}

function priorMonthDate(asOf: Date): Date {
  return new Date(asOf.getFullYear(), asOf.getMonth() - 1, 15, 12, 0, 0, 0);
}

export type FinanceEngine = {
  getAvailableBalance: () => number;
  canAfford: (amount: number) => CanAffordResult;
  getSpendingByCategory: (category: string) => { category: string; total: number; transactionCount: number; month: string };
  getBudgetStatus: (category: string) => BudgetStatus | null;
  getWeeklyAllowance: () => WeeklyAllowance;
  getGoalPlan: (goalName: string) => GoalPlan | null;
  getSpendingPatterns: () => SpendingPatterns;
  forecastMonthlySpending: () => MonthlyForecast;
  compareSpending: (periodA: SpendingPeriod, periodB: SpendingPeriod) => CompareSpendingResult;
  getCutbackSuggestions: () => CutbackSuggestion[];
  toSnapshot: () => FinanceSnapshot;
};

export function createFinanceEngine(userData: UserData, asOf: Date): FinanceEngine {
  const asOfMonth = monthKeyFromDate(asOf);
  const monthSpendByCategory = sumSpendByCategoryInMonth(userData, asOf);
  const billsThisMonth = userData.upcomingBills.filter((b) => billDueInCalendarMonth(b, asOf));
  const billsThisMonthSum = billsThisMonth.reduce((s, b) => s + b.amount, 0);
  const monthlyEnvelopeCap = userData.budgets.reduce((s, b) => s + b.limit, 0);
  const spentInEnvelopesMtd = userData.budgets.reduce((s, b) => s + (monthSpendByCategory[b.category] ?? 0), 0);
  const envelopeRemaining = Math.max(0, monthlyEnvelopeCap - spentInEnvelopesMtd);
  const weeksRem = weeksRemainingInMonth(asOf);

  function getAvailableBalance(): number {
    return Math.max(0, userData.balance - billsThisMonthSum);
  }

  function canAfford(amount: number): CanAffordResult {
    const availableBeforePurchase = getAvailableBalance();
    const balanceAfterPurchase = userData.balance - amount;
    const afterPurchaseAndBills = balanceAfterPurchase - billsThisMonthSum;
    const affordable = amount >= 0 && afterPurchaseAndBills >= 0;
    let reason: string;
    if (amount < 0) {
      reason = "Amount must be non-negative.";
    } else if (!affordable) {
      reason = `After this purchase you would have ${Math.round(Math.max(0, balanceAfterPurchase))} in balance but need ${Math.round(billsThisMonthSum)} for bills due this month.`;
    } else if (afterPurchaseAndBills < 50) {
      reason = `Affordable, but only ~$${Math.round(afterPurchaseAndBills)} left after scheduled bills—tight buffer.`;
    } else {
      reason = `Fits: ~$${Math.round(afterPurchaseAndBills)} left after paying this month’s listed bills from balance.`;
    }
    return {
      affordable,
      reason,
      balanceAfterPurchase,
      afterPurchaseAndBills,
      availableBeforePurchase,
    };
  }

  function getSpendingByCategory(category: string) {
    const key = normalizeCategoryKey(category);
    let count = 0;
    let total = 0;
    for (const t of userData.transactions) {
      if (!transactionInMonth(t.date, asOf)) continue;
      if (t.category !== key) continue;
      total += t.amount;
      count += 1;
    }
    return { category: key, total, transactionCount: count, month: asOfMonth };
  }

  function getBudgetStatus(category: string): BudgetStatus | null {
    const key = normalizeCategoryKey(category);
    const b = userData.budgets.find((x) => x.category === key);
    if (!b) return null;
    const spent = monthSpendByCategory[key] ?? 0;
    const remaining = b.limit - spent;
    const percentUsed = Math.round((spent / Math.max(1, b.limit)) * 100);
    return {
      category: key,
      label: labelFromCategoryId(key),
      limit: b.limit,
      spent,
      remaining,
      percentUsed,
      overBudget: spent > b.limit,
    };
  }

  function getWeeklyAllowance(): WeeklyAllowance {
    const avail = getAvailableBalance();
    const weeklyFromEnvelopes = Math.round(envelopeRemaining / weeksRem);
    const weeklyFromLiquidity = Math.round(avail / weeksRem);
    const recommendedWeekly = Math.max(0, Math.min(weeklyFromEnvelopes, weeklyFromLiquidity));
    return {
      weeksRemainingInMonth: weeksRem,
      envelopeRemaining,
      weeklyFromEnvelopes,
      weeklyFromLiquidity,
      recommendedWeekly,
    };
  }

  function getGoalPlan(goalName: string): GoalPlan | null {
    const q = goalName.trim().toLowerCase();
    if (!q) return null;
    const jar = userData.jars.find((j) => j.name.toLowerCase().includes(q) || q.includes(j.name.toLowerCase()));
    if (!jar) return null;
    const gapToTarget = Math.max(0, jar.target - jar.saved);
    const progressPercent = Math.min(100, Math.round((jar.saved / Math.max(1, jar.target)) * 100));
    const monthsToTargetAtContribution =
      jar.monthlyContribution > 0 ? Math.ceil(gapToTarget / jar.monthlyContribution) : null;
    return {
      name: jar.name,
      target: jar.target,
      saved: jar.saved,
      monthlyContribution: jar.monthlyContribution,
      monthsLeft: jar.monthsLeft,
      gapToTarget,
      progressPercent,
      monthsToTargetAtContribution,
    };
  }

  function getSpendingPatterns(): SpendingPatterns {
    const prior = priorMonthDate(asOf);
    const priorSpend = sumSpendByCategoryInMonth(userData, prior);
    let totalPriorBudgeted = 0;
    for (const b of userData.budgets) {
      totalPriorBudgeted += priorSpend[b.category] ?? 0;
    }

    const merchants: Record<string, number> = {};
    let txCount = 0;
    let totalAllThisMonth = 0;
    for (const t of userData.transactions) {
      if (!transactionInMonth(t.date, asOf)) continue;
      txCount += 1;
      totalAllThisMonth += t.amount;
      merchants[t.merchant] = (merchants[t.merchant] ?? 0) + t.amount;
    }
    const topMerchantsThisMonth = Object.entries(merchants)
      .map(([merchant, total]) => ({ merchant, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      asOfMonth: asOfMonth,
      transactionCountThisMonth: txCount,
      byCategoryThisMonth: { ...monthSpendByCategory },
      topMerchantsThisMonth,
      priorMonth: monthKeyFromDate(prior),
      totalBudgetedCategoriesPriorMonth: totalPriorBudgeted,
      totalBudgetedCategoriesThisMonth: spentInEnvelopesMtd,
      averageSpendPerTransactionThisMonth:
        txCount > 0 ? Math.round((totalAllThisMonth / txCount) * 100) / 100 : 0,
    };
  }

  function forecastMonthlySpending(): MonthlyForecast {
    const dim = daysInMonth(asOf);
    const day = asOf.getDate();
    const pace = spentInEnvelopesMtd / Math.max(1, day);
    const forecastMonthEndBudgetedSpend = Math.round(pace * dim);
    const projectedOverCapBy = forecastMonthEndBudgetedSpend - monthlyEnvelopeCap;
    return {
      dayOfMonth: day,
      daysInMonth: dim,
      spentBudgetedCategoriesMtd: spentInEnvelopesMtd,
      forecastMonthEndBudgetedSpend,
      envelopeCap: monthlyEnvelopeCap,
      projectedOverCapBy,
    };
  }

  function compareSpending(periodA: SpendingPeriod, periodB: SpendingPeriod): CompareSpendingResult {
    const a = sumSpendInRange(userData, periodA.start, periodA.end);
    const b = sumSpendInRange(userData, periodB.start, periodB.end);
    const cats = new Set([...Object.keys(a.byCategory), ...Object.keys(b.byCategory)]);
    const deltaByCategory: Record<string, number> = {};
    for (const c of cats) {
      deltaByCategory[c] = (b.byCategory[c] ?? 0) - (a.byCategory[c] ?? 0);
    }
    return {
      periodA: { ...periodA, total: a.total, byCategory: a.byCategory },
      periodB: { ...periodB, total: b.total, byCategory: b.byCategory },
      deltaTotal: b.total - a.total,
      deltaByCategory,
    };
  }

  function getCutbackSuggestions(): CutbackSuggestion[] {
    const out: CutbackSuggestion[] = [];
    for (const b of userData.budgets) {
      const spent = monthSpendByCategory[b.category] ?? 0;
      const overBy = spent - b.limit;
      const label = labelFromCategoryId(b.category);
      if (overBy > 0) {
        out.push({
          category: b.category,
          label,
          spent,
          limit: b.limit,
          overBy,
          message: `${label} is $${overBy} over the ${b.limit} envelope—trim ~$${overBy} this month or move ${label} spend to next month.`,
        });
      } else if (spent >= b.limit * 0.9) {
        const headroom = Math.round(b.limit - spent);
        out.push({
          category: b.category,
          label,
          spent,
          limit: b.limit,
          overBy: 0,
          message: `${label} is at ${Math.round((spent / b.limit) * 100)}% of envelope—only ~$${headroom} headroom left.`,
        });
      }
    }
    return out.sort(
      (x, y) =>
        y.overBy - x.overBy ||
        y.spent / Math.max(1, y.limit) - x.spent / Math.max(1, x.limit)
    );
  }

  function toSnapshot(): FinanceSnapshot {
    const categories: CategoryRow[] = userData.budgets.map((b) => ({
      id: b.category,
      label: labelFromCategoryId(b.category),
      budget: b.limit,
      spent: monthSpendByCategory[b.category] ?? 0,
      color: CATEGORY_COLORS[b.category] ?? "#64748b",
    }));

    return {
      displayName: "Alex",
      currency: "USD",
      monthlyBudget: monthlyEnvelopeCap,
      monthToDateSpent: spentInEnvelopesMtd,
      balance: userData.balance,
      income: userData.income,
      typicalMealOut: 22,
      categories,
      jars: userData.jars,
      upcomingBills: userData.upcomingBills,
      monthSpendByCategory: { ...monthSpendByCategory },
      asOfISO: asOf.toISOString().slice(0, 10),
    };
  }

  return {
    getAvailableBalance,
    canAfford,
    getSpendingByCategory,
    getBudgetStatus,
    getWeeklyAllowance,
    getGoalPlan,
    getSpendingPatterns,
    forecastMonthlySpending,
    compareSpending,
    getCutbackSuggestions,
    toSnapshot,
  };
}

export function deriveFinanceSnapshot(data: UserData, asOf: Date = new Date()): FinanceSnapshot {
  return createFinanceEngine(data, asOf).toSnapshot();
}

export function budgetRemaining(data: FinanceSnapshot): number {
  return Math.max(0, data.monthlyBudget - data.monthToDateSpent);
}

export function categoryByLabel(data: FinanceSnapshot, needle: string): CategoryRow | undefined {
  const q = needle.toLowerCase().replace(/\s+/g, "_");
  return data.categories.find(
    (c) =>
      c.label.toLowerCase().includes(needle.toLowerCase()) ||
      c.id === q ||
      c.id === needle.toLowerCase()
  );
}

export function spendInCategory(data: FinanceSnapshot, needle: string): number | null {
  const normalized = needle.toLowerCase().replace(/\s+/g, "_");
  const row = categoryByLabel(data, needle);
  if (row) return row.spent;
  if (data.monthSpendByCategory[normalized] != null) return data.monthSpendByCategory[normalized];
  return null;
}

export type WeeklyOutlook = {
  weeksRemainingInMonth: number;
  budgetRemaining: number;
  suggestedWeeklyCap: number;
};

export function weeklyOutlook(data: FinanceSnapshot): WeeklyOutlook {
  const asOf = new Date(`${data.asOfISO}T12:00:00`);
  const remaining = budgetRemaining(data);
  const w = weeksRemainingInMonth(asOf);
  return {
    weeksRemainingInMonth: w,
    budgetRemaining: remaining,
    suggestedWeeklyCap: Math.round(remaining / w),
  };
}

export function upcomingBillsTotal(data: FinanceSnapshot): number {
  return data.upcomingBills.reduce((s, b) => s + b.amount, 0);
}

export type AssistantPayload = {
  reply: string;
  intent: RoutedIntent["intent"];
  routed: RoutedIntent;
};

export function composeAssistantReply(engine: FinanceEngine, routed: RoutedIntent): AssistantPayload {
  const snap = engine.toSnapshot();
  const name = snap.displayName;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: snap.currency }).format(n);
  const billsSoon = snap.upcomingBills.reduce((s, b) => s + b.amount, 0);

  switch (routed.intent) {
    case "afford_meal": {
      const price = routed.amount ?? snap.typicalMealOut;
      const meal = engine.canAfford(price);
      const headroom = fmt(budgetRemaining(snap));
      const reply = meal.affordable
        ? `${name}, a ~${fmt(price)} meal looks workable. ${meal.reason} Envelope headroom is about ${headroom}; listed bills this month total ~${fmt(billsSoon)}.`
        : `${name}, I’d be cautious tonight. ${meal.reason} Cooking or a ${fmt(Math.min(price, 12))} meal keeps cash for bills.`;
      return { reply, intent: routed.intent, routed };
    }
    case "category_spend": {
      const hint = routed.category ?? "groceries";
      const row = engine.getBudgetStatus(hint);
      const spend = engine.getSpendingByCategory(hint);
      const reply = row
        ? `You’ve spent ${fmt(row.spent)} on ${row.label} this month (envelope ${fmt(row.limit)}).`
        : spend.total > 0
          ? `You’ve spent ${fmt(spend.total)} on ${labelFromCategoryId(spend.category)} this month—no envelope limit set for that category.`
          : `I couldn’t find spend for “${hint}” in ${snap.asOfISO.slice(0, 7)}. Try groceries, eating_out, shopping, or entertainment.`;
      return { reply, intent: routed.intent, routed };
    }
    case "budget_left": {
      const left = budgetRemaining(snap);
      const avail = engine.getAvailableBalance();
      const reply = `You have about ${fmt(left)} left across spending envelopes (${fmt(snap.monthToDateSpent)} of ${fmt(snap.monthlyBudget)}). Cash after this month’s listed bills: ~${fmt(avail)}. Balance: ${fmt(snap.balance)}.`;
      return { reply, intent: routed.intent, routed };
    }
    case "weekly_safe_spend": {
      const w = engine.getWeeklyAllowance();
      const reply = `With ~${w.weeksRemainingInMonth} week(s) left, envelope pacing suggests ~${fmt(w.weeklyFromEnvelopes)}/week; liquidity after bills ~${fmt(w.weeklyFromLiquidity)}/week. A conservative guide: ~${fmt(w.recommendedWeekly)}/week.`;
      return { reply, intent: routed.intent, routed };
    }
    case "purchase_check": {
      const price = routed.amount ?? 150;
      const check = engine.canAfford(price);
      const reply = `On a ${fmt(price)} purchase: ${check.affordable ? "Leaning yes" : "Leaning no"}—${check.reason} Balance after: ~${fmt(Math.max(0, check.balanceAfterPurchase))}.`;
      return { reply, intent: routed.intent, routed };
    }
    case "cut_back": {
      const ideas = engine.getCutbackSuggestions().slice(0, 5);
      const bullets = ideas.map((i) => `• ${i.message}`);
      const reply =
        bullets.length > 0
          ? `Suggestions:\n${bullets.join("\n")}`
          : `No envelope is over cap right now—nice. Keep padding entertainment/shopping if bills are tight.`;
      return { reply, intent: routed.intent, routed };
    }
    case "month_projection": {
      const f = engine.forecastMonthlySpending();
      const delta = f.projectedOverCapBy;
      const reply =
        delta <= 0
          ? `At your current pace in budgeted categories, month-end looks ~${fmt(f.forecastMonthEndBudgetedSpend)}—under the ${fmt(f.envelopeCap)} envelope total.`
          : `At your current pace, budgeted spend might land ~${fmt(f.forecastMonthEndBudgetedSpend)}—about ${fmt(delta)} over your ${fmt(f.envelopeCap)} envelope cap.`;
      return { reply, intent: routed.intent, routed };
    }
    default: {
      const left = budgetRemaining(snap);
      const reply = `Demo assistant here, ${name}. Try budget left, weekly spend, groceries totals, or a purchase check—${fmt(left)} remains in envelopes for ${snap.asOfISO.slice(0, 7)}.`;
      return { reply, intent: "general", routed };
    }
  }
}
