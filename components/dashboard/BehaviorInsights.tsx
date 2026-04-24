"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FinanceSnapshot } from "@/lib/financeEngine";
import { createFinanceEngine } from "@/lib/financeEngine";
import type { UserData } from "@/lib/mockData";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  snapshot: FinanceSnapshot;
  userData: UserData;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const MERCHANT_COLORS = [
  "#06b6d4",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#a855f7",
];

export function BehaviorInsights({ snapshot, userData }: Props) {
  const { patterns, forecast } = useMemo(() => {
    const engine = createFinanceEngine(userData, new Date());
    return {
      patterns: engine.getSpendingPatterns(),
      forecast: engine.forecastMonthlySpending(),
    };
  }, [userData]);

  const topMerchant = patterns.topMerchantsThisMonth[0];
  const merchantData = patterns.topMerchantsThisMonth.slice(0, 5).map((m) => ({
    name: m.merchant,
    spend: m.total,
  }));

  const overBudget = forecast.forecastMonthEndBudgetedSpend > forecast.envelopeCap;

  const statCards = [
    {
      label: "Avg. Transaction",
      value: `$${patterns.averageSpendPerTransactionThisMonth.toFixed(2)}`,
      sub: "this month",
      accent: "#06b6d4",
    },
    {
      label: "Top Merchant",
      value: topMerchant?.merchant ?? "—",
      sub: topMerchant ? `$${topMerchant.total.toFixed(2)} this month` : "no data",
      accent: "#0ea5e9",
    },
    {
      label: "Month Forecast",
      value: `$${forecast.forecastMonthEndBudgetedSpend}`,
      sub: `vs $${forecast.envelopeCap} envelope cap`,
      accent: overBudget ? "#f97316" : "#22c55e",
    },
    {
      label: "Transactions",
      value: String(patterns.transactionCountThisMonth),
      sub: "this month",
      accent: "#06b6d4",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
        Behaviour Insights
      </p>
      <p className="mt-0.5 mb-4 text-sm text-[#64748b]">
        Patterns for {patterns.asOfMonth}
      </p>

      {/* 2x2 stat grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={card}
            className="rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-4"
          >
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              {s.label}
            </p>
            <p
              className="mt-1 text-xl font-bold tracking-tight truncate"
              style={{ color: s.accent }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 text-xs text-[#64748b]">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Top 5 merchants bar chart */}
      {merchantData.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            Top Merchants This Month
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={merchantData}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0f2fe" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#0f172a" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    return [`$${n.toFixed(2)}`, "Spent"];
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e0f2fe",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                  {merchantData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={MERCHANT_COLORS[i % MERCHANT_COLORS.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category breakdown note */}
      <div className="mt-4 rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-3">
        <p className="text-xs text-[#64748b]">
          <span className="font-semibold text-[#06b6d4]">
            ${patterns.totalBudgetedCategoriesThisMonth}
          </span>{" "}
          spent in budgeted categories this month vs{" "}
          <span className="font-semibold text-[#64748b]">
            ${patterns.totalBudgetedCategoriesPriorMonth}
          </span>{" "}
          in {patterns.priorMonth}.
        </p>
      </div>
    </div>
  );
}
