"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CsvUploadStep } from "./CsvUploadStep";
import { GoalSetupStep } from "./GoalSetupStep";
import { BudgetSidebar } from "./BudgetSidebar";
import { saveProfile, saveBudgets, saveTransactions } from "@/lib/userStore";
import { saveGoals } from "@/lib/goals";
import type { Goal } from "@/lib/goals";
import type { Transaction, BudgetEntry } from "@/lib/mockData";
import { useUser } from "@/context/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetField {
  key: string;
  label: string;
  default: number;
}

const BUDGET_FIELDS: BudgetField[] = [
  { key: "groceries",     label: "Groceries",      default: 200 },
  { key: "eating_out",    label: "Eating Out",      default: 150 },
  { key: "entertainment", label: "Entertainment",   default: 100 },
  { key: "shopping",      label: "Shopping",        default: 180 },
  { key: "transport",     label: "Transport",       default: 80  },
];

const MAX_SLIDER = 500;

interface ProfileState {
  income: string;
  balance: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Import data", "Your profile", "Goals"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="h-px w-8 transition-colors duration-300"
                style={{ backgroundColor: done ? "#06b6d4" : "#e0f2fe" }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                style={{
                  backgroundColor: done || active ? "#06b6d4" : "#f0f9ff",
                  color: done || active ? "#ffffff" : "#94a3b8",
                  border: done || active ? "none" : "1px solid #e0f2fe",
                }}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="hidden text-xs font-medium sm:block transition-colors duration-300"
                style={{ color: active ? "#06b6d4" : done ? "#0f172a" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Profile step ─────────────────────────────────────────────────────────────

interface ProfileStepProps {
  profile: ProfileState;
  budgets: Record<string, number>;
  onChange: (profile: ProfileState) => void;
  onBudgetChange: (key: string, value: number) => void;
  onComplete: () => void;
}

function ProfileStep({ profile, budgets, onChange, onBudgetChange, onComplete }: ProfileStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const income = parseFloat(profile.income);
    const balance = parseFloat(profile.balance);
    if (isNaN(income) || income < 0) {
      setError("Enter a valid monthly income.");
      return;
    }
    if (isNaN(balance) || balance < 0) {
      setError("Enter a valid current balance.");
      return;
    }
    setError(null);
    onComplete();
  };

  const incomeNum = Math.max(0, parseFloat(profile.income) || 0);
  const balanceNum = Math.max(0, parseFloat(profile.balance) || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]"
    >
      {/* Form column */}
      <div className="space-y-7">
        <div>
          <h2 className="text-2xl font-semibold text-[#0f172a] tracking-tight">
            Your financial profile
          </h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Drag the sliders to plan your month. The sidebar updates live as you go.
          </p>
        </div>

        {/* Income & balance */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Overview</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                Monthly income
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#64748b]">$</span>
                <input
                  type="number"
                  min={0}
                  value={profile.income}
                  onChange={(e) => { onChange({ ...profile, income: e.target.value }); setError(null); }}
                  placeholder="1800"
                  className="w-full rounded-lg border border-[#e0f2fe] bg-white py-2.5 pl-7 pr-3.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                Current balance
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#64748b]">$</span>
                <input
                  type="number"
                  min={0}
                  value={profile.balance}
                  onChange={(e) => { onChange({ ...profile, balance: e.target.value }); setError(null); }}
                  placeholder="1240"
                  className="w-full rounded-lg border border-[#e0f2fe] bg-white py-2.5 pl-7 pr-3.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget sliders */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Monthly budgets</p>
            <p className="mt-0.5 text-xs text-[#94a3b8]">Slide or type an amount — you can tune any category later.</p>
          </div>
          <div className="space-y-5">
            {BUDGET_FIELDS.map(({ key, label }) => {
              const val = budgets[key] ?? 0;
              const pct = Math.min(100, (val / MAX_SLIDER) * 100);
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-[#0f172a]">{label}</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#64748b]">$</span>
                      <input
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) => onBudgetChange(key, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 rounded-md border border-[#e0f2fe] bg-white py-1 px-2 text-right text-sm font-semibold text-[#0f172a] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative h-2 overflow-hidden rounded-full bg-[#e0f2fe]">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9]"
                        animate={{ width: `${pct}%` }}
                        transition={{ type: "spring", stiffness: 220, damping: 30 }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={MAX_SLIDER}
                      step={5}
                      value={val}
                      onChange={(e) => onBudgetChange(key, parseInt(e.target.value))}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label={`${label} budget`}
                    />
                    <div
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white bg-[#06b6d4] shadow"
                      style={{ left: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0891b2] active:bg-[#0e7490]"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Interactive sidebar */}
      <BudgetSidebar
        income={incomeNum}
        balance={balanceNum}
        budgets={budgets}
        fields={BUDGET_FIELDS}
      />
    </motion.div>
  );
}

// ─── Main flow ────────────────────────────────────────────────────────────────

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
};

export function OnboardingFlow() {
  const router = useRouter();
  const { user, refreshData } = useUser();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Guard: if someone opens /onboarding without an account yet, send them to /signup.
  if (typeof window !== "undefined" && !user && !localStorage.getItem("mula_session")) {
    router.replace("/signup");
  }

  // Step 1
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  // Step 2
  const [profile, setProfile] = useState<ProfileState>({ income: "", balance: "" });
  const [budgets, setBudgets] = useState<Record<string, number>>(() =>
    Object.fromEntries(BUDGET_FIELDS.map((f) => [f.key, f.default]))
  );

  // Step 3 — final goals are submitted through handleGoalsComplete, no local state needed

  const advance = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleCsvComplete = (txns: Transaction[] | null) => {
    setTransactions(txns);
    advance();
  };

  const handleProfileComplete = () => {
    advance();
  };

  const handleGoalsComplete = (finalGoals: Goal[]) => {
    // Persist everything
    saveProfile({
      income: parseFloat(profile.income) || 1800,
      balance: parseFloat(profile.balance) || 1240,
    });

    const budgetEntries: BudgetEntry[] = BUDGET_FIELDS.map((f) => ({
      category: f.key,
      limit: budgets[f.key] ?? f.default,
    }));
    saveBudgets(budgetEntries);

    if (transactions) {
      saveTransactions(transactions);
    }

    if (finalGoals.length > 0) {
      saveGoals(finalGoals);
    }

    refreshData();
    router.push("/dashboard");
  };

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <motion.div
            key="step-csv"
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <CsvUploadStep onComplete={handleCsvComplete} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-profile"
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ProfileStep
              profile={profile}
              budgets={budgets}
              onChange={setProfile}
              onBudgetChange={(key, val) => setBudgets((prev) => ({ ...prev, [key]: val }))}
              onComplete={handleProfileComplete}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-goals"
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <GoalSetupStep onComplete={handleGoalsComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
