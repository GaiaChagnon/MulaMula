"use client";

import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  income: number;
  balance: number;
  budgets: Record<string, number>;
  fields: { key: string; label: string }[];
};

function DonutChart({ segments, total }: { segments: { key: string; value: number; color: string }[]; total: number }) {
  const size = 176;
  const r = 72;
  const stroke = 20;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f9ff" strokeWidth={stroke} />
        {total > 0 &&
          segments.map((seg) => {
            const frac = seg.value / total;
            if (frac <= 0) return null;
            const dash = frac * c;
            const gap = c - dash;
            const circle = (
              <motion.circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                initial={false}
                animate={{ strokeDasharray: `${dash} ${gap}`, strokeDashoffset: -offset }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              />
            );
            offset += dash;
            return circle;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-medium uppercase tracking-widest text-[#64748b]">Allocated</span>
        <span className="mt-0.5 text-2xl font-bold text-[#0f172a] tabular-nums">
          ${Math.round(total).toLocaleString()}
        </span>
        <span className="text-[11px] text-[#94a3b8]">per month</span>
      </div>
    </div>
  );
}

export function BudgetSidebar({ income, balance, budgets, fields }: Props) {
  const total = fields.reduce((s, f) => s + (budgets[f.key] ?? 0), 0);
  const buffer = Math.max(0, income - total);
  const overspend = Math.max(0, total - income);
  const pctOfIncome = income > 0 ? Math.min(100, Math.round((total / income) * 100)) : 0;

  const segments = fields
    .map((f) => ({
      key: f.key,
      label: f.label,
      value: budgets[f.key] ?? 0,
      color: CATEGORY_COLORS[f.key] ?? "#06b6d4",
    }))
    .sort((a, b) => b.value - a.value);

  const status =
    income === 0
      ? { tone: "info" as const, text: "Add your income to see how your budget compares." }
      : overspend > 0
        ? { tone: "warn" as const, text: `You're allocating $${overspend.toLocaleString()} more than your income.` }
        : buffer === 0
          ? { tone: "ok" as const, text: "Every dollar is accounted for." }
          : { tone: "ok" as const, text: `$${buffer.toLocaleString()} left for savings & unplanned spending.` };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-6 space-y-5 rounded-2xl border border-[#e0f2fe] bg-gradient-to-b from-white to-[#f0f9ff] p-5 shadow-sm"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Live preview</p>
        <h3 className="mt-1 text-base font-semibold text-[#0f172a]">Your monthly plan</h3>
      </div>

      <div className="flex justify-center">
        <DonutChart segments={segments} total={total} />
      </div>

      {/* Income vs allocated */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#64748b]">
          <span>Allocated</span>
          <span className="font-semibold text-[#0f172a] tabular-nums">
            ${total.toLocaleString()}{income > 0 && ` · ${pctOfIncome}% of income`}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-[#e0f2fe]">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${overspend > 0 ? "bg-gradient-to-r from-rose-400 to-amber-400" : "bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"}`}
            animate={{ width: `${income > 0 ? Math.min(100, (total / income) * 100) : 0}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 26 }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[#64748b]">
          <span>Income</span>
          <span className="font-semibold text-[#0f172a] tabular-nums">
            ${income.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status message */}
      <div
        className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
          status.tone === "warn"
            ? "border-rose-100 bg-rose-50 text-rose-700"
            : status.tone === "ok"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-[#e0f2fe] bg-white text-[#64748b]"
        }`}
      >
        {status.text}
      </div>

      {/* Legend */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#64748b]">Breakdown</p>
        <ul className="space-y-1.5">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.key} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="truncate text-[#334155]">{fields.find((f) => f.key === seg.key)?.label}</span>
                </span>
                <span className="shrink-0 font-semibold text-[#0f172a] tabular-nums">
                  ${seg.value.toLocaleString()}
                  <span className="ml-1 font-normal text-[#94a3b8]">{pct}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Balance info */}
      {balance > 0 && (
        <div className="rounded-xl border border-[#e0f2fe] bg-white px-3.5 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#94a3b8]">Starting balance</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0f172a] tabular-nums">
            ${balance.toLocaleString()}
          </p>
        </div>
      )}
    </motion.aside>
  );
}
