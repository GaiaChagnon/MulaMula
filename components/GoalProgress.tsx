import type { FinanceSnapshot } from "@/lib/financeEngine";

const JAR_GRADIENTS = [
  "from-violet-400 to-fuchsia-500",
  "from-sky-400 to-cyan-500",
  "from-amber-400 to-orange-500",
];

type Props = {
  data: FinanceSnapshot;
};

export function GoalProgress({ data }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Goals</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">Savings jars · progress to target</p>
      <ul className="mt-4 space-y-5">
        {data.jars.map((g, i) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const grad = JAR_GRADIENTS[i % JAR_GRADIENTS.length];
          return (
            <li key={g.name}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-zinc-900 dark:text-white">{g.name}</span>
                <span className="text-xs text-zinc-500">
                  ${g.saved.toLocaleString()} / ${g.target.toLocaleString()} ({pct}%)
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={g.saved}
                  aria-valuemin={0}
                  aria-valuemax={g.target}
                  aria-label={`${g.name} goal ${pct} percent complete`}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">
                +${g.monthlyContribution}/mo · ~{g.monthsLeft} mo left
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
