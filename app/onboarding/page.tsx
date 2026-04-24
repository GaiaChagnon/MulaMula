import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f0f9ff] to-white">
      {/* Top bar */}
      <header className="border-b border-[#e0f2fe] bg-white/80 px-6 py-4 backdrop-blur-sm sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#0f172a]"
          >
            Mula<span className="text-[#06b6d4]">Mula</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-[#64748b] transition-colors hover:text-[#06b6d4]"
          >
            Already have an account?
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10 sm:px-10">
        <OnboardingFlow />
      </main>
    </div>
  );
}
