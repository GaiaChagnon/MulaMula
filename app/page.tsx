import { ChatBox } from "@/components/ChatBox";
import { FinanceCards } from "@/components/FinanceCards";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { BudgetProgress } from "@/components/BudgetProgress";
import { BudgetCategoryBars } from "@/components/BudgetCategoryBars";
import { GoalProgress } from "@/components/GoalProgress";
import { DEMO_AS_OF, userData } from "@/lib/mockData";
import { deriveFinanceSnapshot } from "@/lib/financeEngine";

export default function Home() {
  const snapshot = deriveFinanceSnapshot(userData, DEMO_AS_OF);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/90 via-zinc-50 to-zinc-100 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-black">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 text-center sm:text-left">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Student finance demo</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Talk to Your Money
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-zinc-600 dark:text-zinc-300 sm:mx-0">
            Natural questions, deterministic numbers from the finance engine, charts from mock data, and OpenRouter
            (optional) to format chat replies—no bank connections.
          </p>
        </header>

        <FinanceCards data={snapshot} />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ChatBox />
          <div className="space-y-6">
            <SpendingPieChart data={snapshot} />
            <BudgetProgress data={snapshot} />
            <BudgetCategoryBars data={snapshot} />
            <GoalProgress data={snapshot} />
          </div>
        </div>
      </div>
    </div>
  );
}
