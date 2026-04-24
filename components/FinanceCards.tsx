"use client";

import { motion } from "framer-motion";
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

  const cards = [
    {
      key: "envelopes",
      label: "Envelopes (MTD)",
      value: money(data.monthToDateSpent, data.currency),
      sub: `of ${money(data.monthlyBudget, data.currency)} budgeted · as of ${data.asOfISO}`,
      gradient: "from-white to-[#ecfeff]",
      valueClass: "text-[#0f172a]",
      bar: (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e0f2fe]">
          <motion.div
            className={`h-full rounded-full ${
              over
                ? "bg-gradient-to-r from-rose-400 to-amber-400"
                : "bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.round(pace * 100))}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ),
    },
    {
      key: "headroom",
      label: "Envelope headroom",
      value: money(left, data.currency),
      sub: `Income ${money(data.income, data.currency)}/mo`,
      gradient: "from-white to-[#f0f9ff]",
      valueClass: left > 0 ? "text-[#0891b2]" : "text-rose-500",
    },
    {
      key: "balance",
      label: "Balance",
      value: money(data.balance, data.currency),
      sub: `Upcoming bills ~${money(bills, data.currency)}`,
      gradient: "from-white to-[#f0f9ff]",
      valueClass: "text-[#0f172a]",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`rounded-2xl border border-[#e0f2fe] bg-gradient-to-br ${c.gradient} p-5 shadow-sm transition-shadow hover:shadow-md`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
            {c.label}
          </p>
          <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${c.valueClass}`}>
            {c.value}
          </p>
          <p className="mt-1 text-xs text-[#64748b]">{c.sub}</p>
          {c.bar}
        </motion.div>
      ))}
    </div>
  );
}
