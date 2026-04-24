"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { GoalProgress } from "@/components/GoalProgress";
import { BehaviorInsights } from "@/components/dashboard/BehaviorInsights";
import type { FinanceSnapshot } from "@/lib/financeEngine";
import type { UserData } from "@/lib/mockData";
import type { Goal } from "@/lib/goals";
import { goalProgressPercent, monthsToGoal } from "@/lib/goals";

type Props = {
  snapshot: FinanceSnapshot;
  userData: UserData;
  goals: Goal[];
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function GoalTrackingTab({ snapshot, userData, goals }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Goal cards */}
      {goals.length > 0 ? (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const pct = goalProgressPercent(goal);
            const months = monthsToGoal(goal);
            const remaining = goal.targetAmount - goal.savedAmount;

            return (
              <motion.div
                key={goal.id}
                variants={item}
                className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm"
              >
                {/* Goal name */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#0f172a] leading-snug">{goal.name}</p>
                  <span className="shrink-0 rounded-full bg-[#f0f9ff] border border-[#e0f2fe] px-2.5 py-0.5 text-xs font-semibold text-[#06b6d4]">
                    {pct}%
                  </span>
                </div>

                {/* Progress bar with animated width */}
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e0f2fe]">
                  <motion.div
                    className="h-full rounded-full bg-[#06b6d4]"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    role="progressbar"
                    aria-valuenow={goal.savedAmount}
                    aria-valuemin={0}
                    aria-valuemax={goal.targetAmount}
                    aria-label={`${goal.name} goal ${pct}% complete`}
                  />
                </div>

                {/* Amounts */}
                <div className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="text-[#64748b]">
                    ${goal.savedAmount.toLocaleString()} saved
                  </span>
                  <span className="font-medium text-[#0f172a]">
                    ${goal.targetAmount.toLocaleString()} target
                  </span>
                </div>

                {/* Monthly contribution + time estimate */}
                <div className="mt-2 rounded-xl bg-[#f0f9ff] px-3 py-2">
                  <p className="text-xs text-[#64748b]">
                    +${goal.monthlyContribution.toLocaleString()}/mo contribution
                  </p>
                  {months !== null && months > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-[#06b6d4]">
                      ~{months} month{months !== 1 ? "s" : ""} to reach goal
                    </p>
                  )}
                  {months === 0 && (
                    <p className="mt-0.5 text-xs font-semibold text-[#22c55e]">
                      Goal reached!
                    </p>
                  )}
                  {months === null && (
                    <p className="mt-0.5 text-xs text-[#64748b]">
                      No monthly contribution set
                    </p>
                  )}
                  {remaining > 0 && (
                    <p className="mt-0.5 text-xs text-[#64748b]">
                      ${remaining.toLocaleString()} remaining
                    </p>
                  )}
                </div>

                {/* Notes */}
                {goal.notes && (
                  <p className="mt-2 text-xs text-[#64748b] italic line-clamp-2">{goal.notes}</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="rounded-2xl border border-[#e0f2fe] bg-[#f0f9ff] p-10 text-center"
        >
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-sm font-medium text-[#0f172a]">No goals yet</p>
          <p className="mt-1 text-xs text-[#64748b]">
            Add some during setup to track your savings progress here!
          </p>
        </motion.div>
      )}

      {/* Savings jars from finance data */}
      <motion.div variants={item}>
        <GoalProgress data={snapshot} />
      </motion.div>

      {/* Behavior insights */}
      <motion.div variants={item}>
        <BehaviorInsights snapshot={snapshot} userData={userData} />
      </motion.div>
    </motion.div>
  );
}
