"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { VoiceButton } from "@/components/VoiceButton";
import type { UserData } from "@/lib/mockData";
import type { Goal } from "@/lib/goals";

type Props = {
  userData: UserData | null;
  goals: Goal[];
};

type Msg = {
  role: "user" | "assistant";
  text: string;
  thought?: string;
  durationMs?: number;
};

const SUGGESTIONS = [
  "Budget left?",
  "How's my spending?",
  "Can I afford dinner?",
  "Weekly spending guide",
  "Where can I cut back?",
  "Month forecast",
];

const THOUGHT_STEPS = [
  "Reading your transactions…",
  "Tallying envelope totals…",
  "Checking remaining budget…",
  "Comparing to last month…",
  "Drafting a direct answer…",
];

const msgVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const VOICE_PREF_KEY = "mula_voice_on";

function pickGermanFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (voices.length === 0) return null;
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  const female =
    german.find((v) => /anna|petra|helga|katarina|hanna|marlene|klara|luise/i.test(v.name)) ||
    german.find((v) => /female/i.test(v.name)) ||
    german[0];
  return female || null;
}

function stripForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F9FF}\u2600-\u27BF]/gu, "")
    .replace(/\*+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ChatPanel({ userData, goals }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Servus. I'm your MulaMula assistant — direct, honest, a little German. Ask me anything about your budget, spending, or goals. I'll be blunt, ja?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [voiceListening, setVoiceListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speakingRef = useRef(false);
  const startRef = useRef<number>(0);

  // Load voice preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_PREF_KEY);
      if (saved === "1") setVoiceOn(true);
    } catch {}
  }, []);

  // Load voices on mount & when they change
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const refresh = () => {
      voiceRef.current = pickGermanFemaleVoice();
    };
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!voiceOn) return;
    const u = new SpeechSynthesisUtterance(stripForSpeech(text));
    u.lang = "de-DE";
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.98;
    u.pitch = 1.08;
    u.volume = 1;
    window.speechSynthesis.cancel();
    speakingRef.current = true;
    u.onend = () => {
      speakingRef.current = false;
    };
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Rotate thinking step label while loading
  useEffect(() => {
    if (!loading) {
      setThinkingStep(0);
      return;
    }
    const id = setInterval(() => {
      setThinkingStep((s) => (s + 1) % THOUGHT_STEPS.length);
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setError(null);
      setMessages((m) => [...m, { role: "user", text: trimmed }]);
      setInput("");
      setLoading(true);
      startRef.current = performance.now();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, userData, goals }),
        });
        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }
        const data = (await res.json()) as { reply?: string; intent?: string };
        const reply = typeof data.reply === "string" ? data.reply : "Something went wrong.";
        const durationMs = Math.max(1, Math.round(performance.now() - startRef.current));
        const thought = data.intent ? `Routed intent: ${data.intent.replace(/_/g, " ")} · ran engine calculations, composed a grounded reply.` : undefined;
        setMessages((m) => [...m, { role: "assistant", text: reply, thought, durationMs }]);
        speak(reply);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(`Failed to get a response: ${msg}`);
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Nein — connection problem. Try again, ja?" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, userData, goals, speak]
  );

  const toggleVoice = useCallback(() => {
    setVoiceOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(VOICE_PREF_KEY, next ? "1" : "0");
      } catch {}
      if (!next && typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      return next;
    });
  }, []);

  const currentThought = useMemo(() => THOUGHT_STEPS[thinkingStep], [thinkingStep]);

  return (
    <div className="flex flex-col rounded-2xl border border-[#e0f2fe] bg-white shadow-sm overflow-hidden h-full min-h-[480px]">
      {/* Header */}
      <div className="border-b border-[#e0f2fe] px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#06b6d4]" />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
              Finance Assistant
            </p>
          </div>
          <button
            type="button"
            onClick={toggleVoice}
            aria-pressed={voiceOn}
            title={voiceOn ? "Voice on (Deutsch) — click to mute" : "Voice off — click to hear replies in a German voice"}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
              voiceOn
                ? "border-[#06b6d4] bg-[#ecfeff] text-[#06b6d4]"
                : "border-[#e0f2fe] bg-white text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#06b6d4]"
            }`}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {voiceOn ? (
                <>
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
            {voiceOn ? "Deutsch" : "Mute"}
          </button>
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
              className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {msg.role === "assistant" ? (
                <div className="mr-6 flex max-w-[85%] flex-col gap-1.5">
                  {msg.thought && (
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-[#94a3b8] transition hover:text-[#06b6d4]">
                        <svg className="h-3 w-3 transition group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        Reasoned in {msg.durationMs ? `${(msg.durationMs / 1000).toFixed(1)}s` : "a moment"}
                      </summary>
                      <p className="mt-1 rounded-lg border border-dashed border-[#e0f2fe] bg-[#f8fafc] px-3 py-2 text-[11px] leading-relaxed text-[#64748b]">
                        {msg.thought}
                      </p>
                    </details>
                  )}
                  <div className="rounded-2xl rounded-bl-md border-l-2 border-[#06b6d4] bg-[#f0f9ff] px-4 py-3 text-sm text-[#0f172a] whitespace-pre-wrap shadow-sm">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="ml-6 max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] px-4 py-3 text-sm font-medium text-white shadow-sm">
                  {msg.text}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="thinking"
              variants={msgVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex justify-start"
            >
              <div className="mr-6 flex max-w-[85%] flex-col gap-1.5">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#e0f2fe] bg-[#f8fafc] px-3 py-1.5 text-[11px] text-[#64748b]">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#06b6d4]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentThought}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22 }}
                    >
                      {currentThought}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="rounded-2xl rounded-bl-md border-l-2 border-[#06b6d4] bg-[#f0f9ff] shadow-sm">
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
                </div>
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
          className="rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
