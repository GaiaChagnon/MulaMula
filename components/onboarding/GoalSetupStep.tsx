"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createGoal, goalsFromJars } from "@/lib/goals";
import type { Goal } from "@/lib/goals";
import { userData as mockUserData } from "@/lib/mockData";

interface GoalSetupStepProps {
  onComplete: (goals: Goal[]) => void;
}

interface GoalFormState {
  name: string;
  targetAmount: string;
  savedAmount: string;
  monthlyContribution: string;
  notes: string;
}

const EMPTY_FORM: GoalFormState = {
  name: "",
  targetAmount: "",
  savedAmount: "",
  monthlyContribution: "",
  notes: "",
};

const MAX_GOALS = 5;

export function GoalSetupStep({ onComplete }: GoalSetupStepProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleAddGoal = () => {
    if (!form.name.trim()) {
      setFormError("Goal name is required.");
      return;
    }
    const target = parseFloat(form.targetAmount);
    const saved = parseFloat(form.savedAmount) || 0;
    const monthly = parseFloat(form.monthlyContribution) || 0;
    if (isNaN(target) || target <= 0) {
      setFormError("Enter a valid target amount greater than 0.");
      return;
    }
    const goal = createGoal({
      name: form.name.trim(),
      targetAmount: target,
      savedAmount: saved,
      monthlyContribution: monthly,
      notes: form.notes.trim(),
    });
    setGoals((prev) => [...prev, goal]);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const canAddMore = goals.length < MAX_GOALS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#0f172a] tracking-tight">
          Set your savings goals
        </h2>
        <p className="mt-1 text-sm text-[#64748b]">
          Add up to {MAX_GOALS} goals, or skip and explore with our sample goals. You can edit them any time from the dashboard.
        </p>
      </div>

      {/* Skip + use demo goals */}
      {goals.length === 0 && !showForm && (
        <button
          onClick={() => onComplete(goalsFromJars(mockUserData.jars))}
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[#e0f2fe] bg-gradient-to-br from-white to-[#f0f9ff] px-5 py-4 text-left transition-all hover:border-[#06b6d4] hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06b6d4]/10 text-[#06b6d4]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">Skip for now &mdash; use sample goals</p>
              <p className="mt-0.5 text-xs text-[#64748b]">
                We&apos;ll set up a Summer Trip, Emergency Fund and New Laptop so you can try the dashboard instantly.
              </p>
            </div>
          </div>
          <svg className="h-4 w-4 shrink-0 text-[#94a3b8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#06b6d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}

      {/* Goals list */}
      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0f172a]">{goal.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#64748b]">
                    <span>Target: <span className="font-medium text-[#0f172a]">${goal.targetAmount.toLocaleString()}</span></span>
                    {goal.savedAmount > 0 && (
                      <span>Saved: <span className="font-medium text-[#0f172a]">${goal.savedAmount.toLocaleString()}</span></span>
                    )}
                    {goal.monthlyContribution > 0 && (
                      <span>${goal.monthlyContribution}/mo</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(goal.id)}
                  className="ml-4 flex-shrink-0 rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove goal"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {goals.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed border-[#e0f2fe] bg-[#f0f9ff] px-4 py-6 text-center">
            <p className="text-sm text-[#64748b]">No goals yet. Add one below to get started.</p>
          </div>
        )}
      </div>

      {/* Add goal button */}
      {canAddMore && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e0f2fe] bg-white py-3 text-sm font-medium text-[#06b6d4] transition-colors hover:border-[#06b6d4] hover:bg-[#ecfeff]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add a goal
        </button>
      )}

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="goal-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-5 space-y-4">
              <p className="text-sm font-semibold text-[#0f172a]">New goal</p>

              {/* Goal name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                  Goal name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleField}
                  placeholder="e.g. Summer trip, Emergency fund"
                  className="w-full rounded-lg border border-[#e0f2fe] bg-white px-3.5 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>

              {/* Amount row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                    Target amount <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#64748b]">$</span>
                    <input
                      type="number"
                      name="targetAmount"
                      value={form.targetAmount}
                      onChange={handleField}
                      min={1}
                      placeholder="0"
                      className="w-full rounded-lg border border-[#e0f2fe] bg-white py-2.5 pl-7 pr-3.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                    Already saved
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#64748b]">$</span>
                    <input
                      type="number"
                      name="savedAmount"
                      value={form.savedAmount}
                      onChange={handleField}
                      min={0}
                      placeholder="0"
                      className="w-full rounded-lg border border-[#e0f2fe] bg-white py-2.5 pl-7 pr-3.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Monthly contribution */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                  Monthly contribution
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#64748b]">$</span>
                  <input
                    type="number"
                    name="monthlyContribution"
                    value={form.monthlyContribution}
                    onChange={handleField}
                    min={0}
                    placeholder="0"
                    className="w-full rounded-lg border border-[#e0f2fe] bg-white py-2.5 pl-7 pr-3.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                  Notes <span className="text-[#94a3b8]">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleField}
                  rows={2}
                  placeholder="Any extra details…"
                  className="w-full resize-none rounded-lg border border-[#e0f2fe] bg-white px-3.5 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>

              {/* Form error */}
              <AnimatePresence>
                {formError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500"
                  >
                    {formError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Form actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null); }}
                  className="rounded-lg border border-[#e0f2fe] bg-white px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:border-[#94a3b8]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="rounded-lg bg-[#06b6d4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0891b2] active:bg-[#0e7490]"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onComplete(goals)}
          className="rounded-lg bg-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0891b2] active:bg-[#0e7490]"
        >
          {goals.length === 0 ? "Continue without goals" : `Continue with ${goals.length} goal${goals.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </motion.div>
  );
}
