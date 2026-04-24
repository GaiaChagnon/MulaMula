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
  const over = data.monthToDateSpent > data.monthlyBudget;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Envelopes MTD */}
      <div className="rounded-2xl border border-[#e0f2fe] bg-gradient-to-br from-white to-[#ecfeff] p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
          Envelopes (MTD)
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-[#0f172a] tabular-nums">
          {money(data.monthToDateSpent, data.currency)}
        </p>
        <p className="mt-1 text-xs text-[#64748b]">
          of {money(data.monthlyBudget, data.currency)} budgeted &middot; as of {data.asOfISO}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e0f2fe]">
          <div
            className={`h-full rounded-full transition-all ${over ? "bg-gradient-to-r from-rose-400 to-amber-400" : "bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"}`}
            style={{ width: `${Math.min(100, Math.round(pace * 100))}%` }}
          />
        </div>
      </div>

      {/* Envelope headroom */}
      <div className="rounded-2xl border border-[#e0f2fe] bg-gradient-to-br from-white to-[#f0f9ff] p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
          Envelope headroom
        </p>
        <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${left > 0 ? "text-[#0891b2]" : "text-rose-500"}`}>
          {money(left, data.currency)}
        </p>
        <p className="mt-1 text-xs text-[#64748b]">Income {money(data.income, data.currency)}/mo</p>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border border-[#e0f2fe] bg-gradient-to-br from-white to-[#f0f9ff] p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">Balance</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-[#0f172a] tabular-nums">
          {money(data.balance, data.currency)}
        </p>
        <p className="mt-1 text-xs text-[#64748b]">Upcoming bills ~{money(bills, data.currency)}</p>
      </div>
    </div>
  );
}
