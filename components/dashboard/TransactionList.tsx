"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Transaction } from "@/lib/mockData";
import { CATEGORY_COLORS } from "@/lib/mockData";

type Props = {
  transactions: Transaction[];
  limit?: number;
};

function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric", year: "numeric" }
  );
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
  const [selected, setSelected] = useState<Transaction | null>(null);

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit),
    [transactions, limit]
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e0f2fe] bg-[#f0f9ff] p-8 text-center text-sm text-[#64748b]">
        No transactions yet
      </div>
    );
  }

  return (
    <>
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
            return (
              <motion.li
                key={`${tx.date}-${tx.merchant}-${idx}`}
                variants={item}
                className="overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setSelected(tx)}
                  className="group flex w-full items-center gap-4 bg-white px-5 py-3 text-left transition hover:bg-[#f0f9ff]"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="w-28 shrink-0 text-xs text-[#64748b]">
                    {formatDate(tx.date)}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-[#0f172a]">
                    {tx.merchant}
                  </span>
                  <span
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {labelFromCategory(tx.category)}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#0f172a]">
                    ${tx.amount.toFixed(2)}
                  </span>
                  <svg
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-[#cbd5e1] transition group-hover:text-[#06b6d4]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <TransactionDetails tx={selected} onClose={() => setSelected(null)} allTransactions={transactions} />
    </>
  );
}

function TransactionDetails({
  tx,
  allTransactions,
  onClose,
}: {
  tx: Transaction | null;
  allTransactions: Transaction[];
  onClose: () => void;
}) {
  const context = useMemo(() => {
    if (!tx) return null;
    const sameCategory = allTransactions
      .filter((t) => t.category === tx.category)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const sameMerchant = allTransactions.filter((t) => t.merchant === tx.merchant);
    const categoryTotal = sameCategory.reduce((s, t) => s + t.amount, 0);
    const merchantTotal = sameMerchant.reduce((s, t) => s + t.amount, 0);
    const ordered = [...allTransactions].sort((a, b) => (a.date < b.date ? -1 : 1));
    const idx = ordered.findIndex(
      (t) => t.date === tx.date && t.merchant === tx.merchant && t.amount === tx.amount
    );
    const prev = idx > 0 ? ordered[idx - 1] : null;
    const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
    return { sameCategory, sameMerchant, categoryTotal, merchantTotal, prev, next };
  }, [tx, allTransactions]);

  return (
    <AnimatePresence>
      {tx && context && (
        <motion.div
          key="tx-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/30 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#e0f2fe] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-[#f0f9ff] hover:text-[#0f172a]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[tx.category] ?? "#64748b"}18`,
                    color: CATEGORY_COLORS[tx.category] ?? "#64748b",
                  }}
                >
                  {labelFromCategory(tx.category)}
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {formatDate(tx.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a]">
                {tx.merchant}
              </h3>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#0f172a]">
                ${tx.amount.toFixed(2)}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
                    This merchant
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-[#0f172a]">
                    ${context.merchantTotal.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    across {context.sameMerchant.length} transaction{context.sameMerchant.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
                    {labelFromCategory(tx.category)} total
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-[#0f172a]">
                    ${context.categoryTotal.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    across {context.sameCategory.length} transaction{context.sameCategory.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {(context.prev || context.next) && (
                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">Around this time</p>
                  <ul className="mt-2 space-y-1.5">
                    {context.prev && (
                      <li className="flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-sm">
                        <span className="text-[#64748b]">Before · {formatDate(context.prev.date, { month: "short", day: "numeric" })}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[#0f172a]">{context.prev.merchant}</span>
                          <span className="font-semibold tabular-nums text-[#0f172a]">${context.prev.amount.toFixed(2)}</span>
                        </span>
                      </li>
                    )}
                    {context.next && (
                      <li className="flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-sm">
                        <span className="text-[#64748b]">After · {formatDate(context.next.date, { month: "short", day: "numeric" })}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[#0f172a]">{context.next.merchant}</span>
                          <span className="font-semibold tabular-nums text-[#0f172a]">${context.next.amount.toFixed(2)}</span>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
