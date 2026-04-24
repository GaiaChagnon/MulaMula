"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { GoalTrackingTab } from "@/components/dashboard/GoalTrackingTab";

type Tab = "overview" | "insights" | "goals";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Insights" },
  { id: "goals", label: "Goal Tracking" },
];

const tabVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

export function DashboardShell() {
  const { user, userData, snapshot, goals, logout, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  function handleTabChange(tab: Tab) {
    const tabOrder: Tab[] = ["overview", "insights", "goals"];
    const cur = tabOrder.indexOf(activeTab);
    const next = tabOrder.indexOf(tab);
    setDirection(next > cur ? 1 : -1);
    setActiveTab(tab);
  }

  // Loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-[#e0f2fe] border-t-[#06b6d4]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Auth guard — redirect already fired via useEffect; show nothing while redirecting
  if (!user || !snapshot || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-[#e0f2fe] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06b6d4]">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path
                  d="M10 2C6.134 2 3 5.134 3 9s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm.75 10.5v.75h-1.5v-.75a2.25 2.25 0 01-1.875-2.218h1.5c0 .414.336.75.75.75h.375a.75.75 0 000-1.5H9.25a2.25 2.25 0 010-4.5V4.25h1.5V4.5c1.036.207 1.875 1.096 1.875 2.25h-1.5a.75.75 0 00-.75-.75H9.25a.75.75 0 000 1.5H10a2.25 2.25 0 010 4.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-[#06b6d4]">MulaMula</span>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-[#0f172a]">
              {user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-3 py-1.5 text-xs font-semibold text-[#64748b] transition hover:border-[#06b6d4] hover:text-[#06b6d4]"
            >
              Log out
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pt-1 sm:px-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative rounded-t-lg px-4 pb-3.5 pt-2 text-sm font-semibold tracking-tight transition ${
                  isActive
                    ? "text-[#06b6d4]"
                    : "text-[#64748b] hover:bg-[#f0f9ff]/60 hover:text-[#0f172a]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[#06b6d4]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <OverviewTab snapshot={snapshot} userData={userData} goals={goals} />
            </motion.div>
          )}
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <InsightsTab snapshot={snapshot} userData={userData} />
            </motion.div>
          )}
          {activeTab === "goals" && (
            <motion.div
              key="goals"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <GoalTrackingTab snapshot={snapshot} userData={userData} goals={goals} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
