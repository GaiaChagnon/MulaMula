import type { FinanceSnapshot } from "@/lib/financeEngine";

type Props = {
  data: FinanceSnapshot;
};

export function BudgetProgress({ data }: Props) {
  const total = data.monthlyBudget;
  const spent = data.monthToDateSpent;
  const pct = Math.min(100, Math.round((spent / Math.max(1, total)) * 100));

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Spending envelopes
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">{pct}% used</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          {data.asOfISO.slice(0, 7)}
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        ${spent.toLocaleString()} in budgeted categories · ${total.toLocaleString()} envelope cap
      </p>
    </div>
  );
}
