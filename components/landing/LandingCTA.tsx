"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#e0f2fe] bg-gradient-to-br from-[#ecfeff] via-white to-[#f0f9ff] px-8 py-14 text-center shadow-sm sm:px-14 sm:py-20"
      >
        {/* Decorative blur */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#22d3ee]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-[#0ea5e9]/15 blur-3xl" />

        <span className="relative inline-block rounded-full border border-[#e0f2fe] bg-white px-3.5 py-1 text-xs font-medium text-[#0ea5e9]">
          Ready when you are
        </span>

        <h2 className="relative mt-5 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
          Your money, finally{" "}
          <span className="bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] bg-clip-text text-transparent">
            on your side
          </span>
          .
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base text-[#64748b]">
          Stop guessing. Start asking. Sign up in under a minute — no credit card, no bank login, no data leaving your browser.
        </p>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
          >
            Create your plan
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#e0f2fe] bg-white px-8 py-3.5 text-base font-semibold text-[#0f172a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            Try the demo account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
