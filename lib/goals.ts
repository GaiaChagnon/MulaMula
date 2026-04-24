export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  notes: string;
  createdAt: string;
};

const GOALS_KEY = "mula_goals";

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
}

export function createGoal(partial: Omit<Goal, "id" | "createdAt">): Goal {
  return {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

export function goalProgressPercent(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
}

export function monthsToGoal(goal: Goal): number | null {
  const gap = goal.targetAmount - goal.savedAmount;
  if (gap <= 0) return 0;
  if (goal.monthlyContribution <= 0) return null;
  return Math.ceil(gap / goal.monthlyContribution);
}

import type { Jar } from "./mockData";

/** Build a starter set of goals from the demo jars so users who skip can still see goal tracking. */
export function goalsFromJars(jars: Jar[]): Goal[] {
  return jars.map((j) => ({
    id: crypto.randomUUID(),
    name: j.name,
    targetAmount: j.target,
    savedAmount: j.saved,
    monthlyContribution: j.monthlyContribution,
    notes: "",
    createdAt: new Date().toISOString(),
  }));
}
