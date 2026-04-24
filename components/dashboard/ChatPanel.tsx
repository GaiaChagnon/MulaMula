"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { VoiceButton } from "@/components/VoiceButton";
import type { UserData } from "@/lib/mockData";
import type { Goal } from "@/lib/goals";

type Props = {
  userData: UserData | null;
  goals: Goal[];
};

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Budget left?",
  "How's my spending?",
  "Can I afford dinner?",
  "Weekly spending guide",
  "Where can I cut back?",
  "Month forecast",
];

const msgVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[#06b6d4]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

export function ChatPanel({ userData, goals }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! I'm your MulaMula assistant. Ask me anything about your budget, spending, or goals.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setError(null);
      setMessages((m) => [...m, { role: "user", text: trimmed }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, userData, goals }),
        });
        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }
        const data = (await res.json()) as { reply?: string };
        const reply = typeof data.reply === "string" ? data.reply : "Something went wrong.";
        setMessages((m) => [...m, { role: "assistant", text: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(`Failed to get a response: ${msg}`);
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Sorry, I couldn't connect. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, userData, goals]
  );

  return (
    <div className="flex flex-col rounded-2xl border border-[#e0f2fe] bg-white shadow-sm overflow-hidden h-full min-h-[480px]">
      {/* Header */}
      <div className="border-b border-[#e0f2fe] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#06b6d4]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            Finance Assistant
          </p>
        </div>
        {/* Suggestion chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              disabled={loading}
              className="rounded-full border border-[#e0f2fe] bg-[#f0f9ff] px-3 py-1 text-xs font-medium text-[#0ea5e9] transition hover:bg-[#e0f2fe] hover:border-[#06b6d4] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              variants={msgVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className={
                msg.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              {msg.role === "assistant" ? (
                <div className="mr-6 max-w-[85%] rounded-2xl rounded-bl-md border-l-2 border-[#06b6d4] bg-[#f0f9ff] px-4 py-3 text-sm text-[#0f172a] whitespace-pre-wrap shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="ml-6 max-w-[85%] rounded-2xl rounded-br-md bg-[#06b6d4] px-4 py-3 text-sm font-medium text-white shadow-sm">
                  {msg.text}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="typing"
              variants={msgVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex justify-start"
            >
              <div className="mr-6 rounded-2xl rounded-bl-md border-l-2 border-[#06b6d4] bg-[#f0f9ff] shadow-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Inline error */}
      {error && (
        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
          {error}
        </div>
      )}

      {/* Listening banner */}
      {voiceListening && (
        <div className="border-t border-[#e0f2fe] bg-[#f0f9ff] px-4 py-2 text-center text-xs text-[#06b6d4]">
          Listening… speak your question — will send when you stop.
        </div>
      )}

      {/* Input bar */}
      <form
        className="flex items-end gap-2 border-t border-[#e0f2fe] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          className="min-h-[44px] flex-1 rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] px-4 py-2 text-sm text-[#0f172a] outline-none placeholder:text-[#64748b] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition"
          placeholder="Ask about your money…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <VoiceButton
          disabled={loading}
          onListeningChange={setVoiceListening}
          onTranscript={(t) => {
            setInput(t);
            void send(t);
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-[#06b6d4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0ea5e9] disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
