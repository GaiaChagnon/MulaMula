"use client";

import { motion } from "framer-motion";
import type { FinanceSnapshot } from "@/lib/financeEngine";

type Props = {
  data: FinanceSnapshot;
};

export function BudgetCategoryBars({ data }: Props) {
  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
        Budget envelopes
      </p>
      <p className="text-xs text-[#94a3b8]">Spent vs limit &middot; {data.asOfISO.slice(0, 7)}</p>
      <ul className="mt-4 space-y-4">
        {data.categories.map((c, i) => {
          const pct = Math.min(100, Math.round((c.spent / Math.max(1, c.budget)) * 100));
          const over = c.spent > c.budget;
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-[#0f172a]">{c.label}</span>
                <span className={`tabular-nums ${over ? "text-rose-600" : "text-[#64748b]"}`}>
                  ${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#e0f2fe]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  className={`h-full rounded-full ${
                    over
                      ? "bg-gradient-to-r from-rose-400 to-amber-400"
                      : "bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"
                  } group-hover:brightness-110 group-hover:shadow-[0_0_0_2px_rgba(6,182,212,0.15)]`}
                  role="progressbar"
                  aria-valuenow={c.spent}
                  aria-valuemin={0}
                  aria-valuemax={c.budget}
                  aria-label={`${c.label} spending ${pct} percent of budget`}
                />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
