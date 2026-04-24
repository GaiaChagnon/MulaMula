"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleNetwork } from "./ParticleNetwork";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const STATS = [
  { label: "Questions answered", value: "every one" },
  { label: "Bank connections", value: "zero" },
  { label: "Data leaves your device", value: "never" },
];

export function LandingHero() {
  function scrollToHowItWorks() {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-white pt-20">
      {/* Particle canvas — behind everything */}
      <div className="absolute inset-0 z-0">
        <ParticleNetwork />
      </div>

      {/* Soft white wash */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/50 via-white/30 to-white" />

      {/* Hero content */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-[#e0f2fe] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#0ea5e9] shadow-sm backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06b6d4] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4]" />
          </span>
          Student finance, reimagined
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-[#0f172a] sm:text-6xl lg:text-7xl"
        >
          Talk to Your{" "}
          <span className="bg-gradient-to-r from-[#06b6d4] via-[#0ea5e9] to-[#22d3ee] bg-clip-text text-transparent">
            Money
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#475569] sm:text-xl"
        >
          The AI finance co-pilot built for students. Import your transactions, set a plan that fits, and ask plain-English questions about every dollar.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Get Started Free
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
          <button
            onClick={scrollToHowItWorks}
            className="rounded-xl border border-[#e0f2fe] bg-white/80 px-7 py-3.5 text-base font-semibold text-[#0f172a] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            See how it works
          </button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={itemVariants}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-[#e0f2fe] bg-white/70 px-4 py-5 backdrop-blur-sm sm:gap-10 sm:px-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-left sm:text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] sm:text-xs">
                {stat.label}
              </p>
              <p className="mt-1 text-base font-bold text-[#0f172a] sm:text-lg">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[#94a3b8]"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest"
        >
          <span>Scroll</span>
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
