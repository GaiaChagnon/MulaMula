"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerUser } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

export function SignupForm() {
  const router = useRouter();
  const { refreshData } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (username.trim().length < 2) {
      return "Username must be at least 2 characters.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords don't match.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerUser(username.trim(), password);
      refreshData();
      router.push("/onboarding");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
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
      <h1 className="mb-1 text-2xl font-bold text-[#0f172a]">Create account</h1>
      <p className="mb-8 text-sm text-[#64748b]">
        Start your journey to smarter student finances
      </p>

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
            placeholder="Choose a username"
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all duration-150 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
          />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[#0f172a]"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748b]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#06b6d4] hover:underline"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
