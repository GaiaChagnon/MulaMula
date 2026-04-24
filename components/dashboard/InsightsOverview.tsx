"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserData } from "@/lib/mockData";
import type { Goal } from "@/lib/goals";

type Props = {
  userData: UserData | null;
  goals: Goal[];
};

const PROMPT =
  "Give me a crisp executive summary of my financial situation right now: where I'm bleeding money, where I'm winning, the single biggest risk this month, and the one thing I should change first. Keep it under 140 words total, 3–4 tight paragraphs or bullets.";

function cleanReply(text: string): string {
  return text
    .replace(/\\\$/g, "$")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(?<!\w)[*_](?=\S)|(?<=\S)[*_](?!\w)/g, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function InsightsOverview({ userData, goals }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fired = useRef(false);
  const [tick, setTick] = useState(0);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: PROMPT, userData, goals }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      const raw = typeof data.reply === "string" ? data.reply : "";
      setText(cleanReply(raw) || "Greta has nothing to say right now.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-[#bae6fd] bg-gradient-to-br from-[#ecfeff] via-white to-[#f0f9ff] p-5 shadow-sm"
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#22d3ee]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#0ea5e9]/15 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] text-white shadow-sm shadow-cyan-500/25">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.64 5.64l1.42 1.42M16.95 16.95l1.41 1.41M5.64 18.36l1.42-1.42M16.95 7.05l1.41-1.41" /><circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" /></svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0891b2]">
              Greta&rsquo;s take
            </p>
            <p className="text-xs text-[#64748b]">AI-generated overview of your numbers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setTick((t) => t + 1);
            void load();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-[#e0f2fe] bg-white px-3 py-1 text-xs font-semibold text-[#0ea5e9] transition hover:border-[#06b6d4] hover:bg-[#ecfeff] disabled:opacity-50"
          aria-label="Regenerate insights"
        >
          <svg className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
          {loading ? "Reading…" : "Refresh"}
        </button>
      </div>

      <div className="relative mt-4 min-h-[88px]">
        <AnimatePresence mode="wait">
          {loading && !text && (
            <motion.div
              key={`load-${tick}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              {[70, 90, 60].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-3 rounded-full bg-gradient-to-r from-[#e0f2fe] via-[#bae6fd] to-[#e0f2fe]"
                  style={{ width: `${w}%` }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </motion.div>
          )}

          {text && !err && (
            <motion.p
              key={`text-${tick}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="whitespace-pre-wrap text-sm leading-relaxed text-[#0f172a]"
            >
              {text}
            </motion.p>
          )}

          {err && (
            <motion.p
              key={`err-${tick}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-rose-600"
            >
              Couldn&apos;t load insights: {err}. Click Refresh to try again.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
