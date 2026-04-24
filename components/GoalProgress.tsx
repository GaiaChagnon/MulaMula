import type { FinanceSnapshot } from "@/lib/financeEngine";

const JAR_GRADIENTS = [
  "from-violet-400 to-fuchsia-500",
  "from-[#06b6d4] to-[#0ea5e9]",
  "from-amber-400 to-orange-500",
];

type Props = {
  data: FinanceSnapshot;
};

export function GoalProgress({ data }: Props) {
  return (
    <div className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">Savings jars</p>
      <p className="text-xs text-[#94a3b8]">Progress to each target</p>
      <ul className="mt-4 space-y-5">
        {data.jars.map((g, i) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const grad = JAR_GRADIENTS[i % JAR_GRADIENTS.length];
          return (
            <li key={g.name}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-[#0f172a]">{g.name}</span>
                <span className="text-xs text-[#64748b] tabular-nums">
                  ${g.saved.toLocaleString()} / ${g.target.toLocaleString()} ({pct}%)
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e0f2fe]">
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
              <p className="mt-1.5 text-xs text-[#64748b]">
                +${g.monthlyContribution}/mo &middot; ~{g.monthsLeft} mo left
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
