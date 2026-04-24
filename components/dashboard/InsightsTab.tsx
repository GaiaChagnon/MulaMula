"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { SpendingTrendChart } from "@/components/dashboard/SpendingTrendChart";
import { BehaviorInsights } from "@/components/dashboard/BehaviorInsights";
import { BudgetCategoryBars } from "@/components/BudgetCategoryBars";
import { BudgetProgress } from "@/components/BudgetProgress";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import type { FinanceSnapshot } from "@/lib/financeEngine";
import type { UserData } from "@/lib/mockData";

type Props = {
  snapshot: FinanceSnapshot;
  userData: UserData;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function InsightsTab({ snapshot, userData }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={row}>
        <SpendingTrendChart transactions={userData.transactions} />
      </motion.div>

      <motion.div variants={row}>
        <BehaviorInsights snapshot={snapshot} userData={userData} />
      </motion.div>

      <motion.div variants={row} className="grid gap-6 lg:grid-cols-2">
        <BudgetCategoryBars data={snapshot} />
        <BudgetProgress data={snapshot} />
      </motion.div>

      <motion.div variants={row}>
        <SpendingPieChart data={snapshot} />
      </motion.div>
    </motion.div>
  );
}
