import type { FinanceSnapshot } from "@/lib/financeEngine";
import { budgetRemaining, upcomingBillsTotal } from "@/lib/financeEngine";

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

type Props = {
  data: FinanceSnapshot;
};

export function FinanceCards({ data }: Props) {
  const left = budgetRemaining(data);
  const pace = data.monthToDateSpent / Math.max(1, data.monthlyBudget);
  const bills = upcomingBillsTotal(data);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-emerald-50/80 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-emerald-950/30">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Envelopes (MTD)
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {money(data.monthToDateSpent, data.currency)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          of {money(data.monthlyBudget, data.currency)} budgeted · as of {data.asOfISO}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.round(pace * 100))}%` }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-sky-50/80 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-sky-950/25">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Envelope headroom
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
          {money(left, data.currency)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Income (mock) {money(data.income, data.currency)}/mo</p>
      </div>
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-amber-50/70 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-amber-950/20">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Balance</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {money(data.balance, data.currency)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Upcoming bills ~{money(bills, data.currency)}</p>
      </div>
    </div>
  );
}
