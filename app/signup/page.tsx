import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f0f9ff] to-white px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#22d3ee]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-[#0ea5e9]/15 blur-3xl" />

      <Link
        href="/"
        className="relative mb-10 flex items-center gap-2 text-xl font-bold tracking-tight text-[#0f172a]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] shadow-sm shadow-cyan-500/20">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10l2.5 2.5L14 7" />
          </svg>
        </span>
        Money<span className="text-[#06b6d4]">Talkz</span>
      </Link>

      <div className="relative w-full max-w-md">
        <SignupForm />
      </div>

      <Link
        href="/"
        className="relative mt-8 text-sm text-[#64748b] transition-colors hover:text-[#06b6d4]"
      >
        &larr; Back home
      </Link>
    </main>
  );
}
