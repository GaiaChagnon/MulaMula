"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Transaction } from "@/lib/mockData";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  transactions: Transaction[];
};

function getISOWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const thu = new Date(d);
  thu.setDate(d.getDate() + 4 - day);
  const jan1 = new Date(thu.getFullYear(), 0, 1);
  const week = Math.ceil(((thu.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
  return `${thu.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getWeekLabel(weekKey: string): string {
  // weekKey: "YYYY-Www"
  const [yearStr, wStr] = weekKey.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(wStr, 10);
  // Get Monday of that ISO week
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay() === 0 ? 7 : jan1.getDay();
  const daysToMon = (week - 1) * 7 + (1 - jan1Day + 1);
  const mon = new Date(year, 0, 1 + daysToMon);
  return mon.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function labelFromCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SpendingTrendChart({ transactions }: Props) {
  // Build last 8 weeks from the most recent transaction date
  const dates = transactions.map((t) => t.date).sort();
  const latestDate = dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10);
  const latestMs = new Date(`${latestDate}T12:00:00`).getTime();

  const eightWeeksMs = 8 * 7 * 24 * 60 * 60 * 1000;
  const cutoffMs = latestMs - eightWeeksMs;

  const filtered = transactions.filter(
    (t) => new Date(`${t.date}T12:00:00`).getTime() >= cutoffMs
  );

  // Find top 4 categories by total spend
  const catTotals: Record<string, number> = {};
  for (const t of filtered) {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
  }
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([c]) => c);

  // Group by ISO week, per category
  const weekMap: Record<string, Record<string, number>> = {};
  for (const t of filtered) {
    if (!topCats.includes(t.category)) continue;
    const wk = getISOWeekKey(t.date);
    if (!weekMap[wk]) weekMap[wk] = {};
    weekMap[wk][t.category] = (weekMap[wk][t.category] ?? 0) + t.amount;
  }

  const weeks = Object.keys(weekMap).sort();

  const chartData = weeks.map((wk) => ({
    week: getWeekLabel(wk),
    ...Object.fromEntries(topCats.map((cat) => [cat, weekMap[wk][cat] ?? 0])),
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e0f2fe] bg-white p-8 text-center text-sm text-[#64748b]">
        Not enough data to show spending trend.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
        Spending Trend
      </p>
      <p className="mt-0.5 text-sm text-[#64748b]">Weekly spend · last 8 weeks · top categories</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {topCats.map((cat) => {
                const color = CATEGORY_COLORS[cat] ?? "#06b6d4";
                return (
                  <linearGradient key={cat} id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              formatter={(value, name) => {
                const n = typeof value === "number" ? value : Number(value);
                const label = typeof name === "string" ? labelFromCategory(name) : String(name);
                return [`$${n.toFixed(2)}`, label];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e0f2fe",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(val) => labelFromCategory(val)}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            {topCats.map((cat) => {
              const color = CATEGORY_COLORS[cat] ?? "#06b6d4";
              return (
                <Area
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${cat})`}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
