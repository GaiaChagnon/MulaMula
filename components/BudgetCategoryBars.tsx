import type { FinanceSnapshot } from "@/lib/financeEngine";

type Props = {
  data: FinanceSnapshot;
};

export function BudgetCategoryBars({ data }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Budget envelopes
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">Spent vs limit · {data.asOfISO.slice(0, 7)}</p>
      <ul className="mt-4 space-y-4">
        {data.categories.map((c) => {
          const pct = Math.min(100, Math.round((c.spent / Math.max(1, c.budget)) * 100));
          const over = c.spent > c.budget;
          return (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-zinc-900 dark:text-white">{c.label}</span>
                <span className={over ? "text-red-600 dark:text-red-400" : "text-zinc-500"}>
                  ${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-[width] ${
                    over ? "bg-gradient-to-r from-red-400 to-amber-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={c.spent}
                  aria-valuemin={0}
                  aria-valuemax={c.budget}
                  aria-label={`${c.label} spending ${pct} percent of budget`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
