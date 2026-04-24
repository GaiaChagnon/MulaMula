"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { verifyUser, ensureDemoAccount } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

export function LoginForm() {
  const router = useRouter();
  const { refreshData } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const ok = await verifyUser(username.trim(), password);
      if (ok) {
        refreshData();
        router.push("/dashboard");
      } else {
        setError("No account found with that username and password. Try signing up, or use the demo account below.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError(null);
    setLoading(true);
    try {
      await ensureDemoAccount();
      refreshData();
      router.push("/dashboard");
    } catch {
      setError("Could not start demo session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md rounded-2xl border border-[#e0f2fe] bg-white p-8 shadow-sm"
    >
      <h1 className="mb-1 text-2xl font-bold text-[#0f172a]">Welcome back</h1>
      <p className="mb-8 text-sm text-[#64748b]">Log in to your MulaMula account</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Username */}
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[#0f172a]"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="w-full rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all duration-150 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#0f172a]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all duration-150 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
          />
        </div>

        {/* Inline error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-xs text-[#94a3b8]">
        <div className="h-px flex-1 bg-[#e0f2fe]" />
        <span>or</span>
        <div className="h-px flex-1 bg-[#e0f2fe]" />
      </div>

      <button
        type="button"
        onClick={handleDemo}
        disabled={loading}
        className="mt-4 w-full rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] py-3 text-sm font-semibold text-[#0ea5e9] transition-all duration-150 hover:border-[#06b6d4] hover:bg-[#ecfeff] disabled:opacity-60"
      >
        Continue with the demo account
      </button>

      <p className="mt-6 text-center text-sm text-[#64748b]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#06b6d4] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
