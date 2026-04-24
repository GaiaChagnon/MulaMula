import type { FinanceSnapshot } from "@/lib/financeEngine";

type Props = {
  data: FinanceSnapshot;
};

export function BudgetProgress({ data }: Props) {
  const total = data.monthlyBudget;
  const spent = data.monthToDateSpent;
  const pct = Math.min(100, Math.round((spent / Math.max(1, total)) * 100));
  const over = spent > total;

  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
            Spending envelopes
          </p>
          <p className={`text-lg font-bold tabular-nums ${over ? "text-rose-600" : "text-[#0f172a]"}`}>
            {pct}% used
          </p>
        </div>
        <span className="rounded-full border border-[#e0f2fe] bg-[#f0f9ff] px-3 py-1 text-xs font-medium text-[#0891b2]">
          {data.asOfISO.slice(0, 7)}
        </span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e0f2fe]">
        <div
          className={`h-full rounded-full ${over ? "bg-gradient-to-r from-rose-400 to-amber-400" : "bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[#64748b] tabular-nums">
        ${spent.toLocaleString()} in budgeted categories &middot; ${total.toLocaleString()} envelope cap
      </p>
    </div>
  );
}
