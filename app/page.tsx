import Link from "next/link";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingCTA } from "@/components/landing/LandingCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#e0f2fe] bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] shadow-sm shadow-cyan-500/20">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" opacity="0.35" />
                <path d="M7 10l2.5 2.5L14 7" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">
              Money<span className="text-[#06b6d4]">Talkz</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a] sm:block"
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[#e0f2fe] px-4 py-1.5 text-sm font-medium text-[#0f172a] transition-all duration-150 hover:border-[#06b6d4] hover:text-[#06b6d4]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingCTA />

      <footer className="border-t border-[#e0f2fe] bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-[#94a3b8] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MoneyTalkz. Demo project — not financial advice.</p>
          <p className="text-xs">Built with Next.js &middot; Tailwind &middot; OpenRouter</p>
        </div>
      </footer>
    </div>
  );
}
