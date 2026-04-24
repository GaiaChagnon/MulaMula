import type { UserData, Transaction, BudgetEntry } from "./mockData";
import { userData as mockUserData } from "./mockData";

const PROFILE_KEY = "mtk_profile";
const TRANSACTIONS_KEY = "mtk_transactions";
const BUDGETS_KEY = "mtk_budgets";

type UserProfile = {
  balance: number;
  income: number;
};

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveTransactions(txns: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

export function loadTransactions(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : null;
  } catch {
    return null;
  }
}

export function saveBudgets(budgets: BudgetEntry[]): void {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

export function loadBudgets(): BudgetEntry[] | null {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? (JSON.parse(raw) as BudgetEntry[]) : null;
  } catch {
    return null;
  }
}

export function buildUserData(): UserData {
  const profile = loadProfile();
  const transactions = loadTransactions();
  const budgets = loadBudgets();

  return {
    balance: profile?.balance ?? mockUserData.balance,
    income: profile?.income ?? mockUserData.income,
    upcomingBills: mockUserData.upcomingBills,
    categories: mockUserData.categories,
    budgets: budgets ?? mockUserData.budgets,
    jars: mockUserData.jars,
    transactions: transactions ?? mockUserData.transactions,
  };
}

export function clearUserData(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(TRANSACTIONS_KEY);
  localStorage.removeItem(BUDGETS_KEY);
}
