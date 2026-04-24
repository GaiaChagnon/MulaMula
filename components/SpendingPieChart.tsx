"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FinanceSnapshot } from "@/lib/financeEngine";
import { labelFromCategoryId } from "@/lib/financeEngine";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  data: FinanceSnapshot;
};

type Slice = { name: string; value: number; fill: string };

export function SpendingPieChart({ data }: Props) {
  const slices: Slice[] = Object.entries(data.monthSpendByCategory)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: labelFromCategoryId(key),
      value,
      fill: CATEGORY_COLORS[key] ?? "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);

  if (slices.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80">
        No spending in {data.asOfISO.slice(0, 7)} yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Spending by category
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">This month · {data.asOfISO.slice(0, 7)}</p>
      <div className="mx-auto mt-2 h-[min(52vw,280px)] w-full max-w-[320px] sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={s.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                const safe = Number.isFinite(n) ? n : 0;
                return [`$${safe.toLocaleString()}`, "Spent"];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7" }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 11, color: "inherit" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
