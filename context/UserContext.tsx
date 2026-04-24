"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { UserData } from "@/lib/mockData";
import type { StoredUser } from "@/lib/auth";
import type { Goal } from "@/lib/goals";
import { loadUser, clearUser } from "@/lib/auth";
import { loadGoals, saveGoals } from "@/lib/goals";
import { buildUserData, clearUserData } from "@/lib/userStore";
import { createFinanceEngine } from "@/lib/financeEngine";
import type { FinanceSnapshot } from "@/lib/financeEngine";

type UserContextValue = {
  user: StoredUser | null;
  userData: UserData | null;
  snapshot: FinanceSnapshot | null;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  refreshData: () => void;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userData: null,
  snapshot: null,
  goals: [],
  setGoals: () => {},
  refreshData: () => {},
  logout: () => {},
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    const storedUser = loadUser();
    const storedGoals = loadGoals();
    setUser(storedUser);
    setGoalsState(storedGoals);

    if (storedUser) {
      const data = buildUserData();
      const engine = createFinanceEngine(data, new Date());
      setUserData(data);
      setSnapshot(engine.toSnapshot());
    } else {
      setUserData(null);
      setSnapshot(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const setGoals = useCallback((goals: Goal[]) => {
    saveGoals(goals);
    setGoalsState(goals);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    clearUserData();
    setUser(null);
    setUserData(null);
    setSnapshot(null);
    setGoalsState([]);
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, snapshot, goals, setGoals, refreshData, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
