"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    n: "01",
    title: "Import your transactions",
    body:
      "Upload a CSV from your bank — or click once and try our sample data. We auto-detect dates, merchants and categories.",
    accent: "from-[#06b6d4] to-[#0ea5e9]",
  },
  {
    n: "02",
    title: "Shape your monthly plan",
    body:
      "Set spending envelopes with live sliders. A sidebar shows exactly how every dollar of your income is allocated, in real time.",
    accent: "from-[#0ea5e9] to-[#38bdf8]",
  },
  {
    n: "03",
    title: "Ask your money anything",
    body:
      "\"Can I afford this?\" \"Where can I cut back?\" Get encouraging answers grounded in your numbers, not vibes.",
    accent: "from-[#38bdf8] to-[#22d3ee]",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-gradient-to-b from-white via-[#f0f9ff] to-white py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-block rounded-full border border-[#e0f2fe] bg-white px-3.5 py-1 text-xs font-medium text-[#0ea5e9]"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl"
          >
            Three clicks between you and a plan that finally makes sense.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="mt-4 text-base text-[#64748b]"
          >
            No bank connections. No dark patterns. Your data stays on your device.
          </motion.p>
        </div>

        <div className="space-y-14 md:space-y-20">
          {STEPS.map((step, i) => {
            const flipped = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                {/* Step content */}
                <div className={flipped ? "md:order-2" : ""}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-sm font-bold text-white shadow-md shadow-cyan-500/20`}
                      aria-hidden
                    >
                      {step.n}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                      Step {i + 1} of {STEPS.length}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0f172a]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748b] sm:text-base">
                    {step.body}
                  </p>
                </div>

                {/* Visual preview */}
                <div className={flipped ? "md:order-1" : ""}>
                  <StepVisual step={i} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#f87171]" />
          <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
          <span className="h-2 w-2 rounded-full bg-[#34d399]" />
          <span className="ml-2 text-xs font-mono text-[#94a3b8]">transactions_2026_04.csv</span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px] text-[#334155]">
          {[
            ["2026-04-22", "Carrefour", "groceries", "45.00"],
            ["2026-04-21", "Uber Eats", "eating_out", "28.00"],
            ["2026-04-20", "Zara", "shopping", "65.00"],
            ["2026-04-19", "Cinema", "entertainment", "18.00"],
            ["2026-04-18", "Metro", "transport", "12.00"],
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.3, ease: EASE }}
              className="grid grid-cols-[80px_1fr_80px_50px] gap-2 rounded-md px-2 py-1.5 hover:bg-[#f0f9ff]"
            >
              <span className="text-[#94a3b8]">{row[0]}</span>
              <span className="truncate font-medium text-[#0f172a]">{row[1]}</span>
              <span className="rounded-full bg-[#ecfeff] px-1.5 py-0.5 text-center text-[10px] text-[#06b6d4]">
                {row[2]}
              </span>
              <span className="text-right tabular-nums text-[#0f172a]">${row[3]}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (step === 1) {
    const CATS = [
      { label: "Groceries", pct: 40, color: "#22c55e" },
      { label: "Eating Out", pct: 30, color: "#f97316" },
      { label: "Entertainment", pct: 20, color: "#a855f7" },
      { label: "Transport", pct: 16, color: "#3b82f6" },
      { label: "Shopping", pct: 36, color: "#ec4899" },
    ];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">Monthly envelopes</p>
        <p className="mb-4 text-xs text-[#94a3b8]">Drag to reshape your plan — the sidebar stays in sync.</p>
        <div className="space-y-3">
          {CATS.map((c, i) => (
            <div key={c.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[#334155]">{c.label}</span>
                <span className="font-semibold text-[#0f172a]">${c.pct * 5}</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-[#f0f9ff]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Step 3 — chat preview
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-[#e0f2fe] bg-white p-5 shadow-sm"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748b]">MoneyTalkz AI</p>
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35, ease: EASE }}
          className="ml-8 rounded-2xl rounded-br-sm bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] px-3.5 py-2 text-sm text-white shadow-sm"
        >
          Can I afford dinner tonight?
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.35, ease: EASE }}
          className="mr-8 rounded-2xl rounded-bl-sm border border-[#e0f2fe] bg-[#f0f9ff] px-3.5 py-2.5 text-sm text-[#0f172a]"
        >
          A ~$22 meal looks workable, Alex. You&apos;ve got about <span className="font-semibold text-[#0891b2]">$180 envelope headroom</span> this week and $120 set aside for listed bills. Cooking would push you further — but tonight is a yes.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.75, duration: 0.35, ease: EASE }}
          className="ml-8 rounded-2xl rounded-br-sm bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] px-3.5 py-2 text-sm text-white shadow-sm"
        >
          Where can I cut back this month?
        </motion.div>
      </div>
    </motion.div>
  );
}
