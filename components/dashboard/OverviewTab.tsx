"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FinanceCards } from "@/components/FinanceCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import type { FinanceSnapshot } from "@/lib/financeEngine";
import type { UserData } from "@/lib/mockData";
import type { Goal } from "@/lib/goals";

type Props = {
  snapshot: FinanceSnapshot;
  userData: UserData;
  goals: Goal[];
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function OverviewTab({ snapshot, userData, goals }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Finance summary cards */}
      <motion.div variants={row}>
        <FinanceCards data={snapshot} />
      </motion.div>

      {/* Two-column grid */}
      <motion.div variants={row} className="grid gap-6 lg:grid-cols-2">
        <TransactionList transactions={userData.transactions} limit={10} />
        <ChatPanel userData={userData} goals={goals} />
      </motion.div>
    </motion.div>
  );
}
