"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Transaction } from "@/lib/mockData";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  transactions: Transaction[];
  limit?: number;
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function labelFromCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export function TransactionList({ transactions, limit = 10 }: Props) {
  const sorted = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e0f2fe] bg-[#f0f9ff] p-8 text-center text-sm text-[#64748b]">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e0f2fe]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
          Recent Transactions
        </p>
      </div>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-[#e0f2fe]"
      >
        {sorted.map((tx, idx) => {
          const color = CATEGORY_COLORS[tx.category] ?? "#64748b";
          const even = idx % 2 === 0;
          return (
            <motion.li
              key={`${tx.date}-${tx.merchant}-${idx}`}
              variants={item}
              className={`flex items-center gap-4 px-5 py-3 ${even ? "bg-white" : "bg-[#f0f9ff]/40"}`}
            >
              {/* Category dot */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />

              {/* Date */}
              <span className="w-28 shrink-0 text-xs text-[#64748b]">
                {formatDate(tx.date)}
              </span>

              {/* Merchant */}
              <span className="flex-1 truncate text-sm font-medium text-[#0f172a]">
                {tx.merchant}
              </span>

              {/* Category badge */}
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {labelFromCategory(tx.category)}
              </span>

              {/* Amount */}
              <span className="shrink-0 text-sm font-semibold text-[#0f172a]">
                ${tx.amount.toFixed(2)}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
