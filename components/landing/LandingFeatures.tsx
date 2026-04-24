"use client";

import { motion } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: "Smart Budget",
    description:
      "Set spending envelopes per category. See exactly where your money goes.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    title: "AI Assistant",
    description:
      "Ask anything about your finances. Get instant, encouraging answers.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Goal Tracking",
    description:
      "Set savings goals, track progress, and get a personalized plan.",
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: EASE,
    },
  }),
};

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-block rounded-full border border-[#e0f2fe] bg-[#f0f9ff] px-3.5 py-1 text-xs font-medium text-[#0ea5e9]"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl"
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] bg-clip-text text-transparent">
              master your money
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-base text-[#64748b]"
          >
            Simple tools, honest numbers, zero judgment. Built for how students actually spend.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-[#e0f2fe] bg-white p-8 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#06b6d4] transition-colors duration-200 group-hover:bg-[#e0f2fe]">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold text-[#0f172a]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#64748b]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
